import { fetchWithAuth } from '../../../services/http/httpClient'
import type { ArregloPagoFormValues, ArregloPagoPayload, ArregloPagoResponse } from './types'

export const toArregloPagoPayload = (values: ArregloPagoFormValues): ArregloPagoPayload => ({
  nombre: values.nombre.trim(),
  cedula: values.cedula.trim(),
  vecinoDe: values.vecinoDe.trim(),
  telefono: values.telefono.trim(),
  numeroCuentaServicio: values.numeroCuentaServicio.trim(),
  montoPrimaInicial: Number(values.montoPrimaInicial.replace(',', '.')),
  plazoSeleccionado: values.plazoSeleccionado as ArregloPagoPayload['plazoSeleccionado'],
  ...(values.firma ? { firma: values.firma } : {}),
})

export async function registrarArregloPago(values: ArregloPagoFormValues) {
  return fetchWithAuth<ArregloPagoResponse>('/solicitudes/arreglo-pago', {
    method: 'POST',
    body: JSON.stringify(toArregloPagoPayload(values)),
  })
}

export const getArregloPagoErrorMessage = (error: unknown) => {
  if (!(error instanceof Error)) return 'No fue posible registrar la solicitud. Intenta nuevamente.'
  const detail = error.message.replace(/^HTTP \d+:\s*/, '')
  try {
    const messages: unknown = JSON.parse(detail)
    if (Array.isArray(messages)) return messages.map(String).join('. ')
  } catch {
    // El backend también puede devolver un único mensaje de texto.
  }
  return detail || 'No fue posible registrar la solicitud. Intenta nuevamente.'
}
