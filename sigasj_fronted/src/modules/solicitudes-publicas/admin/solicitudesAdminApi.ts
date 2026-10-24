import { fetchRawWithAuth, fetchWithAuth } from '../../../services/http/httpClient'
import type { SolicitudAdminDetail, SolicitudAdminListItem, SolicitudesAdminFilters, SolicitudesAdminList } from './types'

export const SOLICITUDES_ADMIN_PAGE_SIZE = 10

type RawList = SolicitudAdminListItem[] | {
  data?: SolicitudAdminListItem[]
  items?: SolicitudAdminListItem[]
  solicitudes?: SolicitudAdminListItem[]
  total?: number
  page?: number
  limit?: number
  totalPages?: number
  meta?: { total?: number; page?: number; limit?: number; totalPages?: number }
}

export const solicitudesAdminParams = (filters: SolicitudesAdminFilters) => ({
  search: filters.search.trim() || undefined,
  estado: filters.estado || undefined,
  tipo: filters.tipo || undefined,
  page: filters.page,
  limit: SOLICITUDES_ADMIN_PAGE_SIZE,
})

export const normalizeSolicitudesAdminList = (raw: RawList, requestedPage = 1): SolicitudesAdminList => {
  if (Array.isArray(raw)) {
    const total = raw.length
    return { data: raw, total, page: requestedPage, limit: SOLICITUDES_ADMIN_PAGE_SIZE, totalPages: total ? 1 : 0 }
  }
  const data = raw.data ?? raw.items ?? raw.solicitudes ?? []
  const total = raw.total ?? raw.meta?.total ?? data.length
  const limit = raw.limit ?? raw.meta?.limit ?? SOLICITUDES_ADMIN_PAGE_SIZE
  const page = raw.page ?? raw.meta?.page ?? requestedPage
  const totalPages = raw.totalPages ?? raw.meta?.totalPages ?? (total ? Math.ceil(total / limit) : 0)
  return { data, total, page, limit, totalPages }
}

export const getSolicitudesAdmin = async (filters: SolicitudesAdminFilters, signal?: AbortSignal) => {
  const raw = await fetchWithAuth<RawList>('/solicitudes', { params: solicitudesAdminParams(filters), signal })
  return normalizeSolicitudesAdminList(raw, filters.page)
}

const detailRelationKeys = [
  'detalleArregloPago', 'detalleCambioTitular', 'detalleInfraestructuraLinderos',
  'detalleAfiliacion', 'detalleDisponibilidadServicios', 'detalleConstanciaServicio',
] as const

export const normalizeSolicitudAdminDetail = (raw: SolicitudAdminDetail & Record<string, unknown>): SolicitudAdminDetail => {
  const relatedDetail = detailRelationKeys
    .map((key) => raw[key])
    .find((value): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value))
  return {
    ...raw,
    detalleFormulario: raw.detalleFormulario ?? relatedDetail ?? null,
    documentos: Array.isArray(raw.documentos) ? raw.documentos : [],
    historial: Array.isArray(raw.historial) ? raw.historial : [],
    camposAdministrativos: raw.camposAdministrativos ?? null,
  }
}

export const getSolicitudAdminDetail = async (id: number, signal?: AbortSignal) => {
  const raw = await fetchWithAuth<SolicitudAdminDetail & Record<string, unknown>>(`/solicitudes/${id}/detalle`, { signal })
  return normalizeSolicitudAdminDetail(raw)
}

export const getSolicitudDocumentoAdmin = async (solicitudId: number, documentoId: number) => {
  const response = await fetchRawWithAuth(`/solicitudes/${solicitudId}/documentos/${documentoId}/descargar`)
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`HTTP ${response.status}: ${detail || response.statusText || 'No fue posible obtener el documento.'}`)
  }
  return response.blob()
}

export const solicitudesAdminError = (error: unknown, fallback: string) => {
  if (!(error instanceof Error)) return fallback
  if (error.message.includes('HTTP 401')) return 'La sesión expiró. Inicia sesión nuevamente.'
  if (error.message.includes('HTTP 403')) return 'No tienes permisos para consultar las solicitudes.'
  if (error.message.includes('HTTP 404')) return 'La solicitud indicada no existe.'
  return error.message.replace(/^HTTP \d+:\s*/, '') || fallback
}
