import { getHttpStatus, nombreCompleto } from './colaboradorForm'
import {
  esFechaCalendario,
  fechaPermisoIso,
  formatearFechaPermiso,
} from './permisoForm'
import type {
  Incapacidad,
  IncapacidadFormValues,
  IncapacidadPayload,
} from './types'

export type IncapacidadFormErrors = Partial<
  Record<keyof IncapacidadFormValues, string>
>

export const EMPTY_INCAPACIDAD_VALUES: IncapacidadFormValues = {
  colaboradorId: '',
  fechaInicio: '',
  fechaFin: '',
  observaciones: '',
}

export { esFechaCalendario, formatearFechaPermiso }

export const nombreColaboradorIncapacidad = (incapacidad: Incapacidad) =>
  incapacidad.colaborador
    ? nombreCompleto(incapacidad.colaborador)
    : `Colaborador #${incapacidad.colaboradorId}`

export const resumenObservaciones = (
  observaciones: string | null | undefined,
  max = 80,
) => {
  const texto = observaciones?.trim()
  if (!texto) return 'Sin observaciones'
  if (texto.length <= max) return texto
  return `${texto.slice(0, max - 1)}…`
}

export function validateIncapacidad(
  values: IncapacidadFormValues,
): IncapacidadFormErrors {
  const errors: IncapacidadFormErrors = {}
  if (!values.colaboradorId.trim()) {
    errors.colaboradorId = 'Seleccione el colaborador.'
  }
  if (!values.fechaInicio.trim()) {
    errors.fechaInicio = 'La fecha de inicio es obligatoria.'
  } else if (!esFechaCalendario(values.fechaInicio)) {
    errors.fechaInicio = 'Use una fecha válida.'
  }
  if (!values.fechaFin.trim()) {
    errors.fechaFin = 'La fecha de fin es obligatoria.'
  } else if (!esFechaCalendario(values.fechaFin)) {
    errors.fechaFin = 'Use una fecha válida.'
  } else if (
    values.fechaInicio &&
    esFechaCalendario(values.fechaInicio) &&
    values.fechaFin < values.fechaInicio
  ) {
    errors.fechaFin =
      'La fecha final no puede ser anterior a la fecha inicial.'
  }
  if (values.observaciones.trim().length > 500) {
    errors.observaciones = 'Use un máximo de 500 caracteres.'
  }
  return errors
}

export function toIncapacidadPayload(
  values: IncapacidadFormValues,
): IncapacidadPayload {
  const observaciones = values.observaciones.trim()
  return {
    colaboradorId: Number(values.colaboradorId),
    fechaInicio: values.fechaInicio,
    fechaFin: values.fechaFin,
    observaciones: observaciones === '' ? null : observaciones,
  }
}

export const toIncapacidadFormValues = (
  incapacidad: Incapacidad,
): IncapacidadFormValues => ({
  colaboradorId: String(incapacidad.colaboradorId),
  fechaInicio: fechaPermisoIso(incapacidad.fechaInicio),
  fechaFin: fechaPermisoIso(incapacidad.fechaFin),
  observaciones: incapacidad.observaciones ?? '',
})

export function incapacidadErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const status = getHttpStatus(error)
  if (status === 403) {
    return 'No tiene acceso para administrar las incapacidades del personal.'
  }
  if (status === 404) {
    const message = error instanceof Error ? error.message : ''
    const detail = message.replace(/^HTTP\s+\d{3}:\s*/i, '').trim()
    if (/colaborador/i.test(detail)) {
      return 'No se encontró el colaborador solicitado.'
    }
    return 'No se encontró la incapacidad solicitada.'
  }
  if (status === 400) {
    const message = error instanceof Error ? error.message : ''
    const detail = message.replace(/^HTTP\s+\d{3}:\s*/i, '').trim()
    if (!detail) return 'Revise los datos ingresados.'
    try {
      const parsed: unknown = JSON.parse(detail)
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (item): item is string =>
              typeof item === 'string' && Boolean(item.trim()),
          )
          .join(' ')
      }
    } catch {
      return detail
    }
    return detail
  }
  if (status === null) {
    return 'No fue posible conectar con el servidor. Revise su conexión.'
  }
  if (status >= 500) {
    return 'No fue posible completar la operación. Intente nuevamente.'
  }
  return fallback
}
