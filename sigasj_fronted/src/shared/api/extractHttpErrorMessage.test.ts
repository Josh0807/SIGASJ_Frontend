import { describe, expect, it } from 'vitest'
import { extractHttpErrorMessage } from './extractHttpErrorMessage'

describe('extractHttpErrorMessage', () => {
  it('extrae un mensaje simple del backend', () => {
    expect(
      extractHttpErrorMessage(
        JSON.stringify({ statusCode: 400, message: 'Debe enviar un archivo.' }),
      ),
    ).toBe('Debe enviar un archivo.')
  })

  it('concatena mensajes de validación en arreglo', () => {
    expect(
      extractHttpErrorMessage(
        JSON.stringify({
          statusCode: 400,
          message: ['nombre must be shorter', 'descripcionBreve is required'],
        }),
      ),
    ).toBe('nombre must be shorter descripcionBreve is required')
  })

  it('devuelve null cuando no hay mensaje util', () => {
    expect(extractHttpErrorMessage('')).toBeNull()
    expect(extractHttpErrorMessage('not-json')).toBeNull()
  })
})
