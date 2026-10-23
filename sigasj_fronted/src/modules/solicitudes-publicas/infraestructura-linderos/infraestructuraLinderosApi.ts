import { fetchWithAuth } from '../../../services/http/httpClient'
import { referenciasCargadas, type TipoDocumentoInfra } from './documentoAdjunto'
import type {
  CalidadTitular,
  InfraestructuraLinderosFormValues,
  InfraestructuraLinderosPayload,
  InfraestructuraLinderosResponse,
  MedioNotificacion,
  Proposito,
  TipoPersona,
} from './types'

export type DocumentoUploadResponse = {
  id: number
  tipoDocumento: TipoDocumentoInfra
  nombreOriginal: string
  tipoArchivo: string
  tamanio: number
  tokenReclamo: string
  fechaCarga: string
}

export const toInfraestructuraLinderosPayload = (
  values: InfraestructuraLinderosFormValues,
): InfraestructuraLinderosPayload => {
  const folioReal = values.folioReal.trim()
  const planoAgrimensura = values.planoAgrimensura.trim()
  const valorPrincipal = values.valorNotificacionPrincipal.trim()
  const valorSecundario = values.valorNotificacionSecundario.trim()
  const medioSecundario = values.medioNotificacionSecundario
  const esFisica = values.tipoPersona === 'Persona física'
  const documentos = referenciasCargadas(values.documentos).map((doc) => ({
    id: doc.id,
    tokenReclamo: doc.tokenReclamo,
  }))

  const base: InfraestructuraLinderosPayload = {
    nis: values.nis.trim(),
    tipoPersona: values.tipoPersona as TipoPersona,
    calidadTitular: values.calidadTitular as CalidadTitular,
    provincia: values.provincia.trim(),
    canton: values.canton.trim(),
    distrito: values.distrito.trim(),
    direccionExacta: values.direccionExacta.trim(),
    ...(folioReal ? { folioReal } : {}),
    planoCatastrado: values.planoCatastrado.trim(),
    ...(planoAgrimensura ? { planoAgrimensura } : {}),
    proposito: values.proposito as Proposito,
    medioNotificacionPrincipal:
      values.medioNotificacionPrincipal as MedioNotificacion,
    ...(valorPrincipal ? { valorNotificacionPrincipal: valorPrincipal } : {}),
    ...(medioSecundario
      ? {
          medioNotificacionSecundario: medioSecundario as MedioNotificacion,
        }
      : {}),
    ...(valorSecundario
      ? { valorNotificacionSecundario: valorSecundario }
      : {}),
    ...(values.firma.trim() ? { firma: values.firma.trim() } : {}),
    documentos,
  }

  if (esFisica) {
    return {
      ...base,
      nombreFisica: values.nombreFisica.trim(),
      apellidosFisica: values.apellidosFisica.trim(),
      identificacionFisica: values.identificacionFisica.trim(),
      telefonoFisica: values.telefonoFisica.trim(),
    }
  }

  return {
    ...base,
    razonSocial: values.razonSocial.trim(),
    cedulaJuridica: values.cedulaJuridica.trim(),
    nombreRepresentante: values.nombreRepresentante.trim(),
    identificacionRepresentante: values.identificacionRepresentante.trim(),
    telefonoRepresentante: values.telefonoRepresentante.trim(),
  }
}

export async function subirDocumentoSolicitud(
  file: File,
  tipoDocumento: TipoDocumentoInfra,
): Promise<DocumentoUploadResponse> {
  const body = new FormData()
  body.append('archivo', file)
  body.append('tipoDocumento', tipoDocumento)
  return fetchWithAuth<DocumentoUploadResponse>('/solicitudes/documentos', {
    method: 'POST',
    body,
  })
}

export async function registrarInfraestructuraLinderos(
  values: InfraestructuraLinderosFormValues,
) {
  return fetchWithAuth<InfraestructuraLinderosResponse>(
    '/solicitudes/infraestructura-linderos',
    {
      method: 'POST',
      body: JSON.stringify(toInfraestructuraLinderosPayload(values)),
    },
  )
}

export const getInfraestructuraLinderosErrorMessage = (error: unknown) => {
  if (!(error instanceof Error)) {
    return 'No fue posible registrar la solicitud. Intenta nuevamente.'
  }
  const detail = error.message.replace(/^HTTP \d+:\s*/, '')
  try {
    const messages: unknown = JSON.parse(detail)
    if (Array.isArray(messages)) return messages.map(String).join('. ')
  } catch {
    // El backend también puede devolver un único mensaje de texto.
  }
  return detail || 'No fue posible registrar la solicitud. Intenta nuevamente.'
}
