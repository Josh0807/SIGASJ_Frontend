export const SOLICITUD_ESTADOS = ['PENDIENTE', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'FINALIZADA', 'CANCELADA'] as const
export type SolicitudAdminEstado = (typeof SOLICITUD_ESTADOS)[number]

export type SolicitudAdminListItem = {
  id: number
  codigoSeguimiento: string
  estado: string
  fechaIngreso: string
  solicitante?: string
  tipoSolicitud?: { id?: number; codigo?: string; nombre?: string; slug?: string }
  detalleFormulario?: Record<string, unknown> | null
}

export type SolicitudesAdminList = {
  data: SolicitudAdminListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type SolicitudDocumentoAdmin = {
  id: number
  tipoDocumento: string
  nombreOriginal: string
  mimeType?: string
  tamanio?: number
  tamano?: number
  subidoEn?: string
  fechaCarga?: string
}

export type SolicitudHistorialAdmin = {
  id: number
  estadoAnterior?: string | null
  estadoNuevo: string
  comentario?: string | null
  fecha?: string
  fechaHora?: string
  usuarioId?: number | null
}

export type SolicitudAdminDetail = SolicitudAdminListItem & {
  fechaResolucion?: string | null
  observaciones?: string | null
  detalleFormulario: Record<string, unknown> | null
  documentos: SolicitudDocumentoAdmin[]
  historial: SolicitudHistorialAdmin[]
  camposAdministrativos: Record<string, unknown> | null
}

export type SolicitudesAdminFilters = {
  search: string
  estado: string
  tipo: string
  page: number
}
