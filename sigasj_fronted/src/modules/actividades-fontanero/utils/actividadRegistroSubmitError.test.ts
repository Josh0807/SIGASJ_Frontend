import { describe, expect, it } from 'vitest'
import {
  parseActividadRegistroSubmitError,
  toActividadRegistroSubmitMessage,
} from './actividadRegistroSubmitError'

describe('parseActividadRegistroSubmitError', () => {
  it('mapea 401 a sesión inválida', () => {
    expect(
      parseActividadRegistroSubmitError(new Error('HTTP 401: No autenticado')),
    ).toEqual({ kind: 'unauthorized' })
  })

  it('mapea 403 a acceso denegado', () => {
    expect(
      parseActividadRegistroSubmitError(new Error('HTTP 403: Acceso denegado')),
    ).toEqual({ kind: 'forbidden' })
  })

  it('mapea 400 a errores de validación por campo', () => {
    const parsed = parseActividadRegistroSubmitError(
      new Error(
        'HTTP 400: La fecha de la actividad no puede ser futura,El título de la actividad es obligatorio',
      ),
    )

    expect(parsed.kind).toBe('validation')
    if (parsed.kind === 'validation') {
      expect(parsed.fieldErrors.fechaActividad).toContain('fecha')
      expect(parsed.fieldErrors.titulo).toContain('título')
    }
  })

  it('expone mensaje legible para el formulario', () => {
    expect(
      toActividadRegistroSubmitMessage(new Error('HTTP 401: No autenticado')),
    ).toContain('sesión')
  })
})
