import {
  PROYECTO_DURACION_MAX_LENGTH,
  PROYECTO_ENCARGADO_MAX_LENGTH,
  PROYECTO_NOMBRE_MAX_LENGTH,
} from './validateProyectoForm'
import type { ProyectoFormField } from './types'

export const PROYECTO_SAVE_FALLBACK_ERROR =
  'No fue posible guardar los cambios. Intente nuevamente.'

export const PROYECTO_NOT_FOUND_ERROR = 'El proyecto no existe.'

export type { ProyectoFormField }

export type ProyectoSubmitError =
  | {
      kind: 'validation'
      formMessage: string | null
      fieldErrors: Partial<Record<ProyectoFormField, string>>
    }
  | { kind: 'not-found' }
  | { kind: 'unauthorized' }
  | { kind: 'forbidden' }
  | { kind: 'save' }

const HTTP_ERROR_PATTERN = /^HTTP (\d+):\s*([\s\S]*)$/

const UNSAFE_DETAIL_PATTERN =
  /stack|at\s+\S+\s+\(|SELECT\s|INSERT\s|UPDATE\s|DELETE\s|FROM\s+dbo|TypeORM|QueryFailedError|ECONNREFUSED|Cannot read|undefined is not|Exception:|\.ts:\d+|\.js:\d+/i

const FIELD_MATCHERS: { field: ProyectoFormField; pattern: RegExp }[] = [
  { field: 'encargadoRealizacion', pattern: /encargado/i },
  { field: 'descripcion', pattern: /descripci[oó]n/i },
  { field: 'duracion', pattern: /duraci[oó]n/i },
  { field: 'estado', pattern: /estado/i },
  { field: 'nombre', pattern: /nombre/i },
]

export const getHttpErrorStatus = (error: unknown): number | null => {
  if (!(error instanceof Error) || !error.message.trim()) {
    return null
  }

  const match = HTTP_ERROR_PATTERN.exec(error.message)
  return match ? Number(match[1]) : null
}

const getHttpErrorDetail = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return ''
  }

  const match = HTTP_ERROR_PATTERN.exec(error.message)
  return match ? match[2].trim() : ''
}

const isUnsafeDetail = (detail: string): boolean =>
  !detail.trim() || UNSAFE_DETAIL_PATTERN.test(detail)

const toMessageList = (detail: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(detail)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string')
    }
    if (typeof parsed === 'string' && parsed.trim()) {
      return [parsed.trim()]
    }
  } catch {
    /* El cliente HTTP une message[] con comas. */
  }

  if (!detail.trim()) {
    return []
  }

  return detail
    .split(/,(?=[A-ZÁÉÍÓÚ"[])/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const toFieldMessage = (raw: string, field: ProyectoFormField): string => {
  if (field === 'nombre' && /shorter|maxLength|200/i.test(raw)) {
    return `El nombre del proyecto no puede superar ${PROYECTO_NOMBRE_MAX_LENGTH} caracteres.`
  }
  if (field === 'encargadoRealizacion' && /shorter|maxLength|150/i.test(raw)) {
    return `El encargado no puede superar ${PROYECTO_ENCARGADO_MAX_LENGTH} caracteres.`
  }
  if (field === 'duracion' && /shorter|maxLength|100/i.test(raw)) {
    return `La duración no puede superar ${PROYECTO_DURACION_MAX_LENGTH} caracteres.`
  }
  if (field === 'estado' && /enum|PENDIENTE|EN_PROCESO|COMPLETADO/i.test(raw)) {
    return 'Seleccione un estado válido.'
  }

  return raw.trim()
}

const matchField = (message: string): ProyectoFormField | null => {
  const matched = FIELD_MATCHERS.find(({ pattern }) => pattern.test(message))
  return matched?.field ?? null
}

const toValidationError = (detail: string): ProyectoSubmitError => {
  const fieldErrors: Partial<Record<ProyectoFormField, string>> = {}
  const unmapped: string[] = []

  for (const raw of toMessageList(detail)) {
    const trimmed = raw.replace(/^"+|"+$/g, '').trim()
    if (!trimmed || /should not exist/i.test(trimmed) || isUnsafeDetail(trimmed)) {
      continue
    }

    const field = matchField(trimmed)
    if (!field) {
      unmapped.push(trimmed)
      continue
    }

    fieldErrors[field] = toFieldMessage(trimmed, field)
  }

  const formMessage =
    Object.keys(fieldErrors).length === 0
      ? unmapped[0] ?? 'Revise los datos del proyecto.'
      : unmapped[0] ?? null

  return {
    kind: 'validation',
    formMessage,
    fieldErrors,
  }
}

export function parseProyectoSubmitError(error: unknown): ProyectoSubmitError {
  const status = getHttpErrorStatus(error)

  if (status === 401) {
    return { kind: 'unauthorized' }
  }
  if (status === 403) {
    return { kind: 'forbidden' }
  }
  if (status === 404) {
    return { kind: 'not-found' }
  }
  if (status === 400 || status === 422) {
    return toValidationError(getHttpErrorDetail(error))
  }

  return { kind: 'save' }
}

export function toProyectoFormSubmitError(error: unknown): string | null {
  const parsed = parseProyectoSubmitError(error)

  if (parsed.kind === 'validation') {
    const firstFieldError = Object.values(parsed.fieldErrors)[0]
    return parsed.formMessage ?? firstFieldError ?? 'Revise los datos del proyecto.'
  }

  if (parsed.kind === 'save') {
    return PROYECTO_SAVE_FALLBACK_ERROR
  }

  return null
}
