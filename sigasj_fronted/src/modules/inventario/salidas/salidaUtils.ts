import type { RegistrarSalidaPayload, SalidaFormValues } from './types'

export type SalidaFormErrors = Partial<Record<keyof SalidaFormValues, string>>

export function validateSalida(values: SalidaFormValues): SalidaFormErrors {
  const errors: SalidaFormErrors = {}
  const materialId = Number(values.materialId)
  const cantidad = Number(values.cantidad)
  if (!values.materialId) errors.materialId = 'Seleccione el material que desea retirar.'
  else if (!Number.isInteger(materialId) || materialId <= 0) errors.materialId = 'Seleccione un material válido.'
  if (!values.cantidad) errors.cantidad = 'La cantidad es obligatoria.'
  else if (!Number.isInteger(cantidad) || cantidad <= 0) errors.cantidad = 'Ingrese un número entero mayor a cero.'
  if (values.observacion.trim().length > 1000) errors.observacion = 'La observación no puede superar 1000 caracteres.'
  return errors
}

export const toSalidaPayload = (values: SalidaFormValues, idAveria: number | null, idSolicitud: number | null): RegistrarSalidaPayload => ({
  idMaterial: Number(values.materialId),
  cantidad: Number(values.cantidad),
  idAveria,
  idSolicitud,
  observacion: values.observacion.trim() || null,
})

export function parseRelatedId(value: string | null): number | null {
  const parsed = Number(value)
  return value && Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function salidaError(error: unknown) {
  if (!(error instanceof Error)) return 'No fue posible registrar la salida. Intente nuevamente.'
  const status = /^HTTP (\d+):/.exec(error.message)?.[1]
  const detail = error.message.replace(/^HTTP \d+:\s*/, '')
  if (status === '400') return detail || 'Revise el material y la cantidad indicada.'
  if (status === '404') return detail || 'El material o registro relacionado ya no existe.'
  if (status === '401') return 'Su sesión venció. Inicie sesión nuevamente.'
  if (status === '403') return 'No tiene permisos para registrar salidas de inventario.'
  return 'No fue posible registrar la salida. Intente nuevamente.'
}
