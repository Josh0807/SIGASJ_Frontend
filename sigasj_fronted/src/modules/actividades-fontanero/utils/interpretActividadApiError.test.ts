import { describe, expect, it } from 'vitest'
import { ACTIVITY_FEEDBACK_MESSAGES } from './activityFeedbackMessages'
import { interpretActividadApiError } from './interpretActividadApiError'

describe('interpretActividadApiError', () => {
  it('mapea 401 distinto de 403', () => {
    const unauthorized = interpretActividadApiError(
      new Error('HTTP 401: Unauthorized'),
    )
    const forbidden = interpretActividadApiError(
      new Error('HTTP 403: Forbidden'),
    )

    expect(unauthorized.kind).toBe('unauthorized')
    expect(unauthorized.message).toBe(ACTIVITY_FEEDBACK_MESSAGES.unauthorized)
    expect(forbidden.kind).toBe('forbidden')
    expect(forbidden.message).toBe(ACTIVITY_FEEDBACK_MESSAGES.forbidden)
    expect(unauthorized.message).not.toBe(forbidden.message)
  })

  it('expone mensaje de validación 400 seguro y oculta detalle técnico', () => {
    const validation = interpretActividadApiError(
      new Error('HTTP 400: La fecha de la actividad no puede ser futura'),
    )
    expect(validation.kind).toBe('validation')
    expect(validation.variant).toBe('warning')
    expect(validation.message).toBe(
      'La fecha de la actividad no puede ser futura',
    )

    const technical = interpretActividadApiError(
      new Error('HTTP 400: QueryFailedError: duplicate key constraint'),
    )
    expect(technical.kind).toBe('validation')
    expect(technical.message).toBe(ACTIVITY_FEEDBACK_MESSAGES.validationReview)
  })

  it('mapea 404, 500 y red', () => {
    expect(
      interpretActividadApiError(new Error('HTTP 404: Not Found')).message,
    ).toBe(ACTIVITY_FEEDBACK_MESSAGES.notFound)
    expect(
      interpretActividadApiError(new Error('HTTP 500: Internal')).message,
    ).toBe(ACTIVITY_FEEDBACK_MESSAGES.server)

    const network = new TypeError('Failed to fetch')
    expect(interpretActividadApiError(network).kind).toBe('network')
    expect(interpretActividadApiError(network).message).toBe(
      ACTIVITY_FEEDBACK_MESSAGES.network,
    )
  })

  it('no expone SQL/TypeORM en errores desconocidos', () => {
    const result = interpretActividadApiError(
      new Error('HTTP 418: TypeORM EntityNotFoundError SELECT * FROM actividades'),
    )
    expect(result.message).toBe(ACTIVITY_FEEDBACK_MESSAGES.server)
  })
})
