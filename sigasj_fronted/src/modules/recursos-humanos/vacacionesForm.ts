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
  {
    value: 'ACUMULADO',
    label: 'Adquisición',
    descripcion: 'Registra días de vacaciones adquiridos (suma al saldo disponible).',
  },
  {
    value: 'DISFRUTADO',
    label: 'Disfrute',
    descripcion: 'Registra días disfrutados (resta del saldo disponible).',
  },
  {
    value: 'AJUSTE',
    label: 'Ajuste',
    descripcion: 'Corrección administrativa con motivo obligatorio (suma o resta).',
  },
]

export const EMPTY_MOVIMIENTO_VACACIONES_VALUES: MovimientoVacacionesFormValues = {
  tipo: '',
  cantidadDias: '',
  signoAjuste: '',
  fecha: '',
  observaciones: '',
}

export const tipoMovimientoLabel = (tipo: TipoMovimientoVacaciones) =>
  TIPOS_MOVIMIENTO_VACACIONES.find((item) => item.value === tipo)?.label ?? tipo

export const diasConSigno = (
  movimiento: Pick<MovimientoVacaciones, 'tipo' | 'cantidadDias' | 'signoAjuste'>,
) => {
  if (movimiento.tipo === 'DISFRUTADO') return `-${movimiento.cantidadDias}`
  if (movimiento.tipo === 'AJUSTE') {
    const signo = movimiento.signoAjuste === -1 ? '-' : '+'
    return `${signo}${movimiento.cantidadDias}`
  }
  return `+${movimiento.cantidadDias}`
}

export const pluralDias = (cantidad: number) => `${cantidad} día${cantidad === 1 ? '' : 's'}`

export const avisoMovimientoRegistrado = (
  tipo: TipoMovimientoVacaciones,
  cantidadDias: number,
  signoAjuste?: 1 | -1 | null,
) => {
  const dias = pluralDias(cantidadDias)
  const unDia = cantidadDias === 1
  if (tipo === 'ACUMULADO') {
    return `${unDia ? 'Se registró' : 'Se registraron'} ${dias} adquirido${unDia ? '' : 's'}.`
  }
  if (tipo === 'DISFRUTADO') {
    return `${unDia ? 'Se registró' : 'Se registraron'} ${dias} disfrutado${unDia ? '' : 's'}.`
  }
  const verbo = signoAjuste === -1 ? 'restaron' : 'sumaron'
  const verboUno = signoAjuste === -1 ? 'restó' : 'sumó'
  return `${unDia ? `Se ${verboUno}` : `Se ${verbo}`} ${dias} de ajuste.`
}

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
    errors.tipo = 'El tipo debe ser Adquisición, Disfrute o Ajuste.'
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
  } else if (
    values.tipo === 'AJUSTE' &&
    values.signoAjuste === '-1' &&
    diasDisponibles !== null &&
    cantidad > diasDisponibles
  ) {
    errors.cantidadDias = `Solo hay ${pluralDias(diasDisponibles)} disponible${diasDisponibles === 1 ? '' : 's'}.`
  }

  if (values.tipo === 'AJUSTE') {
    if (values.signoAjuste !== '1' && values.signoAjuste !== '-1') {
      errors.signoAjuste = 'Indique si el ajuste suma o resta.'
    }
    if (!values.observaciones.trim()) {
      errors.observaciones = 'El motivo del ajuste es obligatorio.'
    }
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
  const payload: MovimientoVacacionesPayload = {
    colaboradorId,
    tipo: values.tipo as TipoMovimientoVacaciones,
    cantidadDias: Number(values.cantidadDias.trim()),
    fecha: values.fecha.trim(),
    observaciones: observaciones === '' ? null : observaciones,
  }
  if (values.tipo === 'AJUSTE') {
    payload.signoAjuste = values.signoAjuste === '-1' ? -1 : 1
  }
  return payload
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
    // texto plano
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
