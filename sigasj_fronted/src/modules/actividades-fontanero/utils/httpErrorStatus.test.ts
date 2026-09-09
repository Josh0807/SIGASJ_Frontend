import { describe, expect, it } from 'vitest'
import {
  extractHttpErrorMessage,
  getHttpErrorStatus,
  shouldRetryAlternatePath,
} from './httpErrorStatus'

describe('httpErrorStatus — actividades fontanero', () => {
  it('extrae el código HTTP del mensaje del cliente', () => {
    expect(getHttpErrorStatus(new Error('HTTP 401: Unauthorized'))).toBe(401)
    expect(getHttpErrorStatus(new Error('HTTP 403: Forbidden'))).toBe(403)
    expect(getHttpErrorStatus(new Error('HTTP 500: Error interno'))).toBe(500)
  })

  it('no reintenta rutas alternativas ante errores de cliente', () => {
    expect(shouldRetryAlternatePath(new Error('HTTP 401'))).toBe(false)
    expect(shouldRetryAlternatePath(new Error('HTTP 403'))).toBe(false)
    expect(shouldRetryAlternatePath(new Error('HTTP 400: Bad Request'))).toBe(false)
  })

  it('reintenta ante 404 o errores de servidor', () => {
    expect(shouldRetryAlternatePath(new Error('HTTP 404: Not Found'))).toBe(true)
    expect(shouldRetryAlternatePath(new Error('HTTP 503: Service Unavailable'))).toBe(true)
    expect(shouldRetryAlternatePath(new Error('Network error'))).toBe(true)
  })

  it('extrae mensaje legible del cuerpo HTTP', () => {
    expect(
      extractHttpErrorMessage(
        new Error('HTTP 400: fechaInicio no puede ser posterior a fechaFin'),
        'fallback',
      ),
    ).toBe('fechaInicio no puede ser posterior a fechaFin')
  })
})
