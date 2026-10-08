import type { AsociadoFormValues, RegistrarAsociadoPayload } from './types'

export type AsociadoFormErrors = Partial<Record<keyof AsociadoFormValues, string>>
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateAsociado(values: AsociadoFormValues): AsociadoFormErrors {
  const errors: AsociadoFormErrors = {}
  if (!values.nombre.trim()) errors.nombre = 'El nombre es obligatorio.'
  else if (values.nombre.trim().length > 100) errors.nombre = 'Use un máximo de 100 caracteres.'
  if (!values.apellidos.trim()) errors.apellidos = 'Los apellidos son obligatorios.'
  else if (values.apellidos.trim().length > 100) errors.apellidos = 'Use un máximo de 100 caracteres.'
  if (!values.cedula.trim()) errors.cedula = 'La cédula es obligatoria.'
  else if (values.cedula.trim().length > 30) errors.cedula = 'Use un máximo de 30 caracteres.'
  const correo = values.correoElectronico.trim()
  if (!correo) errors.correoElectronico = 'El correo electrónico es obligatorio.'
  else if (correo.length > 150) errors.correoElectronico = 'Use un máximo de 150 caracteres.'
  else if (!EMAIL_PATTERN.test(correo)) errors.correoElectronico = 'Ingrese un correo electrónico válido.'
  return errors
}

export function toRegistrarAsociadoPayload(values: AsociadoFormValues): RegistrarAsociadoPayload {
  return {
    nombre: values.nombre.trim(),
    apellidos: values.apellidos.trim(),
    cedula: values.cedula.trim(),
    correoElectronico: values.correoElectronico.trim().toLowerCase(),
  }
}

export function asociadoSubmitError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  if (/HTTP 409/.test(message)) return 'La cédula ingresada ya pertenece a un asociado registrado.'
  if (/HTTP 403/.test(message)) return 'No tiene permisos para registrar asociados.'
  if (/HTTP 400/.test(message)) {
    const detail = message.replace(/^HTTP 400:\s*/, '').trim()
    if (!detail) return 'Revise los datos ingresados.'
    try {
      const backendMessages: unknown = JSON.parse(detail)
      if (Array.isArray(backendMessages)) {
        const readableMessages = backendMessages.filter(
          (item): item is string => typeof item === 'string' && Boolean(item.trim()),
        )
        if (readableMessages.length) {
          return readableMessages
            .map((item) => (/[^.!?]$/.test(item.trim()) ? `${item.trim()}.` : item.trim()))
            .join(' ')
        }
      }
    } catch {
      // El backend también puede responder un único mensaje de texto.
    }
    return detail
  }
  return 'No fue posible registrar el asociado. Inténtelo nuevamente.'
}
