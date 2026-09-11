import type { EntradaFormValues, RegistrarEntradaPayload } from './types'

export type EntradaFormErrors = Partial<Record<keyof EntradaFormValues, string>>

export function validateEntrada(values: EntradaFormValues): EntradaFormErrors {
  const errors: EntradaFormErrors = {}
  const materialId = Number(values.materialId)
  const cantidad = Number(values.cantidad)
  if (!values.materialId) errors.materialId = 'Seleccione el material recibido.'
  else if (!Number.isInteger(materialId) || materialId <= 0) errors.materialId = 'Seleccione un material válido.'
  if (!values.cantidad) errors.cantidad = 'La cantidad es obligatoria.'
  else if (!Number.isInteger(cantidad) || cantidad <= 0) errors.cantidad = 'Ingrese un número entero mayor a cero.'
  if (values.proveedorId && (!Number.isInteger(Number(values.proveedorId)) || Number(values.proveedorId) <= 0)) errors.proveedorId = 'Seleccione un proveedor válido.'
  if (values.observacion.trim().length > 1000) errors.observacion = 'La observación no puede superar 1000 caracteres.'
  return errors
}

export const toEntradaPayload = (values: EntradaFormValues): RegistrarEntradaPayload => ({ idMaterial: Number(values.materialId), cantidad: Number(values.cantidad), idProveedor: values.proveedorId ? Number(values.proveedorId) : null, observacion: values.observacion.trim() || null })

export function entradaError(error: unknown) {
  if (!(error instanceof Error)) return 'No fue posible registrar la entrada. Intente nuevamente.'
  const status = /^HTTP (\d+):/.exec(error.message)?.[1]
  const detail = error.message.replace(/^HTTP \d+:\s*/, '')
  if (status === '400') return detail || 'Revise la cantidad, el material y el proveedor seleccionados.'
  if (status === '404') return detail || 'El material o proveedor seleccionado ya no existe.'
  if (status === '401') return 'Su sesión venció. Inicie sesión nuevamente.'
  if (status === '403') return 'No tiene permisos para registrar entradas de inventario.'
  return 'No fue posible registrar la entrada. Intente nuevamente.'
}
