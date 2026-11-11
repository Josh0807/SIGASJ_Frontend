import { describe, expect, it } from 'vitest'
import {
  CREDENTIALS_ERROR_MESSAGE,
  FORBIDDEN_LOGIN_MESSAGE,
  GENERIC_LOGIN_ERROR_MESSAGE,
  INACTIVE_USER_MESSAGE,
  mapLoginErrorMessage,
} from './loginErrors'

describe('mapLoginErrorMessage', () => {
  it('mapea 401 genérico a mensaje anti-enumeración', () => {
    expect(mapLoginErrorMessage('HTTP 401: Credenciales inválidas')).toBe(
      CREDENTIALS_ERROR_MESSAGE,
    )
  })

  it('mapea usuario inactivo al mensaje autorizado', () => {
    expect(
      mapLoginErrorMessage('HTTP 401: El usuario se encuentra inactivo.'),
    ).toBe(INACTIVE_USER_MESSAGE)
  })

  it('mapea 403, 500 y red a mensajes comprensibles', () => {
    expect(mapLoginErrorMessage('HTTP 403: Forbidden')).toBe(
      FORBIDDEN_LOGIN_MESSAGE,
    )
    expect(mapLoginErrorMessage('HTTP 500: Internal Server Error')).toBe(
      GENERIC_LOGIN_ERROR_MESSAGE,
    )
    expect(mapLoginErrorMessage('Failed to fetch')).not.toMatch(
      /Failed to fetch|AxiosError|ERR_/i,
    )
  })
})
