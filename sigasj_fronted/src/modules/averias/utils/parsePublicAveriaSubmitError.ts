import type { PublicAveriaFormErrors, PublicAveriaFormValues } from '../types/publicAveriaForm'

export const PUBLIC_AVERIA_NETWORK_ERROR =
  'No fue posible enviar el reporte en este momento. Verifique su conexión e intente nuevamente.'

export const PUBLIC_AVERIA_SERVER_ERROR =
  'No fue posible registrar el reporte en este momento. Intente nuevamente.'

export const PUBLIC_AVERIA_VALIDATION_ERROR =
  'Revise la información ingresada e intente nuevamente.'

export type PublicAveriaSubmitError = {
  kind: 'validation' | 'network' | 'server'
  formMessage: string | null
  fieldErrors: PublicAveriaFormErrors
}

const HTTP_ERROR_PATTERN = /^HTTP (\d+):\s*([\s\S]*)$/

const TECHNICAL_PATTERN =
  /\b(QueryFailedError|EntityNotFoundError|TypeORMError|TypeORM|SQL Exception|SQL Server|SQL|stack|constraint|INSERT|UPDATE|DELETE|SELECT|driverError|ECONNREFUSED|Exception:|\.ts:\d+|\.js:\d+)\b/i

const FIELD_MATCHERS: { field: keyof PublicAveriaFormValues; pattern: RegExp }[] = [
  { field: 'identificacionReportante', pattern: /identificaci[oó]n|c[eé]dula/i },
  { field: 'correoReportante', pattern: /correo|email/i },
  { field: 'telefonoReportante', pattern: /tel[eé]fono/i },
  { field: 'ubicacion', pattern: /ubicaci[oó]n/i },
  { field: 'sectorComunidad', pattern: /sector|comunidad/i },
  { field: 'descripcion', pattern: /descripci[oó]n/i },
  { field: 'nombreReportante', pattern: /nombre/i },
]

const getHttpErrorStatus = (error: unknown): number | null => {
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

const isNetworkError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false
  }
  if (getHttpErrorStatus(error) !== null) {
    return false
  }

  const message = error.message.toLowerCase()
  return (
    error.name === 'TypeError' ||
    error.name === 'AbortError' ||
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('load failed') ||
    message.includes('timeout')
  )
}

const isUnsafeDetail = (detail: string): boolean =>
  !detail.trim() || TECHNICAL_PATTERN.test(detail) || detail.length > 220

const toMessageList = (detail: string): string[] => {
  if (!detail.trim()) {
    return []
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
    /* detalle plano */
  }

  return detail
    .split(/,(?=[A-ZÁÉÍÓÚ"[])/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const matchField = (message: string): keyof PublicAveriaFormValues | null =>
  FIELD_MATCHERS.find(({ pattern }) => pattern.test(message))?.field ?? null

const toValidationError = (detail: string): PublicAveriaSubmitError => {
  const fieldErrors: PublicAveriaFormErrors = {}
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

    fieldErrors[field] = trimmed
  }

  const hasFields = Object.keys(fieldErrors).length > 0

  return {
    kind: 'validation',
    formMessage: hasFields ? unmapped[0] ?? null : unmapped[0] ?? PUBLIC_AVERIA_VALIDATION_ERROR,
    fieldErrors,
  }
}

export function parsePublicAveriaSubmitError(error: unknown): PublicAveriaSubmitError {
  if (isNetworkError(error)) {
    return { kind: 'network', formMessage: PUBLIC_AVERIA_NETWORK_ERROR, fieldErrors: {} }
  }

  const status = getHttpErrorStatus(error)

  if (status === 400 || status === 422) {
    return toValidationError(getHttpErrorDetail(error))
  }

  if (status !== null && status >= 500) {
    return { kind: 'server', formMessage: PUBLIC_AVERIA_SERVER_ERROR, fieldErrors: {} }
  }

  const detail = getHttpErrorDetail(error)
  if (detail && isUnsafeDetail(detail)) {
    return { kind: 'server', formMessage: PUBLIC_AVERIA_SERVER_ERROR, fieldErrors: {} }
  }

  return { kind: 'server', formMessage: PUBLIC_AVERIA_SERVER_ERROR, fieldErrors: {} }
}
