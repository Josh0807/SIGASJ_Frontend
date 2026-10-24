import { fetchWithAuth } from '../../../services/http/httpClient'
import type {
  DocumentoAdjunto,
  ServicioExistenteFormValues,
  ServicioExistentePayload,
  ServicioExistenteResponse,
  TipoDocumento,
} from './types'

export const toServicioExistentePayload = (
  values: ServicioExistenteFormValues,
): ServicioExistentePayload => ({
  tipoServicio: values.tipoServicio as ServicioExistentePayload['tipoServicio'],
  nis: values.nis.trim(),
  propietarioInmueble: values.propietarioInmueble.trim(),
  nombreSolicitante: values.nombreSolicitante.trim(),
  identificacionSolicitante: values.identificacionSolicitante.trim(),
  correoElectronico: values.correoElectronico.trim(),
  telefono: values.telefono.trim(),
  naturalezaInmueble:
    values.naturalezaInmueble as ServicioExistentePayload['naturalezaInmueble'],
  calidadTitular:
    values.calidadTitular as ServicioExistentePayload['calidadTitular'],
  folioReal: values.folioReal.trim(),
  planoCatastrado: values.planoCatastrado.trim(),
  planoAgrimensura: values.planoAgrimensura.trim(),
  provincia: values.provincia.trim(),
  canton: values.canton.trim(),
  distrito: values.distrito.trim(),
  direccionExacta: values.direccionExacta.trim(),
  motivo: values.motivo as ServicioExistentePayload['motivo'],
  ...(values.motivo === 'Otro' ? { otroMotivo: values.otroMotivo.trim() } : {}),
  tramitePorRealizar: values.tramitePorRealizar.trim(),
  medioNotificacionPrincipal:
    values.medioNotificacionPrincipal as ServicioExistentePayload['medioNotificacionPrincipal'],
  ...(values.medioNotificacionSecundario
    ? { medioNotificacionSecundario: values.medioNotificacionSecundario }
    : {}),
  firma: values.firma,
  documentos: values.documentos
    .filter(
      (doc): doc is DocumentoAdjunto & { id: number; tokenReclamo: string } =>
        doc.estado === 'cargado' && typeof doc.id === 'number' && Boolean(doc.tokenReclamo),
    )
    .map(({ id, tokenReclamo }) => ({ id, tokenReclamo })),
})

export const registrarServicioExistente = (values: ServicioExistenteFormValues) =>
  fetchWithAuth<ServicioExistenteResponse>('/solicitudes/servicio-existente', {
    method: 'POST',
    body: JSON.stringify(toServicioExistentePayload(values)),
  })

export const subirDocumentoServicioExistente = (
  file: File,
  tipoDocumento: TipoDocumento,
) => {
  const body = new FormData()
  body.append('archivo', file)
  body.append('tipoDocumento', tipoDocumento)
  return fetchWithAuth<{
    id: number
    tokenReclamo: string
    nombreOriginal: string
    tamanio: number
    tipoArchivo: string
  }>('/solicitudes/documentos', { method: 'POST', body })
}

export const getServicioExistenteErrorMessage = (error: unknown) => {
  if (!(error instanceof Error)) return 'No fue posible registrar la solicitud. Intenta nuevamente.'
  const detail = error.message.replace(/^HTTP \d+:\s*/, '')
  try {
    const parsed: unknown = JSON.parse(detail)
    if (Array.isArray(parsed)) return parsed.map(String).join('. ')
  } catch {
    // El backend también puede responder texto simple.
  }
  return detail || 'No fue posible registrar la solicitud. Intenta nuevamente.'
}
