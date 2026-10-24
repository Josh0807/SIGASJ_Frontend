import type { ProveedorFormValues, ProveedorPayload } from './types'

export type ProveedorFormErrors = Partial<Record<keyof ProveedorFormValues, string>>
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const IDENTIFICACION_FORMAT = /^[0-9\s-]*$/
const TELEFONO_FORMAT = /^[0-9+()\s.-]*$/

// Permite formatos como 1-2345-6789 y 3-101-123456 sin contar los guiones.
export const PROVEEDOR_IDENTIFICACION_MAX_LENGTH = 12
export const PROVEEDOR_IDENTIFICACION_MAX_DIGITS = 10
// Permite el formato nacional 2222-2222: 8 dígitos y un guion.
export const PROVEEDOR_TELEFONO_MAX_LENGTH = 9
export const PROVEEDOR_TELEFONO_MAX_DIGITS = 8

const digitCount = (value: string) => value.replace(/\D/g, '').length

export function validateProveedor(values: ProveedorFormValues): ProveedorFormErrors {
  const errors: ProveedorFormErrors = {}
  if (!values.nombre.trim()) errors.nombre = 'El nombre es obligatorio.'
  else if (values.nombre.trim().length > 150) errors.nombre = 'Use un máximo de 150 caracteres.'
  if (values.razonSocial.trim().length > 200) errors.razonSocial = 'Use un máximo de 200 caracteres.'
  if (values.correo.trim().length > 150) errors.correo = 'Use un máximo de 150 caracteres.'
  else if (values.correo.trim() && !EMAIL.test(values.correo.trim())) errors.correo = 'Ingrese un correo electrónico válido.'
  const telefono = values.telefono.trim()
  if (telefono.length > PROVEEDOR_TELEFONO_MAX_LENGTH || digitCount(telefono) > PROVEEDOR_TELEFONO_MAX_DIGITS) {
    errors.telefono = `Ingrese un máximo de ${PROVEEDOR_TELEFONO_MAX_DIGITS} dígitos.`
  } else if (telefono && !TELEFONO_FORMAT.test(telefono)) {
    errors.telefono = 'Use solamente números, espacios, +, guiones o paréntesis.'
  } else if (telefono && digitCount(telefono) !== PROVEEDOR_TELEFONO_MAX_DIGITS) {
    errors.telefono = `El teléfono debe tener ${PROVEEDOR_TELEFONO_MAX_DIGITS} dígitos.`
  }
  const identificacion = values.identificacion.trim()
  if (identificacion.length > PROVEEDOR_IDENTIFICACION_MAX_LENGTH || digitCount(identificacion) > PROVEEDOR_IDENTIFICACION_MAX_DIGITS) {
    errors.identificacion = `Ingrese un máximo de ${PROVEEDOR_IDENTIFICACION_MAX_DIGITS} dígitos.`
  } else if (identificacion && !IDENTIFICACION_FORMAT.test(identificacion)) {
    errors.identificacion = 'Use solamente números, espacios o guiones.'
  } else if (identificacion && ![9, 10].includes(digitCount(identificacion))) {
    errors.identificacion = 'La identificación debe tener 9 dígitos (física) o 10 dígitos (jurídica).'
  }
  if (values.personaContacto.trim().length > 150) errors.personaContacto = 'Use un máximo de 150 caracteres.'
  if (values.direccion.trim().length > 500) errors.direccion = 'Use un máximo de 500 caracteres.'
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
