import {
  esFechaCalendario,
  hoyEnAsada,
  ZONA_HORARIA_ASADA,
} from '../../shared/utils/fechaAsada'
import type {
  Colaborador,
  ColaboradorFormValues,
  ColaboradorPayload,
  JornadaLaboral,
  ModalidadPago,
} from './types'

export type ColaboradorFormErrors = Partial<Record<keyof ColaboradorFormValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CEDULA_NACIONAL_PATTERN = /^([1-9])-?(\d{4})-?(\d{4})$/
const CEDULA_DIMEX_PATTERN = /^\d{11,12}$/

/** Sugerencias legacy para filtros de listado (el alta usa el catálogo de puestos). */
export const CARGOS_SUGERIDOS = [
  'Administración',
  'Secretaría',
  'Fontanero',
  'Operación',
  'Atención al usuario',
  'Personal técnico',
] as const

export const JORNADAS_LABORALES: Array<{ value: JornadaLaboral; label: string }> = [
  { value: 'COMPLETA', label: 'Jornada completa' },
  { value: 'MEDIA', label: 'Media jornada' },
  { value: 'POR_HORAS', label: 'Por horas' },
]

export const MODALIDADES_PAGO: Array<{ value: ModalidadPago; label: string }> = [
  { value: 'MENSUAL', label: 'Mensual' },
  { value: 'QUINCENAL', label: 'Quincenal' },
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'POR_HORA', label: 'Por hora' },
]

export const EMPTY_COLABORADOR_VALUES: ColaboradorFormValues = {
  nombre: '',
  apellidos: '',
  cedula: '',
  correoElectronico: '',
  puestoId: '',
  usuarioId: '',
  fechaIngreso: '',
  jornadaLaboral: '',
  diasLaboralesHabituales: '',
  modalidadPago: '',
}

export const etiquetaJornada = (valor: JornadaLaboral | null | undefined) =>
  JORNADAS_LABORALES.find((item) => item.value === valor)?.label ?? '—'

export const etiquetaModalidadPago = (valor: ModalidadPago | null | undefined) =>
  MODALIDADES_PAGO.find((item) => item.value === valor)?.label ?? '—'

export const formatearFechaIngreso = (valor: string | null | undefined) => {
  if (!valor || !esFechaCalendario(valor)) return '—'
  const [year, month, day] = valor.split('-').map(Number)
  const fecha = new Date(Date.UTC(year, month - 1, day, 12))
  return fecha.toLocaleDateString('es-CR', {
    dateStyle: 'medium',
    timeZone: ZONA_HORARIA_ASADA,
  })
}

export const nombreCompleto = (colaborador: Pick<Colaborador, 'nombre' | 'apellidos'>) =>
  `${colaborador.nombre} ${colaborador.apellidos}`.trim()

export const estadoLabel = (activo: boolean) => (activo ? 'Activo' : 'Inactivo')

/**
 * createdAt/updatedAt los escribe el API como instantes UTC reales (sufijo Z), por lo que
 * se convierten a la hora de Costa Rica. Antes los asignaba SQL Server con GETDATE() (hora
 * local) y aquí se mostraban "tal cual"; los registros históricos de esa época pueden verse
 * 6 horas atrasados hasta aplicar scripts/corregir-fechas-historicas.sql.
 */
export const formatearFechaAuditoria = (valor: string) => {
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime())
    ? '—'
    : fecha.toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short', timeZone: ZONA_HORARIA_ASADA })
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
  if (!values.puestoId.trim()) {
    errors.puestoId = 'Seleccione el puesto.'
  }

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

  const fechaIngreso = values.fechaIngreso.trim()
  if (fechaIngreso) {
    if (!esFechaCalendario(fechaIngreso)) {
      errors.fechaIngreso = 'Use el formato AAAA-MM-DD.'
    } else if (fechaIngreso > hoyEnAsada()) {
      errors.fechaIngreso = 'La fecha de ingreso no puede ser futura.'
    }
  }

  const dias = values.diasLaboralesHabituales.trim()
  if (dias) {
    const n = Number(dias)
    if (!Number.isInteger(n) || n < 1 || n > 7) {
      errors.diasLaboralesHabituales = 'Indique un número entre 1 y 7.'
    }
  }

  return errors
}

export function toColaboradorPayload(
  values: ColaboradorFormValues,
  modo: 'crear' | 'editar',
): ColaboradorPayload {
  const usuarioId = values.usuarioId ? Number(values.usuarioId) : null
  const fechaIngreso = values.fechaIngreso.trim()
  const dias = values.diasLaboralesHabituales.trim()
  const payload: ColaboradorPayload = {
    nombre: values.nombre.trim(),
    apellidos: values.apellidos.trim(),
    cedula: values.cedula.trim(),
    correoElectronico: values.correoElectronico.trim().toLowerCase(),
    puestoId: Number(values.puestoId),
  }
  if (usuarioId !== null) payload.usuarioId = usuarioId
  else if (modo === 'editar') payload.usuarioId = null

  if (fechaIngreso) payload.fechaIngreso = fechaIngreso
  else if (modo === 'editar') payload.fechaIngreso = null

  if (values.jornadaLaboral) payload.jornadaLaboral = values.jornadaLaboral
  else if (modo === 'editar') payload.jornadaLaboral = null

  if (dias) payload.diasLaboralesHabituales = Number(dias)
  else if (modo === 'editar') payload.diasLaboralesHabituales = null

  if (values.modalidadPago) payload.modalidadPago = values.modalidadPago
  else if (modo === 'editar') payload.modalidadPago = null

  return payload
}

export const toColaboradorFormValues = (colaborador: Colaborador): ColaboradorFormValues => ({
  nombre: colaborador.nombre,
  apellidos: colaborador.apellidos,
  cedula: colaborador.cedula,
  correoElectronico: colaborador.correoElectronico,
  puestoId: colaborador.puestoId ? String(colaborador.puestoId) : '',
  usuarioId: colaborador.usuarioId ? String(colaborador.usuarioId) : '',
  fechaIngreso: colaborador.fechaIngreso ?? '',
  jornadaLaboral: colaborador.jornadaLaboral ?? '',
  diasLaboralesHabituales:
    colaborador.diasLaboralesHabituales != null
      ? String(colaborador.diasLaboralesHabituales)
      : '',
  modalidadPago: colaborador.modalidadPago ?? '',
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
