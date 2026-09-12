import type { EstadoAveria } from './estadoAveria'

/** Coincide con `AveriaAdminFontanero` del Backend 2.2.1. `nombre` es opcional: Usuario aún no lo expone. */
export type AveriaAdminFontanero = {
  id: number
  nombre?: string | null
}

/**
 * Ítem del listado administrativo. Alineado con `AveriaAdminListItem` del Backend.
 * `prioridad`, `tipoAveria` y `fontanero` pueden ser null.
 */
export type AveriaListItem = {
  id: number
  codigoSeguimiento: string
  fechaReporte: string
  nombreReportante: string
  sectorComunidad: string
  ubicacion: string
  descripcion: string
  estado: EstadoAveria | string
  prioridad: string | null
  tipoAveria: string | null
  fontanero: AveriaAdminFontanero | null
}

/** Query de GET /api/v1/admin/averias. Solo se envían valores activos. */
export type AveriasAdminQuery = {
  page?: number
  limit?: number
  search?: string
  estado?: string
  prioridad?: string
  tipo?: string
  fontaneroId?: number
  fechaDesde?: string
  fechaHasta?: string
}

export type AveriasAdminListado = {
  data: AveriaListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const DEFAULT_AVERIAS_PAGE = 1
export const DEFAULT_AVERIAS_LIMIT = 20

export const EMPTY_AVERIAS_LISTADO: AveriasAdminListado = {
  data: [],
  total: 0,
  page: DEFAULT_AVERIAS_PAGE,
  limit: DEFAULT_AVERIAS_LIMIT,
  totalPages: 0,
}

export type AveriaAdminAbonado = {
  id: number
  nombre?: string | null
}

/**
 * Detalle administrativo. Campos planos del modelo Averia (Backend).
 * No anida reportante/ubicacion/gestion salvo relaciones ya existentes.
 */
export type AveriaDetail = {
  id: number
  codigoSeguimiento: string
  fechaReporte: string
  estado: EstadoAveria | string
  nombreReportante: string
  identificacionReportante: string | null
  telefonoReportante: string
  correoReportante: string | null
  idAbonado: number | null
  abonado: AveriaAdminAbonado | null
  sectorComunidad: string
  ubicacion: string
  descripcion: string
  fontanero: AveriaAdminFontanero | null
  tipoAveria: string | null
  prioridad: string | null
  fechaAsignacion: string | null
  fechaInicioAtencion: string | null
  fechaResolucion: string | null
  observacionesAtencion: string | null
}

export const AVERIA_UNASSIGNED_LABEL = 'Sin asignar'
export const AVERIA_UNCLASSIFIED_LABEL = 'Sin clasificar'
export const AVERIA_UNAVAILABLE_LABEL = 'No disponible'
export const AVERIA_NO_OBSERVATIONS_LABEL = 'Sin observaciones'
export const AVERIA_NOT_PROVIDED_LABEL = 'No proporcionado'
export const AVERIA_NO_ABONADO_LABEL = 'No relacionado con un Abonado'

export const AVERIAS_ADMIN_DETAIL_LOADING_MESSAGE =
  'Cargando información de la avería...'
export const AVERIAS_ADMIN_DETAIL_ERROR =
  'No fue posible cargar la información de la avería. Intente nuevamente.'
export const AVERIAS_ADMIN_DETAIL_NOT_FOUND =
  'No se encontró la avería solicitada.'

export const AVERIAS_ADMIN_LOAD_ERROR =
  'No fue posible cargar las averías. Intente nuevamente.'

export const AVERIAS_ADMIN_EMPTY_MESSAGE =
  'No se encontraron averías con los criterios seleccionados.'

export const AVERIAS_ADMIN_LOADING_MESSAGE = 'Cargando averías...'

export const EMPTY_FILTER = ''

/** Token de GET /admin/averias: filtra `prioridad IS NULL`. */
export const PRIORIDAD_FILTER_UNASSIGNED = 'SIN_ASIGNAR'

export const PRIORIDAD_FILTER_OPTIONS = [
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'BAJA', label: 'Baja' },
] as const

export const PRIORIDAD_LABELS: Record<string, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
}

export const getPrioridadLabel = (prioridad: string | null): string => {
  if (prioridad == null || prioridad.trim() === '') {
    return AVERIA_UNASSIGNED_LABEL
  }

  return PRIORIDAD_LABELS[prioridad] ?? prioridad
}

export const getTipoAveriaLabel = (tipoAveria: string | null): string => {
  if (tipoAveria == null || tipoAveria.trim() === '') {
    return AVERIA_UNASSIGNED_LABEL
  }

  return tipoAveria
}

export const getTipoAveriaDetailLabel = (tipoAveria: string | null): string => {
  if (tipoAveria == null || tipoAveria.trim() === '') {
    return AVERIA_UNCLASSIFIED_LABEL
  }

  return tipoAveria
}

export const getOptionalPersonalLabel = (
  value: string | null | undefined,
): string => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : AVERIA_NOT_PROVIDED_LABEL
}

export const getAbonadoRelacionadoLabel = (
  idAbonado: number | null,
  abonado: AveriaAdminAbonado | null,
): string => {
  const nombre = abonado?.nombre?.trim()
  if (nombre) {
    return nombre
  }

  if (abonado?.id != null) {
    return `Abonado #${abonado.id}`
  }

  if (idAbonado != null) {
    return `Abonado #${idAbonado}`
  }

  return AVERIA_NO_ABONADO_LABEL
}

export const getObservacionesLabel = (
  observaciones: string | null | undefined,
): string => {
  const trimmed = observaciones?.trim()
  return trimmed ? trimmed : AVERIA_NO_OBSERVATIONS_LABEL
}

export const getFontaneroLabel = (
  fontanero: AveriaAdminFontanero | null,
): string => {
  if (fontanero == null) {
    return AVERIA_UNASSIGNED_LABEL
  }

  const nombre = fontanero.nombre?.trim()
  if (nombre) {
    return nombre
  }

  return `Fontanero #${fontanero.id}`
}
