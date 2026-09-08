import type { ActividadRegistroFormField } from '../types/actividadRegistroForm'

export const ACTIVIDAD_REGISTRO_SAVE_FALLBACK_ERROR =
  'No se pudo registrar la actividad. Intente nuevamente en unos momentos.'

export const ACTIVIDAD_REGISTRO_UNAUTHORIZED_ERROR =
  'Su sesión no es válida o ha vencido. Vuelva a iniciar sesión para registrar la actividad.'

export const ACTIVIDAD_REGISTRO_FORBIDDEN_ERROR =
  'No tiene permiso para registrar actividades en este módulo.'

export const ACTIVIDAD_REGISTRO_SERVER_ERROR =
  'Ocurrió un error en el servidor. Intente nuevamente más tarde.'

export type ActividadRegistroSubmitError =
  | {
      kind: 'validation'
      formMessage: string | null
      fieldErrors: Partial<Record<ActividadRegistroFormField, string>>
    }
  | { kind: 'unauthorized' }
  | { kind: 'forbidden' }
  | { kind: 'not-found' }
  | { kind: 'save' }

const HTTP_ERROR_PATTERN = /^HTTP (\d+):\s*([\s\S]*)$/

const FIELD_MATCHERS: { field: ActividadRegistroFormField; pattern: RegExp }[] = [
  { field: 'ubicacionFuga', pattern: /ubicaci[oó]n.*fuga|fuga/i },
  { field: 'presionMedida', pattern: /presi[oó]n/i },
  { field: 'resultadoVisita', pattern: /resultado.*visita|visita/i },
  { field: 'cantidadCloro', pattern: /cloro/i },
  { field: 'caudal', pattern: /caudal/i },
  { field: 'documentos', pattern: /documento|adjunt/i },
  { field: 'fechaActividad', pattern: /fecha/i },
  { field: 'titulo', pattern: /t[ií]tulo|resumen/i },
  { field: 'ubicacion', pattern: /ubicaci[oó]n/i },
  { field: 'observaciones', pattern: /observaciones/i },
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
  if (!match) {
    return ''
  }

  const detail = match[2].trim()
  if (detail.startsWith('[') && detail.endsWith(']')) {
    return detail
  }

  return detail
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

const toValidationError = (detail: string): ActividadRegistroSubmitError => {
  const fieldErrors: Partial<Record<ActividadRegistroFormField, string>> = {}
  const unmapped: string[] = []

  for (const raw of toMessageList(detail)) {
    const trimmed = raw.replace(/^"+|"+$/g, '').trim()
    if (!trimmed || /should not exist/i.test(trimmed)) {
      continue
    }

    const field = matchField(trimmed)
    if (!field) {
      unmapped.push(trimmed)
      continue
    }

    fieldErrors[field] = trimmed
  }

  const formMessage =
    Object.keys(fieldErrors).length === 0
      ? unmapped[0] ?? 'Revise los datos del formulario.'
      : unmapped[0] ?? null

  return {
    kind: 'validation',
    formMessage,
    fieldErrors,
  }
}

export const parseActividadRegistroSubmitError = (
  error: unknown,
): ActividadRegistroSubmitError => {
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

export const toActividadRegistroSubmitMessage = (
  error: unknown,
): string => {
  const parsed = parseActividadRegistroSubmitError(error)

  if (parsed.kind === 'validation') {
    const firstFieldError = Object.values(parsed.fieldErrors)[0]
    return parsed.formMessage ?? firstFieldError ?? 'Revise los datos del formulario.'
  }
  if (parsed.kind === 'unauthorized') {
    return ACTIVIDAD_REGISTRO_UNAUTHORIZED_ERROR
  }
  if (parsed.kind === 'forbidden') {
    return ACTIVIDAD_REGISTRO_FORBIDDEN_ERROR
  }
  if (parsed.kind === 'not-found') {
    return 'El tipo de actividad seleccionado ya no está disponible.'
  }

  return ACTIVIDAD_REGISTRO_SAVE_FALLBACK_ERROR
}
