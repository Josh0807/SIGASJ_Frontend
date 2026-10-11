import { getHttpStatus } from './colaboradorForm'
import { esFechaCalendario, fechaPermisoIso } from './permisoForm'
import type {
  MovimientoVacaciones,
  MovimientoVacacionesFormValues,
  MovimientoVacacionesPayload,
  TipoMovimientoVacaciones,
} from './types'

export type MovimientoVacacionesFormErrors = Partial<
  Record<keyof MovimientoVacacionesFormValues, string>
>

export const TIPOS_MOVIMIENTO_VACACIONES: ReadonlyArray<{
  value: TipoMovimientoVacaciones
  label: string
  descripcion: string
}> = [
  { value: 'ACUMULADO', label: 'Acumulado', descripcion: 'Suma días al saldo disponible.' },
  { value: 'DISFRUTADO', label: 'Disfrutado', descripcion: 'Resta días del saldo disponible.' },
]

export const EMPTY_MOVIMIENTO_VACACIONES_VALUES: MovimientoVacacionesFormValues = {
  tipo: '',
  cantidadDias: '',
  fecha: '',
  observaciones: '',
}

export const tipoMovimientoLabel = (tipo: TipoMovimientoVacaciones) =>
  TIPOS_MOVIMIENTO_VACACIONES.find((item) => item.value === tipo)?.label ?? tipo

/** `+2` para acumulados y `-3` para disfrutados, como en el historial del requerimiento. */
export const diasConSigno = (movimiento: Pick<MovimientoVacaciones, 'tipo' | 'cantidadDias'>) =>
  `${movimiento.tipo === 'DISFRUTADO' ? '-' : '+'}${movimiento.cantidadDias}`

export const pluralDias = (cantidad: number) => `${cantidad} día${cantidad === 1 ? '' : 's'}`

/** Formato corto dd/MM/yyyy sin desfase de zona horaria. */
export const formatearFechaMovimiento = (valor: string) => {
  if (typeof valor !== 'string') return '—'
  const iso = fechaPermisoIso(valor)
  if (!esFechaCalendario(iso)) return '—'
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export const esTipoMovimiento = (valor: string): valor is TipoMovimientoVacaciones =>
  TIPOS_MOVIMIENTO_VACACIONES.some((item) => item.value === valor)

export function validateMovimientoVacaciones(
  values: MovimientoVacacionesFormValues,
  diasDisponibles: number | null = null,
): MovimientoVacacionesFormErrors {
  const errors: MovimientoVacacionesFormErrors = {}

  if (!values.tipo) {
    errors.tipo = 'Seleccione el tipo de movimiento.'
  } else if (!esTipoMovimiento(values.tipo)) {
    errors.tipo = 'El tipo debe ser Acumulado o Disfrutado.'
  }

  const cantidadTexto = values.cantidadDias.trim()
  const cantidad = Number(cantidadTexto)
  if (!cantidadTexto) {
    errors.cantidadDias = 'Indique la cantidad de días.'
  } else if (!/^\d+$/.test(cantidadTexto) || !Number.isInteger(cantidad)) {
    errors.cantidadDias = 'Use un número entero de días.'
  } else if (cantidad <= 0) {
    errors.cantidadDias = 'La cantidad debe ser mayor a cero.'
  } else if (
    values.tipo === 'DISFRUTADO' &&
    diasDisponibles !== null &&
    cantidad > diasDisponibles
  ) {
    errors.cantidadDias = `Solo hay ${pluralDias(diasDisponibles)} disponible${diasDisponibles === 1 ? '' : 's'}.`
  }

  if (!values.fecha.trim()) {
    errors.fecha = 'La fecha es obligatoria.'
  } else if (!esFechaCalendario(values.fecha)) {
    errors.fecha = 'Use una fecha válida.'
  }

  if (values.observaciones.trim().length > 500) {
    errors.observaciones = 'Use un máximo de 500 caracteres.'
  }
  return errors
}

export function toMovimientoVacacionesPayload(
  colaboradorId: number,
  values: MovimientoVacacionesFormValues,
): MovimientoVacacionesPayload {
  const observaciones = values.observaciones.trim()
  return {
    colaboradorId,
    tipo: values.tipo as TipoMovimientoVacaciones,
    cantidadDias: Number(values.cantidadDias.trim()),
    fecha: values.fecha.trim(),
    observaciones: observaciones === '' ? null : observaciones,
  }
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

export function vacacionesErrorMessage(error: unknown, fallback: string): string {
  const status = getHttpStatus(error)
  if (status === 403) return 'No tiene acceso para administrar las vacaciones del personal.'
  if (status === 404) return 'El colaborador indicado no existe o fue eliminado.'
  if (status === 400) return detalleBackend(error) || 'Revise los datos ingresados.'
  if (status === null) return 'No fue posible conectar con el servidor. Revise su conexión.'
  return fallback
}
