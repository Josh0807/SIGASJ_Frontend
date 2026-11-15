import type { AveriaListItem } from '../averias/admin/types'
import { ESTADO_AVERIA_LABELS, type EstadoAveria } from '../averias/admin/estadoAveria'
import { AVERIAS_ADMIN_PATH } from '../averias/admin/averiasAdminPaths'
import {
  MAPA_RED_CENTER,
  SECTORES_CATALOGO,
  type SectorId,
} from './mapaRedGeo'

/** Estados abiertos según transiciones del backend (no RESUELTA / CANCELADA). */
export const ESTADOS_AVERIA_ACTIVOS = [
  'RECIBIDA',
  'EN_REVISION',
  'ASIGNADA',
  'PENDIENTE',
  'EN_ATENCION',
] as const satisfies readonly EstadoAveria[]

export type EstadoAveriaActivo = (typeof ESTADOS_AVERIA_ACTIVOS)[number]

export type AveriaMapaCoords = {
  lat: number
  lng: number
}

export type AveriaMapaItem = {
  id: number
  codigoSeguimiento: string
  estado: string
  estadoLabel: string
  prioridad: string | null
  descripcion: string
  ubicacion: string
  sectorComunidad: string
  fechaReporte: string
  /** Solo si el backend envía coordenadas válidas. */
  coords: AveriaMapaCoords | null
  /** Relación textual con catálogo de sectores (puede ser null). */
  sectorId: SectorId | null
  detailPath: string
}

const SECTOR_ALIASES: Record<SectorId, string[]> = {
  centro: ['centro', 'sector centro'],
  'las-palmas': ['las palmas', 'sector las palmas', 'palmas'],
  norte: ['norte', 'sector norte', 'barrio norte'],
  'el-cruce': ['el cruce', 'sector el cruce', 'cruce'],
  'la-esperanza': ['la esperanza', 'sector la esperanza', 'esperanza'],
}

const normalizeSectorText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Relaciona `sectorComunidad` textual con el catálogo GIS (sin inventar geometría). */
export const matchSectorIdFromComunidad = (
  sectorComunidad: string,
): SectorId | null => {
  const normalized = normalizeSectorText(sectorComunidad)
  if (!normalized) return null

  for (const sector of SECTORES_CATALOGO) {
    const aliases = SECTOR_ALIASES[sector.id] ?? []
    const candidates = [
      normalizeSectorText(sector.nombre),
      normalizeSectorText(sector.nombre.replace(/^Sector\s+/i, '')),
      ...aliases,
    ]
    if (candidates.some((alias) => alias && normalized === alias)) {
      return sector.id
    }
    if (
      candidates.some(
        (alias) =>
          alias.length >= 4 &&
          (normalized.includes(alias) || alias.includes(normalized)),
      )
    ) {
      return sector.id
    }
  }

  return null
}

/**
 * Lee coordenadas solo si vienen en el payload.
 * Hoy Averia no persiste lat/lng; esto prepara el mapa sin inventar puntos.
 */
export const extractAveriaCoords = (
  item: AveriaListItem & Record<string, unknown>,
): AveriaMapaCoords | null => {
  const latRaw = item.latitud ?? item.latitude ?? item.lat
  const lngRaw = item.longitud ?? item.longitude ?? item.lng ?? item.lon
  const lat = typeof latRaw === 'number' ? latRaw : Number(latRaw)
  const lng = typeof lngRaw === 'number' ? lngRaw : Number(lngRaw)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  // Costa Rica aproximada: evita basura numérica
  if (lat < 7 || lat > 12 || lng > -82 || lng < -87) return null

  return { lat, lng }
}

export const toAveriaMapaItem = (item: AveriaListItem): AveriaMapaItem => {
  const estado = String(item.estado ?? '')
  const estadoLabel =
    ESTADO_AVERIA_LABELS[estado as EstadoAveria] ?? (estado || 'Sin estado')

  return {
    id: item.id,
    codigoSeguimiento: item.codigoSeguimiento,
    estado,
    estadoLabel,
    prioridad: item.prioridad,
    descripcion: item.descripcion,
    ubicacion: item.ubicacion,
    sectorComunidad: item.sectorComunidad,
    fechaReporte: item.fechaReporte,
    coords: extractAveriaCoords(item as AveriaListItem & Record<string, unknown>),
    sectorId: matchSectorIdFromComunidad(item.sectorComunidad),
    detailPath: `${AVERIAS_ADMIN_PATH}/${item.id}`,
  }
}

export const isEstadoAveriaActivo = (estado: string): estado is EstadoAveriaActivo =>
  (ESTADOS_AVERIA_ACTIVOS as readonly string[]).includes(estado)

export const filterAveriasBySector = (
  items: AveriaMapaItem[],
  sectorId: SectorId,
): AveriaMapaItem[] => items.filter((item) => item.sectorId === sectorId)

export const countAveriasBySector = (
  items: AveriaMapaItem[],
): Record<SectorId, number> => {
  const counts = Object.fromEntries(
    SECTORES_CATALOGO.map((s) => [s.id, 0]),
  ) as Record<SectorId, number>

  for (const item of items) {
    if (item.sectorId) counts[item.sectorId] += 1
  }
  return counts
}

export const formatFechaReporte = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

/**
 * Solo para pruebas visuales (`?demoGeo=1`).
 * No sustituye coordenadas reales validadas por la ASADA.
 */
const DEMO_OFFSETS: AveriaMapaCoords[] = [
  { lat: 0.00135, lng: 0.0011 },
  { lat: 0.00095, lng: -0.00145 },
  { lat: -0.00115, lng: 0.00085 },
  { lat: -0.00075, lng: -0.0012 },
  { lat: 0.00155, lng: -0.00035 },
  { lat: -0.0014, lng: 0.00135 },
  { lat: 0.00045, lng: 0.00165 },
  { lat: 0.0011, lng: -0.00095 },
]

export const applyDemoGeoAverias = (
  items: AveriaMapaItem[],
  enabled: boolean,
): AveriaMapaItem[] => {
  if (!enabled) return items
  return items.map((item, index) => {
    if (item.coords) return item
    const offset = DEMO_OFFSETS[index % DEMO_OFFSETS.length]
    return {
      ...item,
      coords: {
        lat: MAPA_RED_CENTER[0] + offset.lat,
        lng: MAPA_RED_CENTER[1] + offset.lng,
      },
    }
  })
}
