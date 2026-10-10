import type { PermisoColaborador, PermisoFormValues, PermisoPayload } from './types'
import { getHttpStatus, nombreCompleto } from './colaboradorForm'

export type PermisoFormErrors = Partial<Record<keyof PermisoFormValues, string>>

const FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/

export const EMPTY_PERMISO_VALUES: PermisoFormValues = {
  colaboradorId: '',
  fechaInicio: '',
  fechaFin: '',
  motivo: '',
  observaciones: '',
}

export const esFechaCalendario = (valor: string) => {
  const match = FECHA_ISO.exec(valor.trim())
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export const fechaPermisoIso = (valor: string) => {
  const texto = valor.trim()
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(texto)
  return match ? match[1] : texto
}

export const formatearFechaPermiso = (valor: string) => {
  const iso = fechaPermisoIso(valor)
  if (!esFechaCalendario(iso)) return '—'
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('es-CR', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
}

export const nombreColaboradorPermiso = (permiso: PermisoColaborador) =>
  permiso.colaborador ? nombreCompleto(permiso.colaborador) : `Colaborador #${permiso.colaboradorId}`

export function validatePermiso(values: PermisoFormValues): PermisoFormErrors {
  const errors: PermisoFormErrors = {}
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
    errors.fechaFin = 'La fecha de fin no puede ser anterior al inicio.'
  }
  const motivo = values.motivo.trim()
  if (!motivo) errors.motivo = 'El motivo es obligatorio.'
  else if (motivo.length > 200) errors.motivo = 'Use un máximo de 200 caracteres.'
  if (values.observaciones.trim().length > 500) {
    errors.observaciones = 'Use un máximo de 500 caracteres.'
  }
  return errors
}

export function toPermisoPayload(values: PermisoFormValues): PermisoPayload {
  const observaciones = values.observaciones.trim()
  return {
    colaboradorId: Number(values.colaboradorId),
    fechaInicio: values.fechaInicio,
    fechaFin: values.fechaFin,
    motivo: values.motivo.trim(),
    observaciones: observaciones === '' ? null : observaciones,
  }
}

export const toPermisoFormValues = (permiso: PermisoColaborador): PermisoFormValues => ({
  colaboradorId: String(permiso.colaboradorId),
  fechaInicio: fechaPermisoIso(permiso.fechaInicio),
  fechaFin: fechaPermisoIso(permiso.fechaFin),
  motivo: permiso.motivo,
  observaciones: permiso.observaciones ?? '',
})

export function permisoErrorMessage(error: unknown, fallback: string): string {
  const status = getHttpStatus(error)
  if (status === 403) return 'No tiene acceso para administrar los permisos del personal.'
  if (status === 404) return 'El permiso indicado no existe o fue eliminado.'
  if (status === 400) {
    const message = error instanceof Error ? error.message : ''
    const detail = message.replace(/^HTTP\s+\d{3}:\s*/i, '').trim()
    if (!detail) return 'Revise los datos ingresados.'
    try {
      const parsed: unknown = JSON.parse(detail)
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
          .join(' ')
      }
    } catch {
      return detail
    }
    return detail
  }
  if (status === null) return 'No fue posible conectar con el servidor. Revise su conexión.'
  return fallback
}
