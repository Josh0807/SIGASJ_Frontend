import { describe, expect, it } from 'vitest'
import { ACTIVITY_FEEDBACK_MESSAGES } from './activityFeedbackMessages'
import {
  parseActividadRegistroSubmitError,
  toActividadRegistroSubmitMessage,
} from './actividadRegistroSubmitError'
import { interpretActividadApiError } from './interpretActividadApiError'

/**
 * Contrato 7.10.1 ↔ 7.10.2: error `{ statusCode, message }` llega al FE como
 * `HTTP {status}: {message}` vía httpClient.
 */
describe('integración mensajes FE ↔ contrato Backend actividades', () => {
  it('éxito de registro usa mensaje de catálogo (UI)', () => {
    expect(ACTIVITY_FEEDBACK_MESSAGES.successRegister).toBe(
      'Actividad registrada correctamente.',
    )
    expect(ACTIVITY_FEEDBACK_MESSAGES.successCorrect).toBe(
      'La información fue actualizada correctamente.',
    )
    expect(ACTIVITY_FEEDBACK_MESSAGES.successReview).toBe(
      'La actividad fue marcada como revisada.',
    )
  })

  it('400 con mensajes de campo no expone JSON técnico y permite mapear campos', () => {
    const error = new Error(
      'HTTP 400: ["La fecha de la actividad no puede ser futura","El título de la actividad es obligatorio"]',
    )
    const parsed = parseActividadRegistroSubmitError(error)
    expect(parsed.kind).toBe('validation')
    if (parsed.kind === 'validation') {
      expect(parsed.formMessage).toBe(
        ACTIVITY_FEEDBACK_MESSAGES.validationReview,
      )
      expect(parsed.fieldErrors.fechaActividad).toBeTruthy()
      expect(parsed.fieldErrors.titulo).toBeTruthy()
    }
  })

  it('401 y 403 son distintos y usan catálogo compartido', () => {
    const unauthorized = interpretActividadApiError(
      new Error('HTTP 401: No autenticado'),
    )
    const forbidden = interpretActividadApiError(
      new Error('HTTP 403: Acceso denegado'),
    )
    expect(unauthorized.kind).toBe('unauthorized')
    expect(forbidden.kind).toBe('forbidden')
    expect(unauthorized.message).toBe(ACTIVITY_FEEDBACK_MESSAGES.unauthorized)
    expect(forbidden.message).toBe(ACTIVITY_FEEDBACK_MESSAGES.forbidden)
    expect(unauthorized.message).not.toBe(forbidden.message)
  })

  it('404 / 500 / red usan mensajes seguros sin TypeORM', () => {
    expect(
      interpretActividadApiError(new Error('HTTP 404: Actividad no encontrada'))
        .message,
    ).toBe(ACTIVITY_FEEDBACK_MESSAGES.notFound)

    const server = interpretActividadApiError(
      new Error('HTTP 500: QueryFailedError INSERT INTO ActividadFontanero'),
    )
    expect(server.message).toBe(ACTIVITY_FEEDBACK_MESSAGES.server)
    expect(server.message).not.toMatch(/QueryFailedError|INSERT|TypeORM/i)

    const network = toActividadRegistroSubmitMessage(
      new TypeError('Failed to fetch'),
    )
    expect(network).toBe(ACTIVITY_FEEDBACK_MESSAGES.network)
    expect(parseActividadRegistroSubmitError(new TypeError('Failed to fetch')).kind).toBe(
      'network',
    )
  })

  it('documentos inválidos 400 se mapean al campo documentos', () => {
    const parsed = parseActividadRegistroSubmitError(
      new Error('HTTP 400: El archivo no puede superar 10 MB.'),
    )
    expect(parsed.kind).toBe('validation')
    if (parsed.kind === 'validation') {
      expect(parsed.fieldErrors.documentos).toContain('10 MB')
    }
  })
})
