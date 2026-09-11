import type { ProveedorFormValues, ProveedorPayload } from './types'

export type ProveedorFormErrors = Partial<Record<keyof ProveedorFormValues, string>>
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateProveedor(values: ProveedorFormValues): ProveedorFormErrors {
  const errors: ProveedorFormErrors = {}
  if (!values.nombre.trim()) errors.nombre = 'El nombre es obligatorio.'
  else if (values.nombre.trim().length > 150) errors.nombre = 'Use un máximo de 150 caracteres.'
  if (values.correo.trim() && !EMAIL.test(values.correo.trim())) errors.correo = 'Ingrese un correo electrónico válido.'
  if (values.correo.trim().length > 150) errors.correo = 'Use un máximo de 150 caracteres.'
  if (values.telefono.trim().length > 30) errors.telefono = 'Use un máximo de 30 caracteres.'
  if (values.identificacion.trim().length > 50) errors.identificacion = 'Use un máximo de 50 caracteres.'
  return errors
}

export function toProveedorPayload(values: ProveedorFormValues): ProveedorPayload {
  const optional = (value: string) => value.trim() || null
  return { nombre: values.nombre.trim(), razonSocial: optional(values.razonSocial), identificacion: optional(values.identificacion), telefono: optional(values.telefono), correo: optional(values.correo), direccion: optional(values.direccion), personaContacto: optional(values.personaContacto) }
}

export function proveedorError(error: unknown, fallback = 'No fue posible completar la operación.') {
  const message = error instanceof Error ? error.message : ''
  if (/HTTP 409/.test(message)) return 'Ya existe un proveedor con ese nombre o identificación.'
  if (/HTTP 404/.test(message)) return 'El proveedor ya no existe o fue eliminado.'
  if (/HTTP 403/.test(message)) return 'No tiene permisos para administrar proveedores.'
  if (/HTTP 401/.test(message)) return 'Su sesión venció. Inicie sesión nuevamente.'
  if (/HTTP 400/.test(message)) return message.replace(/^HTTP 400:\s*/, '') || 'Revise los datos ingresados.'
  return fallback
}
