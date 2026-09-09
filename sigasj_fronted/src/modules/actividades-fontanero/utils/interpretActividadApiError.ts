import { extractHttpErrorMessage, getHttpErrorStatus } from './httpErrorStatus'
import { ACTIVITY_FEEDBACK_MESSAGES } from './activityFeedbackMessages'
import type { ActivityFeedbackVariant } from './activityFeedbackMessages'

export type InterpretedActividadApiError = {
  variant: ActivityFeedbackVariant
  message: string
  status: number | null
  kind:
    | 'validation'
    | 'unauthorized'
    | 'forbidden'
    | 'not-found'
    | 'server'
    | 'network'
    | 'unknown'
}

const TECHNICAL_PATTERN =
  /\b(QueryFailedError|EntityNotFoundError|TypeORM|SQL|stack|constraint|INSERT|UPDATE|DELETE|SELECT|driverError|ECONNREFUSED|at\s+\w+\s+\()/i

const looksTechnical = (text: string): boolean =>
  TECHNICAL_PATTERN.test(text) || text.length > 220

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
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('load failed')
  )
}

/**
 * Interpreta errores del API de actividades para UI segura.
 * No expone SQL/TypeORM/stack al usuario.
 */
export const interpretActividadApiError = (
  error: unknown,
  options?: { notFoundMessage?: string },
): InterpretedActividadApiError => {
  if (isNetworkError(error)) {
    return {
      variant: 'error',
      message: ACTIVITY_FEEDBACK_MESSAGES.network,
      status: null,
      kind: 'network',
    }
  }

  const status = getHttpErrorStatus(error)

  if (status === 401) {
    return {
      variant: 'warning',
      message: ACTIVITY_FEEDBACK_MESSAGES.unauthorized,
      status,
      kind: 'unauthorized',
    }
  }

  if (status === 403) {
    return {
      variant: 'error',
      message: ACTIVITY_FEEDBACK_MESSAGES.forbidden,
      status,
      kind: 'forbidden',
    }
  }

  if (status === 404) {
    return {
      variant: 'warning',
      message:
        options?.notFoundMessage ?? ACTIVITY_FEEDBACK_MESSAGES.notFound,
      status,
      kind: 'not-found',
    }
  }

  if (status === 400 || status === 422) {
    const detail = extractHttpErrorMessage(
      error,
      ACTIVITY_FEEDBACK_MESSAGES.validationReview,
    )
    return {
      variant: 'warning',
      message: looksTechnical(detail)
        ? ACTIVITY_FEEDBACK_MESSAGES.validationReview
        : detail,
      status,
      kind: 'validation',
    }
  }

  if (status !== null && status >= 500) {
    return {
      variant: 'error',
      message: ACTIVITY_FEEDBACK_MESSAGES.server,
      status,
      kind: 'server',
    }
  }

  const fallbackDetail = extractHttpErrorMessage(
    error,
    ACTIVITY_FEEDBACK_MESSAGES.server,
  )

  return {
    variant: 'error',
    message: looksTechnical(fallbackDetail)
      ? ACTIVITY_FEEDBACK_MESSAGES.server
      : fallbackDetail,
    status,
    kind: 'unknown',
  }
}
