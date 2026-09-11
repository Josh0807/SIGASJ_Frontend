import { describe, expect, it } from 'vitest'
import {
  parsePublicAveriaSubmitError,
  PUBLIC_AVERIA_NETWORK_ERROR,
  PUBLIC_AVERIA_SERVER_ERROR,
  PUBLIC_AVERIA_VALIDATION_ERROR,
} from './parsePublicAveriaSubmitError'

describe('parsePublicAveriaSubmitError', () => {
  it('mapea errores 400 a campos públicos', () => {
    const parsed = parsePublicAveriaSubmitError(
      new Error(
        `HTTP 400: ${JSON.stringify([
          'El nombre del reportante es obligatorio',
          'El correo electrónico no es válido',
        ])}`,
      ),
    )

    expect(parsed.kind).toBe('validation')
    expect(parsed.fieldErrors.nombreReportante).toBe('El nombre del reportante es obligatorio')
    expect(parsed.fieldErrors.correoReportante).toBe('El correo electrónico no es válido')
    expect(parsed.formMessage).toBeNull()
  })

  it('usa un mensaje general cuando el 400 no corresponde a un campo', () => {
    const parsed = parsePublicAveriaSubmitError(new Error('HTTP 400: property estado should not exist'))
    expect(parsed.kind).toBe('validation')
    expect(parsed.fieldErrors).toEqual({})
    expect(parsed.formMessage).toBe(PUBLIC_AVERIA_VALIDATION_ERROR)
  })

  it('distingue error de conexión de 400 y 500', () => {
    expect(parsePublicAveriaSubmitError(new TypeError('Failed to fetch'))).toEqual({
      kind: 'network',
      formMessage: PUBLIC_AVERIA_NETWORK_ERROR,
      fieldErrors: {},
    })

    expect(parsePublicAveriaSubmitError(new Error('HTTP 500: QueryFailedError TypeORM SQL Exception'))).toEqual({
      kind: 'server',
      formMessage: PUBLIC_AVERIA_SERVER_ERROR,
      fieldErrors: {},
    })
  })

  it('no expone detalles técnicos al reportante', () => {
    const parsed = parsePublicAveriaSubmitError(
      new Error('HTTP 500: QueryFailedError: INSERT INTO Averia stack at Service.ts:12'),
    )

    expect(parsed.formMessage).toBe(PUBLIC_AVERIA_SERVER_ERROR)
    expect(parsed.formMessage).not.toMatch(/QueryFailedError|TypeORM|INSERT|stack/i)
  })
})
