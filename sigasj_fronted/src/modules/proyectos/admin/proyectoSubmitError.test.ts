import { describe, expect, it } from 'vitest'
import {
  PROYECTO_NOT_FOUND_ERROR,
  PROYECTO_SAVE_FALLBACK_ERROR,
  parseProyectoSubmitError,
  toProyectoFormSubmitError,
} from './proyectoSubmitError'

describe('parseProyectoSubmitError', () => {
  it('asocia un 400 con el campo correspondiente cuando el mensaje lo permite', () => {
    expect(
      parseProyectoSubmitError(
        new Error('HTTP 400: El nombre del proyecto es obligatorio'),
      ),
    ).toEqual({
      kind: 'validation',
      formMessage: null,
      fieldErrors: {
        nombre: 'El nombre del proyecto es obligatorio',
      },
    })
    expect(
      parseProyectoSubmitError(
        new Error(
          'HTTP 400: ["El estado debe ser PENDIENTE, EN_PROCESO o COMPLETADO"]',
        ),
      ),
    ).toEqual({
      kind: 'validation',
      formMessage: null,
      fieldErrors: {
        estado: 'Seleccione un estado válido.',
      },
    })
    expect(
      parseProyectoSubmitError(
        new Error(
          'HTTP 400: encargadoRealizacion must be shorter than or equal to 150 characters',
        ),
      ),
    ).toEqual({
      kind: 'validation',
      formMessage: null,
      fieldErrors: {
        encargadoRealizacion: 'El encargado no puede superar 150 caracteres.',
      },
    })
  })

  it('no muestra SQL, stack ni detalles internos', () => {
    expect(
      parseProyectoSubmitError(
        new Error('HTTP 500: QueryFailedError: SELECT * FROM Proyecto'),
      ),
    ).toEqual({ kind: 'save' })
    expect(
      toProyectoFormSubmitError(
        new Error('HTTP 500: QueryFailedError: SELECT * FROM Proyecto'),
      ),
    ).toBe(PROYECTO_SAVE_FALLBACK_ERROR)
    expect(
      toProyectoFormSubmitError(
        new Error('TypeError: Cannot read properties of undefined'),
      ),
    ).toBe(PROYECTO_SAVE_FALLBACK_ERROR)
  })

  it('no trata 401 ni 403 como error de formulario', () => {
    expect(parseProyectoSubmitError(new Error('HTTP 401: Unauthorized'))).toEqual(
      { kind: 'unauthorized' },
    )
    expect(parseProyectoSubmitError(new Error('HTTP 403: Acceso denegado'))).toEqual(
      { kind: 'forbidden' },
    )
    expect(toProyectoFormSubmitError(new Error('HTTP 401: Unauthorized'))).toBeNull()
    expect(toProyectoFormSubmitError(new Error('HTTP 403: Forbidden'))).toBeNull()
  })

  it('distingue un 404 de proyecto inexistente', () => {
    expect(
      parseProyectoSubmitError(new Error('HTTP 404: Proyecto no encontrado')),
    ).toEqual({ kind: 'not-found' })
    expect(PROYECTO_NOT_FOUND_ERROR).toBe('El proyecto no existe.')
  })
})
