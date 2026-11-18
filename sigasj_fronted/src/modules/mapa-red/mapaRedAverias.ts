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
  /** Punto visual en San Juan derivado de sector + dirección. */
  coords: AveriaMapaCoords | null
  /** Siempre por dirección/sector (sin GPS). */
  coordsSource: 'sector' | null
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
  ubicacion?: string,
): SectorId | null => {
  const normalized = normalizeSectorText(sectorComunidad)
  const fromUbicacion = normalizeSectorText(ubicacion ?? '')
  const candidatesText = [normalized, fromUbicacion].filter(Boolean)

  const sectorCandidates = (sectorId: SectorId, nombre: string) => {
    const aliases = SECTOR_ALIASES[sectorId] ?? []
    return [
      normalizeSectorText(nombre),
      normalizeSectorText(nombre.replace(/^Sector\s+/i, '')),
      ...aliases,
    ].filter(Boolean)
  }

  // 1) Coincidencia exacta (sector o ubicación).
  for (const text of candidatesText) {
    for (const sector of SECTORES_CATALOGO) {
      if (sectorCandidates(sector.id, sector.nombre).includes(text)) {
        return sector.id
      }
    }
  }

  // 2) Coincidencia parcial: gana el alias más específico (más largo).
  let best: { id: SectorId; score: number } | null = null
  for (const text of candidatesText) {
    for (const sector of SECTORES_CATALOGO) {
      for (const alias of sectorCandidates(sector.id, sector.nombre)) {
        if (alias.length < 4) continue
        if (!(text.includes(alias) || alias.includes(text))) continue
        const score = alias.length
        if (!best || score > best.score) {
          best = { id: sector.id, score }
        }
      }
    }
  }
  if (best) return best.id

  // Comunidad genérica de la ASADA → casco / plaza.
  if (normalized === 'san juan' || fromUbicacion.includes('san juan')) {
    return 'centro'
  }

  return null
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
    coords: null,
    coordsSource: null,
    sectorId: matchSectorIdFromComunidad(item.sectorComunidad, item.ubicacion),
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
 * Anclas por sector dentro del casco de San Juan.
 * Offsets cortos (~80–350 m) para no salir del pueblo.
 */
const SECTOR_MAP_BASE: Record<SectorId, AveriaMapaCoords> = {
  centro: { lat: 0.00055, lng: -0.0002 },
  'las-palmas': { lat: 0.00035, lng: 0.00215 },
  norte: { lat: 0.00205, lng: -0.00055 },
  'el-cruce': { lat: -0.00185, lng: 0.00155 },
  'la-esperanza': { lat: -0.00145, lng: -0.00205 },
}

/** Centro visual de un sector (enfocar el mapa al seleccionarlo). */
export const getDemoSectorCenter = (sectorId: SectorId): AveriaMapaCoords => {
  const base = SECTOR_MAP_BASE[sectorId]
  return {
    lat: MAPA_RED_CENTER[0] + base.lat,
    lng: MAPA_RED_CENTER[1] + base.lng,
  }
}

const hashText = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * Punto de mapa a partir de sector + ubicación específica (sin GPS).
 * Misma ubicación → mismo punto; distintas direcciones se separan dentro del sector.
 */
export const coordsFromSectorUbicacion = (
  item: Pick<AveriaMapaItem, 'id' | 'sectorId' | 'ubicacion'>,
  indexInSector = 0,
): AveriaMapaCoords => {
  const base = item.sectorId
    ? SECTOR_MAP_BASE[item.sectorId]
    : { lat: 0.0008, lng: 0.0009 }
  const seed = hashText(`${item.ubicacion.trim().toLowerCase()}|${item.id}`)
  const angle =
    ((seed % 360) / 360) * Math.PI * 2 + indexInSector * 0.62 + (item.id % 7) * 0.18
  const radius = 0.0002 + ((seed >> 7) % 5) * 0.00011 + (indexInSector % 3) * 0.00008
  return {
    lat: MAPA_RED_CENTER[0] + base.lat + Math.sin(angle) * radius,
    lng: MAPA_RED_CENTER[1] + base.lng + Math.cos(angle) * radius,
  }
}

/**
 * Coloca todas las averías en San Juan usando solo sector + dirección textual.
 * No usa latitud/longitud del reporte.
 */
export const applySectorUbicacionGeoAverias = (
  items: AveriaMapaItem[],
): AveriaMapaItem[] => {
  const sectorCursor = new Map<string, number>()

  return items.map((item) => {
    const key = item.sectorId ?? `id:${item.id}`
    const indexInSector = sectorCursor.get(key) ?? 0
    sectorCursor.set(key, indexInSector + 1)
    return {
      ...item,
      coords: coordsFromSectorUbicacion(item, indexInSector),
      coordsSource: 'sector',
    }
  })
}

/** @deprecated Usar applySectorUbicacionGeoAverias. */
export const applyDemoGeoAverias = (
  items: AveriaMapaItem[],
  enabled: boolean,
): AveriaMapaItem[] => (enabled ? applySectorUbicacionGeoAverias(items) : items)
