import { getActividadesAdmin } from '../../actividades-fontanero/services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../../actividades-fontanero/types/actividadFontaneroApi'
import { normalizeActividadFontanero } from '../../actividades-fontanero/utils/normalizeActividadFontanero'
import { getAdminAverias } from '../../averias/services/averiasAdminApi'
import { getFontaneroAverias } from '../../averias/services/averiasFontaneroApi'
import type { AveriaListItem } from '../../averias/admin/types'
import type { AveriaFontaneroListItem } from '../../averias/fontanero/types'
import { fetchWithAuth } from '../../../services/http/httpClient'
import type { ActivityItem, AlertItem } from '../props'

export type DashboardSummaryData = {
  abonadosActivos?: number | string | null
  lecturasPendientes?: number | string | null
  averiasReportadas?: number | string | null
  solicitudesEnTramite?: number | string | null
}

export type ModuleSummaryMetric = {
  key: keyof DashboardSummaryData
  value: number | string | null
}

export type DashboardOperationsScope = 'admin' | 'fontanero'

/** Estados que siguen requiriendo atención. No incluye RESUELTA ni CANCELADA. */
const ESTADOS_AVERIA_ABIERTOS = [
  'RECIBIDA',
  'EN_REVISION',
  'ASIGNADA',
  'EN_ATENCION',
  'PENDIENTE',
] as const

const isOpenAveriaEstado = (estado: string): boolean =>
  ESTADOS_AVERIA_ABIERTOS.includes(
    estado.trim().toUpperCase() as (typeof ESTADOS_AVERIA_ABIERTOS)[number],
  )

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const readList = (raw: unknown, keys: string[]): unknown[] => {
  if (Array.isArray(raw)) {
    return raw
  }
  const record = asRecord(raw)
  if (!record) {
    return []
  }
  for (const key of keys) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[]
    }
  }
  return []
}

const formatRelativeTime = (iso: string | null | undefined): string => {
  if (!iso) {
    return ''
  }
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))
  if (minutes < 1) {
    return 'Hace un momento'
  }
  if (minutes < 60) {
    return `Hace ${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`
  }
  const days = Math.floor(hours / 24)
  return days === 1 ? 'Hace 1 día' : `Hace ${days} días`
}

const toAlertUrgency = (prioridad: string | null | undefined): AlertItem['urgency'] => {
  const value = (prioridad ?? '').trim().toUpperCase()
  if (value === 'ALTA' || value === 'URGENTE') {
    return 'alta'
  }
  if (value === 'MEDIA') {
    return 'media'
  }
  return 'baja'
}

const toReadableAveriaTitle = (
  descripcion: string,
  codigo: string,
  sector: string,
): string => {
  const text = descripcion.trim()
  if (/[a-zA-ZáéíóúñÁÉÍÓÚÑ]{3,}/.test(text)) {
    return text
  }
  if (sector.trim()) {
    return `Reporte en ${sector.trim()}`
  }
  return codigo
}

const toAveriaLocation = (sector: string, ubicacion: string): string => {
  const parts = [sector.trim(), ubicacion.trim()].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : 'Sin ubicación'
}

const toDisplayName = (name: string): string =>
  name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(^|\s)\S/g, (chunk) => chunk.toUpperCase())

const toAlertFromAdmin = (item: AveriaListItem): AlertItem => ({
  id: String(item.id),
  code: item.codigoSeguimiento,
  title: toReadableAveriaTitle(
    item.descripcion,
    item.codigoSeguimiento,
    item.sectorComunidad,
  ),
  location: toAveriaLocation(item.sectorComunidad, item.ubicacion),
  urgency: toAlertUrgency(item.prioridad),
  timeAgo: formatRelativeTime(item.fechaReporte),
})

const toAlertFromFontanero = (item: AveriaFontaneroListItem): AlertItem => ({
  id: String(item.id),
  code: item.codigoSeguimiento,
  title: toReadableAveriaTitle(
    item.descripcion,
    item.codigoSeguimiento,
    item.sectorComunidad,
  ),
  location: toAveriaLocation(item.sectorComunidad, item.ubicacion),
  urgency: toAlertUrgency(item.prioridad),
  timeAgo: formatRelativeTime(item.fechaAsignacion),
})

