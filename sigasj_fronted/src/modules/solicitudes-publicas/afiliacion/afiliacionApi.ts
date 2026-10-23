import { fetchWithAuth } from '../../../services/http/httpClient'
import type {
  AfiliacionFormValues,
  AfiliacionPayload,
  AfiliacionResponse,
} from './types'

export const toAfiliacionPayload = (
  values: AfiliacionFormValues,
): AfiliacionPayload => {
  const folioReal = values.folioReal.trim()
  const firmaSolicitante = values.firmaSolicitante.trim()
  const recomendacion1Firma = values.recomendacion1Firma.trim()
  const recomendacion2Firma = values.recomendacion2Firma.trim()

  return {
    fechaSolicitud: values.fechaSolicitud.trim(),
    nombre: values.nombre.trim(),
    identificacion: values.identificacion.trim(),
    vecinoDe: values.vecinoDe.trim(),
    estadoCivil: values.estadoCivil.trim(),
    telefono: values.telefono.trim(),
    correoElectronico: values.correoElectronico.trim(),
    numeroAbonado: values.numeroAbonado.trim(),
    numeroPlano: values.numeroPlano.trim(),
    ...(folioReal ? { folioReal } : {}),
    ...(firmaSolicitante ? { firmaSolicitante } : {}),
    recomendacion1Nombre: values.recomendacion1Nombre.trim(),
    recomendacion1Identificacion: values.recomendacion1Identificacion.trim(),
    recomendacion1NumeroAbonado: values.recomendacion1NumeroAbonado.trim(),
    ...(recomendacion1Firma ? { recomendacion1Firma } : {}),
    recomendacion2Nombre: values.recomendacion2Nombre.trim(),
    recomendacion2Identificacion: values.recomendacion2Identificacion.trim(),
    recomendacion2NumeroAbonado: values.recomendacion2NumeroAbonado.trim(),
    ...(recomendacion2Firma ? { recomendacion2Firma } : {}),
  }
}

export async function registrarAfiliacion(values: AfiliacionFormValues) {
  return fetchWithAuth<AfiliacionResponse>('/solicitudes/afiliacion', {
    method: 'POST',
    body: JSON.stringify(toAfiliacionPayload(values)),
  })
}

export const getAfiliacionErrorMessage = (error: unknown) => {
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
