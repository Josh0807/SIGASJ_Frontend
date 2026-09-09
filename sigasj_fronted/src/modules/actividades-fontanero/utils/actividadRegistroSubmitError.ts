import type { ActividadRegistroFormField } from '../types/actividadRegistroForm'
import { ACTIVITY_FEEDBACK_MESSAGES } from './activityFeedbackMessages'
import { getHttpErrorStatus } from './httpErrorStatus'
import { interpretActividadApiError } from './interpretActividadApiError'

/** @deprecated Prefer ACTIVITY_FEEDBACK_MESSAGES — se mantienen por tests legacy */
export const ACTIVIDAD_REGISTRO_SAVE_FALLBACK_ERROR =
  ACTIVITY_FEEDBACK_MESSAGES.server

export const ACTIVIDAD_CORRECCION_SAVE_FALLBACK_ERROR =
  ACTIVITY_FEEDBACK_MESSAGES.server

export const ACTIVIDAD_REGISTRO_UNAUTHORIZED_ERROR =
  ACTIVITY_FEEDBACK_MESSAGES.unauthorized

export const ACTIVIDAD_REGISTRO_FORBIDDEN_ERROR =
  ACTIVITY_FEEDBACK_MESSAGES.forbidden

export const ACTIVIDAD_REGISTRO_CLIENT_VALIDATION_ERROR =
  'Complete los campos obligatorios antes de registrar la actividad.'

export const ACTIVIDAD_CORRECCION_CLIENT_VALIDATION_ERROR =
  'Revise y complete los campos indicados antes de reenviar la actividad.'

export const ACTIVIDAD_REGISTRO_SERVER_ERROR = ACTIVITY_FEEDBACK_MESSAGES.server

export type ActividadRegistroSubmitError =
  | {
      kind: 'validation'
      formMessage: string | null
      fieldErrors: Partial<Record<ActividadRegistroFormField, string>>
    }
  | { kind: 'unauthorized' }
  | { kind: 'forbidden' }
  | { kind: 'not-found' }
  | { kind: 'network' }
  | { kind: 'server' }
  | { kind: 'save' }

const HTTP_ERROR_PATTERN = /^HTTP (\d+):\s*([\s\S]*)$/

const FIELD_MATCHERS: { field: ActividadRegistroFormField; pattern: RegExp }[] = [
  { field: 'ubicacionFuga', pattern: /ubicaci[oó]n.*fuga|fuga/i },
  { field: 'presionMedida', pattern: /presi[oó]n/i },
  { field: 'resultadoVisita', pattern: /resultado.*visita|visita/i },
  { field: 'cantidadCloro', pattern: /cloro/i },
  { field: 'caudal', pattern: /caudal/i },
  { field: 'documentos', pattern: /documento|adjunt|archivo|pdf|jpg|png|10\s*mb/i },
  { field: 'fechaActividad', pattern: /fecha/i },
  { field: 'titulo', pattern: /t[ií]tulo|resumen/i },
  { field: 'descripcion', pattern: /descripci[oó]n/i },
  { field: 'ubicacion', pattern: /ubicaci[oó]n/i },
  { field: 'observaciones', pattern: /observaciones/i },
]

const TECHNICAL_PATTERN =
  /\b(QueryFailedError|EntityNotFoundError|TypeORM|SQL|stack|constraint|INSERT|UPDATE|DELETE|SELECT|driverError|ECONNREFUSED)/i

const getHttpErrorDetail = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return ''
  }

  const match = HTTP_ERROR_PATTERN.exec(error.message)
  if (!match) {
    return ''
  }

  return match[2].trim()
}

