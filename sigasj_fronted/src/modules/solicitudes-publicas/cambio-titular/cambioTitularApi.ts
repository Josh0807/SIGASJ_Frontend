import { fetchWithAuth } from '../../../services/http/httpClient'
import type {
  CambioTitularFormValues,
  CambioTitularPayload,
  CambioTitularResponse,
  CalidadTitular,
  MedioNotificacion,
  NaturalezaInmueble,
} from './types'

export const toCambioTitularPayload = (
  values: CambioTitularFormValues,
): CambioTitularPayload => {
  const folioReal = values.folioReal.trim()
  const planoCatastrado = values.planoCatastrado.trim()
  const planoAgrimensura = values.planoAgrimensura.trim()
  const medioSecundario = values.medioNotificacionSecundario

  return {
    nombreSolicitante: values.nombreSolicitante.trim(),
    identificacionSolicitante: values.identificacionSolicitante.trim(),
    telefono: values.telefono.trim(),
    nombrePropietarioRegistral: values.nombrePropietarioRegistral.trim(),
    identificacionPropietario: values.identificacionPropietario.trim(),
    ...(folioReal ? { folioReal } : {}),
    ...(planoCatastrado ? { planoCatastrado } : {}),
    ...(planoAgrimensura ? { planoAgrimensura } : {}),
    naturalezaInmueble: values.naturalezaInmueble as NaturalezaInmueble,
    calidadTitular: values.calidadTitular as CalidadTitular,
    nis: values.nis.trim(),
    facturaANombreDe: values.facturaANombreDe.trim(),
    medioNotificacionPrincipal:
      values.medioNotificacionPrincipal as MedioNotificacion,
    ...(medioSecundario
      ? { medioNotificacionSecundario: medioSecundario as MedioNotificacion }
      : {}),
    ...(values.firma.trim() ? { firma: values.firma.trim() } : {}),
  }
}

export async function registrarCambioTitular(values: CambioTitularFormValues) {
  return fetchWithAuth<CambioTitularResponse>('/solicitudes/cambio-titular', {
    method: 'POST',
    body: JSON.stringify(toCambioTitularPayload(values)),
  })
}

export const getCambioTitularErrorMessage = (error: unknown) => {
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
