import { describe, expect, it } from 'vitest'
import { toTransparenciaSubmitMessage } from './transparenciaSubmitError'

describe('toTransparenciaSubmitMessage', () => {
  it('muestra la validación útil enviada por el backend', () => {
    expect(toTransparenciaSubmitMessage(new Error('HTTP 400: El campo activo no debe existir')))
      .toBe('El campo activo no debe existir')
  })

  it('explica errores de tamaño, autenticación y permisos', () => {
    expect(toTransparenciaSubmitMessage(new Error('HTTP 413: Payload Too Large'))).toContain('tamaño máximo')
    expect(toTransparenciaSubmitMessage(new Error('HTTP 401: Unauthorized'))).toContain('sesión expiró')
    expect(toTransparenciaSubmitMessage(new Error('HTTP 403: Forbidden'))).toContain('permisos')
  })

  it('no expone detalles internos del servidor', () => {
    expect(toTransparenciaSubmitMessage(new Error('HTTP 500: QueryFailedError SELECT *')))
      .toBe('No fue posible guardar la publicación. Intente nuevamente.')
  })
})