const toMessageList = (detail: string): string[] => {
  if (!detail.trim()) {
    return []
  }

  if (detail.startsWith('[') && detail.endsWith(']')) {
    try {
      const parsed: unknown = JSON.parse(detail)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string')
      }
    } catch {
      /* continuar con split */
    }
  }

  try {
    const parsed: unknown = JSON.parse(detail)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string')
    }
    if (typeof parsed === 'string' && parsed.trim()) {
      return [parsed.trim()]
    }
  } catch {
    /* continuar con split */
  }

  return detail
    .split(/,(?=[A-ZÁÉÍÓÚ"[])/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const matchField = (message: string): ActividadRegistroFormField | null => {
  const matched = FIELD_MATCHERS.find(({ pattern }) => pattern.test(message))
  return matched?.field ?? null
}

const sanitizeUserFacingMessage = (message: string): string => {
  const trimmed = message
    .replace(/^HTTP \d+:\s*/i, '')
    .replace(/^"+|"+$/g, '')
    .replace(/\b(dto|property|must be|should not)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  if (
    !trimmed ||
    /^[[\]{}]+$/.test(trimmed) ||
    TECHNICAL_PATTERN.test(trimmed) ||
    trimmed.length > 220
  ) {
    return ACTIVITY_FEEDBACK_MESSAGES.validationReview
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

const toValidationError = (detail: string): ActividadRegistroSubmitError => {
  const fieldErrors: Partial<Record<ActividadRegistroFormField, string>> = {}
  const unmapped: string[] = []

  for (const raw of toMessageList(detail)) {
    const trimmed = sanitizeUserFacingMessage(raw)
    if (
      !trimmed ||
      /should not exist/i.test(raw) ||
      trimmed === ACTIVITY_FEEDBACK_MESSAGES.validationReview
    ) {
      if (TECHNICAL_PATTERN.test(raw) || raw.length > 220) {
        continue
      }
      if (trimmed === ACTIVITY_FEEDBACK_MESSAGES.validationReview) {
        unmapped.push(trimmed)
      }
      continue
    }

    const field = matchField(trimmed)
    if (!field) {
      unmapped.push(trimmed)
      continue
    }

    fieldErrors[field] = trimmed
  }

  const hasFields = Object.keys(fieldErrors).length > 0
  const formMessage = hasFields
    ? ACTIVITY_FEEDBACK_MESSAGES.validationReview
    : unmapped[0] ?? ACTIVITY_FEEDBACK_MESSAGES.validationReview

  return {
    kind: 'validation',
    formMessage,
    fieldErrors,
  }
}

export const parseActividadRegistroSubmitError = (
  error: unknown,
): ActividadRegistroSubmitError => {
  const interpreted = interpretActividadApiError(error)

  if (interpreted.kind === 'unauthorized') {
    return { kind: 'unauthorized' }
  }
  if (interpreted.kind === 'forbidden') {
    return { kind: 'forbidden' }
  }
  if (interpreted.kind === 'not-found') {
    return { kind: 'not-found' }
  }
  if (interpreted.kind === 'network') {
    return { kind: 'network' }
  }
  if (interpreted.kind === 'validation') {
    return toValidationError(getHttpErrorDetail(error))
  }
  if (interpreted.kind === 'server') {
    return { kind: 'server' }
  }

  const status = getHttpErrorStatus(error)
  if (status !== null && status >= 500) {
    return { kind: 'server' }
  }

  return { kind: 'save' }
}

export const toActividadRegistroSubmitMessage = (
  error: unknown,
  options?: { mode?: 'registrar' | 'corregir' },
): string => {
  const isCorregirMode = options?.mode === 'corregir'
  const parsed = parseActividadRegistroSubmitError(error)

  if (parsed.kind === 'validation') {
    const firstFieldError = Object.values(parsed.fieldErrors)[0]
    return (
      parsed.formMessage ??
      firstFieldError ??
      ACTIVITY_FEEDBACK_MESSAGES.validationReview
    )
  }
  if (parsed.kind === 'unauthorized') {
    return ACTIVITY_FEEDBACK_MESSAGES.unauthorized
  }
  if (parsed.kind === 'forbidden') {
    return ACTIVITY_FEEDBACK_MESSAGES.forbidden
  }
  if (parsed.kind === 'network') {
    return ACTIVITY_FEEDBACK_MESSAGES.network
  }
  if (parsed.kind === 'server') {
    return ACTIVITY_FEEDBACK_MESSAGES.server
  }
  if (parsed.kind === 'not-found') {
    return isCorregirMode
      ? 'La actividad seleccionada ya no está disponible para corrección.'
      : 'El tipo de actividad seleccionado ya no está disponible.'
  }

  return interpretActividadApiError(error).message
}
