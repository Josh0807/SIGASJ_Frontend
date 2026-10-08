import type { Colaborador, ColaboradorFormValues, ColaboradorPayload } from './types'

export type ColaboradorFormErrors = Partial<Record<keyof ColaboradorFormValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CEDULA_NACIONAL_PATTERN = /^([1-9])-?(\d{4})-?(\d{4})$/
const CEDULA_DIMEX_PATTERN = /^\d{11,12}$/

export const CARGOS_SUGERIDOS = [
  'Administradora',
  'Secretaria',
  'Fontanero',
  'Ayudante de fontanero',
  'Contador',
  'Lector de medidores',
] as const

export const EMPTY_COLABORADOR_VALUES: ColaboradorFormValues = {
  nombre: '',
  apellidos: '',
  cedula: '',
  correoElectronico: '',
  cargo: '',
  usuarioId: '',
}

export const nombreCompleto = (colaborador: Pick<Colaborador, 'nombre' | 'apellidos'>) =>
  `${colaborador.nombre} ${colaborador.apellidos}`.trim()

export const estadoLabel = (activo: boolean) => (activo ? 'Activo' : 'Inactivo')

/**
 * createdAt/updatedAt los asigna SQL Server con GETDATE() (hora de Costa Rica) y el API
 * los serializa con sufijo Z; se muestran tal cual para no restarles el desfase de UTC.
 */
export const formatearFechaAuditoria = (valor: string) => {
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime())
    ? '—'
    : fecha.toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })
}

export const esCedulaValida = (cedula: string) => {
  const limpia = cedula.trim()
  return CEDULA_NACIONAL_PATTERN.test(limpia) || CEDULA_DIMEX_PATTERN.test(limpia)
}

const validarTexto = (valor: string, requerido: string, max: number) => {
  const limpio = valor.trim()
  if (!limpio) return requerido
  if (limpio.length > max) return `Use un máximo de ${max} caracteres.`
  return undefined
}

export function validateColaborador(values: ColaboradorFormValues): ColaboradorFormErrors {
  const errors: ColaboradorFormErrors = {}
  const nombre = validarTexto(values.nombre, 'El nombre es obligatorio.', 100)
  if (nombre) errors.nombre = nombre
  const apellidos = validarTexto(values.apellidos, 'Los apellidos son obligatorios.', 100)
  if (apellidos) errors.apellidos = apellidos
  const cargo = validarTexto(values.cargo, 'El cargo es obligatorio.', 100)
  if (cargo) errors.cargo = cargo

  if (!values.cedula.trim()) errors.cedula = 'La cédula es obligatoria.'
  else if (!esCedulaValida(values.cedula)) {
    errors.cedula = 'Use el formato 1-1234-5678 o un DIMEX de 11 a 12 dígitos.'
  }

  const correo = values.correoElectronico.trim()
  if (!correo) errors.correoElectronico = 'El correo electrónico es obligatorio.'
  else if (correo.length > 150) errors.correoElectronico = 'Use un máximo de 150 caracteres.'
  else if (!EMAIL_PATTERN.test(correo)) {
    errors.correoElectronico = 'Ingrese un correo electrónico válido.'
  }
  return errors
}

export function toColaboradorPayload(
  values: ColaboradorFormValues,
  modo: 'crear' | 'editar',
): ColaboradorPayload {
  const usuarioId = values.usuarioId ? Number(values.usuarioId) : null
  const payload: ColaboradorPayload = {
    nombre: values.nombre.trim(),
    apellidos: values.apellidos.trim(),
    cedula: values.cedula.trim(),
    correoElectronico: values.correoElectronico.trim().toLowerCase(),
    cargo: values.cargo.trim(),
  }
  if (usuarioId !== null) payload.usuarioId = usuarioId
  else if (modo === 'editar') payload.usuarioId = null
  return payload
}

export const toColaboradorFormValues = (colaborador: Colaborador): ColaboradorFormValues => ({
  nombre: colaborador.nombre,
  apellidos: colaborador.apellidos,
  cedula: colaborador.cedula,
  correoElectronico: colaborador.correoElectronico,
  cargo: colaborador.cargo,
  usuarioId: colaborador.usuarioId ? String(colaborador.usuarioId) : '',
})

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

const detalleBackend = (error: unknown): string => {
  const message = error instanceof Error ? error.message : ''
  const detail = message.replace(/^HTTP\s+\d{3}:\s*/i, '').trim()
  if (!detail) return ''
  try {
    const parsed: unknown = JSON.parse(detail)
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
        .map((item) => (/[^.!?]$/.test(item.trim()) ? `${item.trim()}.` : item.trim()))
        .join(' ')
    }
  } catch {
    // El backend también puede responder un único mensaje de texto.
  }
  return detail
}

export function colaboradorErrorMessage(error: unknown, fallback: string): string {
  const status = getHttpStatus(error)
  if (status === 403) return 'No tiene permisos para administrar colaboradores.'
  if (status === 404) return 'El colaborador indicado no existe o fue eliminado.'
  if (status === 409) {
    return detalleBackend(error) || 'La cédula o la cuenta de usuario ya pertenece a otro colaborador.'
  }
  if (status === 400) return detalleBackend(error) || 'Revise los datos ingresados.'
  if (status === null) return 'No fue posible conectar con el servidor. Revise su conexión.'
  return fallback
}
