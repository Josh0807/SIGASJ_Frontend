import { fetchWithAuth } from '../../../services/http/httpClient'
import { referenciasCargadas, type TipoDocumentoDisp } from './documentoAdjunto'
import type {
  CalidadTitular,
  DisponibilidadFormValues,
  DisponibilidadPayload,
  DisponibilidadResponse,
  MedioNotificacion,
  NaturalezaInmueble,
  Proposito,
  TipoPersona,
} from './types'

export type DocumentoUploadResponse = {
  id: number
  tipoDocumento: TipoDocumentoDisp
  nombreOriginal: string
  tipoArchivo: string
  tamanio: number
  tokenReclamo: string
  fechaCarga: string
}

const optionalNumber = (raw: string): number | undefined => {
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : undefined
}

export const toDisponibilidadPayload = (
  values: DisponibilidadFormValues,
): DisponibilidadPayload => {
  const esFisica = values.tipoPersona === 'Persona física'
  const documentos = referenciasCargadas(values.documentos).map((doc) => ({
    id: doc.id,
    tokenReclamo: doc.tokenReclamo,
  }))

  const folioReal = values.folioReal.trim()
  const planoCatastrado = values.planoCatastrado.trim()
  const planoAgrimensura = values.planoAgrimensura.trim()
  const nis = values.nis.trim()
  const numeroDisp = values.numeroDisponibilidadAnterior.trim()
  const valorPrincipal = values.valorNotificacionPrincipal.trim()
  const valorSecundario = values.valorNotificacionSecundario.trim()
  const medioSecundario = values.medioNotificacionSecundario

  const cantidadDormitorios = optionalNumber(values.cantidadDormitorios)
  const unidadesHabitacionales = optionalNumber(values.unidadesHabitacionales)
  const areaConstruccion = optionalNumber(values.areaConstruccion)
  const niveles = optionalNumber(values.niveles)
  const caudalRequerido = optionalNumber(values.caudalRequerido)

  const base: DisponibilidadPayload = {
    tipoPersona: values.tipoPersona as TipoPersona,
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
    provincia: values.provincia.trim(),
    canton: values.canton.trim(),
    distrito: values.distrito.trim(),
    direccionExacta: values.direccionExacta.trim(),
    ...(folioReal ? { folioReal } : {}),
    ...(planoCatastrado ? { planoCatastrado } : {}),
    ...(planoAgrimensura ? { planoAgrimensura } : {}),
    ...(nis ? { nis } : {}),
    naturalezaInmueble: values.naturalezaInmueble as NaturalezaInmueble,
    calidadTitular: values.calidadTitular as CalidadTitular,
    proposito: values.proposito as Proposito,
    ...(numeroDisp ? { numeroDisponibilidadAnterior: numeroDisp } : {}),
    descripcionProyecto: values.descripcionProyecto.trim(),
    ...(cantidadDormitorios !== undefined ? { cantidadDormitorios } : {}),
    ...(unidadesHabitacionales !== undefined
      ? { unidadesHabitacionales }
      : {}),
    ...(areaConstruccion !== undefined ? { areaConstruccion } : {}),
    ...(niveles !== undefined ? { niveles } : {}),
    ...(caudalRequerido !== undefined ? { caudalRequerido } : {}),
    autorizacionInspeccion: values.autorizacionInspeccion,
    ...(values.firma.trim() ? { firma: values.firma.trim() } : {}),
    documentos,
  }

  if (esFisica) {
    return {
      ...base,
      nombreFisica: values.nombreFisica.trim(),
      primerApellidoFisica: values.primerApellidoFisica.trim(),
      segundoApellidoFisica: values.segundoApellidoFisica.trim(),
      identificacionFisica: values.identificacionFisica.trim(),
      telefonoFisica: values.telefonoFisica.trim(),
    }
  }

  return {
    ...base,
    razonSocial: values.razonSocial.trim(),
    identificacionJuridica: values.identificacionJuridica.trim(),
    nombreRepresentante: values.nombreRepresentante.trim(),
    identificacionRepresentante: values.identificacionRepresentante.trim(),
    telefonoRepresentante: values.telefonoRepresentante.trim(),
  }
}

export async function subirDocumentoSolicitud(
  file: File,
  tipoDocumento: TipoDocumentoDisp,
): Promise<DocumentoUploadResponse> {
  const body = new FormData()
  body.append('archivo', file)
  body.append('tipoDocumento', tipoDocumento)
  return fetchWithAuth<DocumentoUploadResponse>('/solicitudes/documentos', {
    method: 'POST',
    body,
  })
}

export async function registrarDisponibilidadServicios(
  values: DisponibilidadFormValues,
) {
  return fetchWithAuth<DisponibilidadResponse>(
    '/solicitudes/disponibilidad-servicios',
    {
      method: 'POST',
      body: JSON.stringify(toDisponibilidadPayload(values)),
    },
  )
}

export const getDisponibilidadErrorMessage = (error: unknown) => {
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