const toActivityItem = (item: ActividadFontaneroRegistrada): ActivityItem => ({
  id: String(item.id),
  user: toDisplayName(item.fontaneroNombre?.trim() || 'Fontanero'),
  action: 'registró',
  target: item.titulo.trim() || item.tipoActividadNombre.trim() || 'actividad',
  timeAgo: formatRelativeTime(item.fechaActividad || item.createdAt),
  icon: 'reportes',
})

/**
 * Resumen agregado opcional. El Backend no expone `/dashboard/summary`;
 * las pruebas pueden mockear esta función. La carga real va por módulo.
 */
export async function getDashboardSummary(): Promise<DashboardSummaryData> {
  return {}
}

/**
 * Asociados activos = usuarios persistidos con rol ABONADO y activo.
 * No hay padrón de abonados aparte en el Backend.
 */
export async function getAbonadosSummaryMetric(): Promise<ModuleSummaryMetric> {
  try {
    const raw = await fetchWithAuth<unknown>('/usuarios')
    const rows = readList(raw, ['data'])
    const count = rows.filter((row) => {
      const item = asRecord(row)
      if (!item) {
        return false
      }
      const rol = String(item.rol ?? '').trim().toUpperCase()
      if (rol !== 'ABONADO') {
        return false
      }
      return item.activo !== false
    }).length
    return { key: 'abonadosActivos', value: count }
  } catch {
    return { key: 'abonadosActivos', value: null }
  }
}

/**
 * No existe módulo de lecturas en el Backend. N/D, sin inventar cifras.
 */
export async function getLecturasSummaryMetric(): Promise<ModuleSummaryMetric> {
  try {
    const data = await fetchWithAuth<{ pendientes?: number | string }>('/lecturas/resumen')
    return { key: 'lecturasPendientes', value: data.pendientes ?? null }
  } catch {
    return { key: 'lecturasPendientes', value: null }
  }
}

export async function getAveriasSummaryMetric(): Promise<ModuleSummaryMetric> {
  try {
    const results = await Promise.allSettled(
      ESTADOS_AVERIA_ABIERTOS.map((estado) =>
        getAdminAverias({ page: 1, limit: 1, estado }),
      ),
    )
    const totals = results.flatMap((result) =>
      result.status === 'fulfilled' && typeof result.value.total === 'number'
        ? [result.value.total]
        : [],
    )
    if (totals.length === 0) {
      return { key: 'averiasReportadas', value: null }
    }
    return {
      key: 'averiasReportadas',
      value: totals.reduce((sum, total) => sum + total, 0),
    }
  } catch {
    return { key: 'averiasReportadas', value: null }
  }
}

export async function getSolicitudesSummaryMetric(): Promise<ModuleSummaryMetric> {
  try {
    const raw = await fetchWithAuth<unknown>('/solicitudes/aprobadas-pendientes')
    return { key: 'solicitudesEnTramite', value: readList(raw, ['solicitudes']).length }
  } catch {
    return { key: 'solicitudesEnTramite', value: null }
  }
}

export async function getRecentDashboardAlerts(
  scope: DashboardOperationsScope,
): Promise<AlertItem[]> {
  if (scope === 'fontanero') {
    const listado = await getFontaneroAverias()
    return asArray(listado.data)
      .filter((row): row is AveriaFontaneroListItem => Boolean(asRecord(row)))
      .filter((item) => isOpenAveriaEstado(String(item.estado ?? '')))
      .slice(0, 5)
      .map(toAlertFromFontanero)
  }

  const listado = await getAdminAverias({ page: 1, limit: 20 })
  return asArray(listado.data)
    .filter((row): row is AveriaListItem => Boolean(asRecord(row)))
    .filter((item) => isOpenAveriaEstado(String(item.estado ?? '')))
    .slice(0, 5)
    .map(toAlertFromAdmin)
}

export async function getRecentDashboardActivities(
  scope: DashboardOperationsScope,
): Promise<ActivityItem[]> {
  if (scope === 'fontanero') {
    const raw = await fetchWithAuth<unknown>('/fontanero/actividades')
    return readList(raw, ['data', 'actividades'])
      .map(normalizeActividadFontanero)
      .filter((item): item is ActividadFontaneroRegistrada => item !== null)
      .slice(0, 5)
      .map(toActivityItem)
  }

  const listado = await getActividadesAdmin({ page: 1, limit: 5 })
  return listado.data.slice(0, 5).map(toActivityItem)
}
