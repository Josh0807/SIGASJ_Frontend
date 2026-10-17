import type { ActualizarAsociadoPayload, Asociado, AsociadoFormValues, RegistrarAsociadoPayload } from './types'

export type AsociadoFormErrors = Partial<Record<keyof AsociadoFormValues, string>>
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const CEDULA_DUPLICADA_MESSAGE = 'Ya existe un asociado registrado con esta cédula.'
const TECHNICAL_ERROR_PATTERN = /sql|query|constraint|duplicate key|unique key|sequelize|typeorm|nestjs|prisma|stack|database|nvarchar|violation|exception|driver|repository|insert into|update\s+\w+\s+set/i
const isTechnicalMessage = (message: string) => TECHNICAL_ERROR_PATTERN.test(message)

function backendMessages(error: unknown): string[] {
  const message = error instanceof Error ? error.message : ''
  const detail = message.replace(/^HTTP\s+\d{3}:\s*/i, '').trim()
  if (!detail) return []
  try {
    const parsed: unknown = JSON.parse(detail)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    }
  } catch {
    // Algunos errores válidos llegan como un único mensaje de texto.
  }
  return [detail]
}

export function asociadoBackendFieldErrors(error: unknown): AsociadoFormErrors {
  const status = getHttpStatus(error)
  if (status === 409) {
    return { cedula: CEDULA_DUPLICADA_MESSAGE }
  }
  if (status !== 400) return {}
  return backendMessages(error).reduce<AsociadoFormErrors>((errors, message) => {
    const normalized = message.toLocaleLowerCase('es')
    if (/\bnombre\b/.test(normalized) && !errors.nombre) errors.nombre = message
    else if (/apellido/.test(normalized) && !errors.apellidos) errors.apellidos = message
    else if (/c[eé]dula/.test(normalized) && !errors.cedula) errors.cedula = message
    else if (/correo|email/.test(normalized) && !errors.correoElectronico) errors.correoElectronico = message
    return errors
  }, {})
}

export const nombreCompleto = (asociado: Pick<Asociado, 'nombre' | 'apellidos'>) =>
  `${asociado.nombre} ${asociado.apellidos}`.trim()

export const estadoLabel = (activo: boolean) => (activo ? 'Activo' : 'Inactivo')

/** Fecha de registro o inactivación del asociado, en hora de Costa Rica. */
export const formatearFecha = (valor: string | null | undefined) => {
  if (!valor) return '—'
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime())
    ? '—'
    : fecha.toLocaleDateString('es-CR', { dateStyle: 'medium', timeZone: 'America/Costa_Rica' })
}

export const getHttpStatus = (error: unknown): number | null => {
  const match = /HTTP\s+(\d{3})/i.exec(error instanceof Error ? error.message : '')
  return match ? Number(match[1]) : null
}

export const esNoAutenticado = (error: unknown) => getHttpStatus(error) === 401

/** 403 y 404 no cambian al reintentar; el resto (red, 5xx) sí puede resolverse. */
export const esReintentable = (error: unknown) => {
  const status = getHttpStatus(error)
  return status !== 403 && status !== 404
}

export function asociadoConsultaError(error: unknown, fallback: string): string {
  const status = getHttpStatus(error)
  if (status === 403) return 'No tiene permisos para consultar asociados.'
  if (status === 404) return 'El asociado indicado no existe o fue eliminado.'
  if (status === 400) return 'Revise los criterios de búsqueda.'
  if (status === null) return 'No fue posible conectar con el servidor. Revise su conexión.'
  return fallback
}

export function historialAsociadosError(error: unknown): string {
  const status = getHttpStatus(error)
  if (status === 403) return 'No tiene permisos para consultar el historial de asociados.'
  if (status === 404) return 'No se encontró el historial de asociados solicitado.'
  if (status === 400) return 'Revise los filtros del historial e inténtelo nuevamente.'
  if (status === null) return 'No fue posible conectar con el servidor. Revise su conexión.'
  return 'No fue posible cargar el historial de asociados.'
}

/** Igual al largo de la columna Asociado.motivoInactivacion en el backend. */
export const MOTIVO_INACTIVACION_MAX_LENGTH = 500

export function validarMotivoInactivacion(motivo: string): string | undefined {
  const limpio = motivo.trim()
  if (!limpio) return 'Indique el motivo de la inactivación.'
  if (limpio.length > MOTIVO_INACTIVACION_MAX_LENGTH) {
    return `Use un máximo de ${MOTIVO_INACTIVACION_MAX_LENGTH} caracteres.`
  }
  return undefined
}

export function asociadoEstadoError(error: unknown, activar: boolean): string {
  const status = getHttpStatus(error)
  if (status === 403) return 'No tiene permisos para cambiar el estado de asociados.'
  if (status === 404) return 'El asociado indicado no existe o fue eliminado.'
  if (status === 400) return asociadoSubmitError(error)
  if (status === null) return 'No fue posible conectar con el servidor. Revise su conexión.'
  return activar
    ? 'No fue posible reactivar el asociado. Inténtelo nuevamente.'
    : 'No fue posible inactivar el asociado. Inténtelo nuevamente.'
}

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

export const asociadoToFormValues = (asociado: Asociado): AsociadoFormValues => ({
  nombre: asociado.nombre,
  apellidos: asociado.apellidos,
  cedula: asociado.cedula,
  correoElectronico: asociado.correoElectronico,
})

export function toActualizarAsociadoPayload(
  values: AsociadoFormValues,
  initialValues: AsociadoFormValues,
): ActualizarAsociadoPayload {
  const current = toRegistrarAsociadoPayload(values)
  const initial = toRegistrarAsociadoPayload(initialValues)
  return (Object.keys(current) as Array<keyof ActualizarAsociadoPayload>).reduce(
    (payload, field) => {
      if (current[field] !== initial[field]) payload[field] = current[field]
      return payload
    },
    {} as ActualizarAsociadoPayload,
  )
}

export function asociadoUpdateError(error: unknown): { message: string; cedula?: string } {
  const status = getHttpStatus(error)
  if (status === 409) return {
    message: CEDULA_DUPLICADA_MESSAGE,
    cedula: CEDULA_DUPLICADA_MESSAGE,
  }
  if (status === 404) return { message: 'Asociado no encontrado.' }
  if (status === 403) return { message: 'No tiene permisos para modificar asociados.' }
  if (status === 400) {
    const message = asociadoSubmitError(error)
    return { message: isTechnicalMessage(message) ? 'Revise los datos ingresados e inténtelo nuevamente.' : message }
  }
  return { message: 'No fue posible guardar los cambios. Inténtelo nuevamente.' }
}

export function asociadoSubmitError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  if (/HTTP 409/.test(message)) return CEDULA_DUPLICADA_MESSAGE
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
          if (readableMessages.some(isTechnicalMessage)) {
            return 'Revise los datos ingresados e inténtelo nuevamente.'
          }
          return readableMessages
            .map((item) => (/[^.!?]$/.test(item.trim()) ? `${item.trim()}.` : item.trim()))
            .join(' ')
        }
      }
    } catch {
      // El backend también puede responder un único mensaje de texto.
    }
    return isTechnicalMessage(detail)
      ? 'Revise los datos ingresados e inténtelo nuevamente.'
      : detail
  }
  return 'No fue posible registrar el asociado. Inténtelo nuevamente.'
}
