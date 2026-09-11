import type { MaterialFormValues } from './types'

export type MaterialFormErrors = Partial<Record<keyof MaterialFormValues, string>>

export function validateMaterial(values: MaterialFormValues): MaterialFormErrors {
  const errors: MaterialFormErrors = {}
  if (!values.nombre.trim()) errors.nombre = 'El nombre es obligatorio.'
  else if (values.nombre.trim().length > 150) errors.nombre = 'El nombre no puede superar 150 caracteres.'
  if (!values.unidadMedida.trim()) errors.unidadMedida = 'La unidad de medida es obligatoria.'
  else if (values.unidadMedida.trim().length > 50) errors.unidadMedida = 'La unidad no puede superar 50 caracteres.'
  if (values.descripcion.length > 1000) errors.descripcion = 'La descripción no puede superar 1000 caracteres.'
  if (values.ubicacion.length > 150) errors.ubicacion = 'La ubicación no puede superar 150 caracteres.'
  if (values.proveedorId && (!Number.isInteger(Number(values.proveedorId)) || Number(values.proveedorId) <= 0)) errors.proveedorId = 'Seleccione un proveedor válido.'
  const stock = Number(values.stockMinimo)
  if (values.stockMinimo === '') errors.stockMinimo = 'El stock mínimo es obligatorio.'
  else if (!Number.isInteger(stock) || stock < 0) errors.stockMinimo = 'Ingrese un número entero mayor o igual a cero.'
  return errors
}

export function materialApiError(error: unknown): string {
  if (!(error instanceof Error)) return 'No fue posible guardar el material. Intente nuevamente.'
  const status = /^HTTP (\d+):/.exec(error.message)?.[1]
  const detail = error.message.replace(/^HTTP \d+:\s*/, '')
  if (status === '409') return detail || 'Ya existe un material con ese nombre.'
  if (status === '400' || status === '422') return detail || 'Revise los datos ingresados.'
  if (status === '404') return detail || 'La categoría o el proveedor seleccionado no existe.'
  if (status === '403') return 'No tiene permisos para realizar esta acción.'
  return 'No fue posible guardar el material. Intente nuevamente.'
}
