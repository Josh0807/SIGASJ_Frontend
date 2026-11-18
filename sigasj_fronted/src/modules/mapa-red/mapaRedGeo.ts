/**
 * Modelo geoespacial del mapa de red SIGASJ.
 *
 * - Centro comunitario: coordenadas públicas de contacto ASADA (San Juan, Santa Cruz).
 * - Capas de infraestructura: FeatureCollections vacías listas para GeoJSON validado.
 * - No se inventan polígonos, tuberías ni nodos georreferenciados.
 */

import { DEFAULT_CONTACTO_UBICACION } from '../contacto/services/contactoApi'

export type SectorId =
  | 'norte'
  | 'las-palmas'
  | 'centro'
  | 'el-cruce'
  | 'la-esperanza'

export type InfraTipo = 'tuberia' | 'valvula' | 'hidrante' | 'tanque'

export type SectorCatalogo = {
  id: SectorId
  nombre: string
  /** Color UI para chips/leyenda; no implica geometría. */
  color: string
  /** Límite geográfico validado (null = aún no disponible). */
  limiteGeoJson: GeoJSON.Polygon | GeoJSON.MultiPolygon | null
  /** Métricas de infraestructura desde backend (null = sin registro). */
  tuberiaKm: number | null
  valvulas: number | null
  hidrantes: number | null
  tanques: number | null
  asociados: number | null
  /** Solo si hay mediciones verificadas. */
  presionPsi: number | null
  estadoRed: string | null
  imagenUrl: string | null
}

export type InfraPointProperties = {
  id: string
  tipo: Exclude<InfraTipo, 'tuberia'>
  sectorId: SectorId | null
  etiqueta: string
}

export type InfraLineProperties = {
  id: string
  tipo: 'tuberia'
  sectorId: SectorId | null
  material: string | null
  diametroMm: number | null
  etiqueta: string
}

/** Centro de la comunidad (referencia pública ASADA, no infraestructura sensible). */
export const MAPA_RED_CENTER: [number, number] = [
  DEFAULT_CONTACTO_UBICACION.latitud,
  DEFAULT_CONTACTO_UBICACION.longitud,
]

/** Zoom cercano para apreciar casas y vegetación en satélite/híbrido. */
export const MAPA_RED_DEFAULT_ZOOM = 17

/** Impide alejarse del casco de San Juan. */
export const MAPA_RED_MIN_ZOOM = 15
export const MAPA_RED_MAX_ZOOM = 19

/**
 * Ventana geográfica alrededor de San Juan (no permite panear fuera del pueblo).
 * ~±0.028° ≈ 3 km alrededor del centro ASADA.
 */
const MAPA_RED_BOUNDS_PAD = 0.028

export const MAPA_RED_MAX_BOUNDS: [[number, number], [number, number]] = [
  [
    MAPA_RED_CENTER[0] - MAPA_RED_BOUNDS_PAD,
    MAPA_RED_CENTER[1] - MAPA_RED_BOUNDS_PAD,
  ],
  [
    MAPA_RED_CENTER[0] + MAPA_RED_BOUNDS_PAD,
    MAPA_RED_CENTER[1] + MAPA_RED_BOUNDS_PAD,
  ],
]

/**
 * Catálogo operativo de sectores conocidos por la ASADA.
 * Sin geometrías ni cifras inventadas hasta validación GIS / backend.
 */
export const SECTORES_CATALOGO: SectorCatalogo[] = [
  {
    id: 'centro',
    nombre: 'Sector Centro',
    color: '#7c3aed',
    limiteGeoJson: null,
    tuberiaKm: null,
    valvulas: null,
    hidrantes: null,
    tanques: null,
    asociados: null,
    presionPsi: null,
    estadoRed: null,
    imagenUrl: null,
  },
  {
    id: 'las-palmas',
    nombre: 'Sector Las Palmas',
    color: '#ca8a04',
    limiteGeoJson: null,
    tuberiaKm: null,
    valvulas: null,
    hidrantes: null,
    tanques: null,
    asociados: null,
    presionPsi: null,
    estadoRed: null,
    imagenUrl: null,
  },
  {
    id: 'norte',
    nombre: 'Sector Norte',
    color: '#16a34a',
    limiteGeoJson: null,
    tuberiaKm: null,
    valvulas: null,
    hidrantes: null,
    tanques: null,
    asociados: null,
    presionPsi: null,
    estadoRed: null,
    imagenUrl: null,
  },
  {
    id: 'el-cruce',
    nombre: 'Sector El Cruce',
    color: '#0d9488',
    limiteGeoJson: null,
    tuberiaKm: null,
    valvulas: null,
    hidrantes: null,
    tanques: null,
    asociados: null,
    presionPsi: null,
    estadoRed: null,
    imagenUrl: null,
  },
  {
    id: 'la-esperanza',
    nombre: 'Sector La Esperanza',
    color: '#dc2626',
    limiteGeoJson: null,
    tuberiaKm: null,
    valvulas: null,
    hidrantes: null,
    tanques: null,
    asociados: null,
    presionPsi: null,
    estadoRed: null,
    imagenUrl: null,
  },
]

/** Capas GeoJSON — rellenar solo con datos validados. */
export const TUBERIAS_GEOJSON: GeoJSON.FeatureCollection<
  GeoJSON.LineString | GeoJSON.MultiLineString,
  InfraLineProperties
> = {
  type: 'FeatureCollection',
  features: [],
}

export const VALVULAS_GEOJSON: GeoJSON.FeatureCollection<
  GeoJSON.Point,
  InfraPointProperties
> = {
  type: 'FeatureCollection',
  features: [],
}

export const HIDRANTES_GEOJSON: GeoJSON.FeatureCollection<
  GeoJSON.Point,
  InfraPointProperties
> = {
  type: 'FeatureCollection',
  features: [],
}

export const TANQUES_GEOJSON: GeoJSON.FeatureCollection<
  GeoJSON.Point,
  InfraPointProperties
> = {
  type: 'FeatureCollection',
  features: [],
}

export const sectorPorId = (id: SectorId): SectorCatalogo => {
  const found = SECTORES_CATALOGO.find((s) => s.id === id)
  if (!found) {
    throw new Error(`Sector desconocido: ${id}`)
  }
  return found
}

export const buscarSectores = (query: string): SectorCatalogo[] => {
  const q = query.trim().toLowerCase()
  if (!q) return SECTORES_CATALOGO
  return SECTORES_CATALOGO.filter((s) => s.nombre.toLowerCase().includes(q))
}

export const countInfraFeatures = () =>
  TUBERIAS_GEOJSON.features.length +
  VALVULAS_GEOJSON.features.length +
  HIDRANTES_GEOJSON.features.length +
  TANQUES_GEOJSON.features.length

export const hasValidatedSectorBoundaries = () =>
  SECTORES_CATALOGO.some((s) => s.limiteGeoJson != null)

export const hasGeoInfrastructure = () => countInfraFeatures() > 0
