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
  /** Origen del punto: real del reporte o demo de visualización. */
  coordsSource: 'real' | 'demo' | null
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
 * Lee coordenadas solo si vienen en el payload del backend.
 * No inventa puntos desde la dirección textual.
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
  const coords = extractAveriaCoords(
    item as AveriaListItem & Record<string, unknown>,
  )

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
    coords,
    coordsSource: coords ? 'real' : null,
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
 * Anclas demo por sector DENTRO del casco de San Juan (plaza / iglesia / cuadrante).
 * Offsets cortos (~80–350 m) para no salir del pueblo. Solo visualización.
 *
 * Referencia: centro ASADA = plaza de deportes / casco (MAPA_RED_CENTER).
 */
const SECTOR_DEMO_BASE: Record<SectorId, AveriaMapaCoords> = {
  // Casco / plaza / iglesia
  centro: { lat: 0.00055, lng: -0.0002 },
  // Este del cuadrante
  'las-palmas': { lat: 0.00035, lng: 0.00215 },
  // Norte hacia la iglesia / salida norte
  norte: { lat: 0.00205, lng: -0.00055 },
  // Sur-este del cruce principal
  'el-cruce': { lat: -0.00185, lng: 0.00155 },
  // Oeste / suroeste del casco
  'la-esperanza': { lat: -0.00145, lng: -0.00205 },
}

/** Centro visual demo de un sector (para enfocar el mapa al seleccionarlo). */
export const getDemoSectorCenter = (sectorId: SectorId): AveriaMapaCoords => {
  const base = SECTOR_DEMO_BASE[sectorId]
  return {
    lat: MAPA_RED_CENTER[0] + base.lat,
    lng: MAPA_RED_CENTER[1] + base.lng,
  }
}

const demoCoordsForAveria = (
  item: AveriaMapaItem,
  indexInSector: number,
): AveriaMapaCoords => {
  const base = item.sectorId
    ? SECTOR_DEMO_BASE[item.sectorId]
    : { lat: 0.0008, lng: 0.0009 }
  // Espiral corta: separa pines sin sacar el punto de San Juan.
  const angle = indexInSector * 2.2 + (item.id % 11) * 0.37
  const radius = 0.00028 + (indexInSector % 4) * 0.00018
  return {
    lat: MAPA_RED_CENTER[0] + base.lat + Math.sin(angle) * radius,
    lng: MAPA_RED_CENTER[1] + base.lng + Math.cos(angle) * radius,
  }
}

/**
 * Asigna coordenadas de visualización a averías activas sin lat/lng.
 * Conserva coords reales del reporte; solo inventa demo para las que faltan.
 */
export const applyDemoGeoAverias = (
  items: AveriaMapaItem[],
  enabled: boolean,
): AveriaMapaItem[] => {
  if (!enabled) return items
  const sectorCursor = new Map<string, number>()

  return items.map((item) => {
    if (item.coords && item.coordsSource === 'real') return item
    if (item.coords && item.coordsSource == null) {
      return { ...item, coordsSource: 'real' }
    }
    const key = item.sectorId ?? `id:${item.id}`
    const indexInSector = sectorCursor.get(key) ?? 0
    sectorCursor.set(key, indexInSector + 1)
    return {
      ...item,
      coords: demoCoordsForAveria(item, indexInSector),
      coordsSource: 'demo',
    }
  })
}

/** true cuando todos los pines visibles son inventados (ninguno trae GPS real). */
export const areAllAveriasDemoGeo = (items: AveriaMapaItem[]): boolean => {
  const withCoords = items.filter((item) => item.coords != null)
  if (withCoords.length === 0) return false
  return withCoords.every((item) => item.coordsSource === 'demo')
}
