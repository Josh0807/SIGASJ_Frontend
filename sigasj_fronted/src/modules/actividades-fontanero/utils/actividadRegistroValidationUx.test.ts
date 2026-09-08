import { describe, expect, it } from 'vitest'
import {
  parseActividadRegistroSubmitError,
  toActividadRegistroSubmitMessage,
} from './actividadRegistroSubmitError'
import { focusFirstActividadRegistroError } from './focusFirstActividadRegistroError'

describe('mensajes visuales de error #399', () => {
  it('no expone prefijos HTTP en mensajes de validación', () => {
    const parsed = parseActividadRegistroSubmitError(
      new Error('HTTP 400: La fecha de la actividad no puede ser futura'),
    )

    expect(parsed.kind).toBe('validation')
    if (parsed.kind === 'validation') {
      expect(parsed.fieldErrors.fechaActividad).toBe(
        'La fecha de la actividad no puede ser futura',
      )
      expect(parsed.fieldErrors.fechaActividad).not.toContain('HTTP')
    }
  })

  it('usa mensajes distintos para modo corregir', () => {
    expect(
      toActividadRegistroSubmitMessage(new Error('HTTP 404: No encontrada'), {
        mode: 'corregir',
      }),
    ).toContain('corrección')
  })

  it('enfoca el primer campo inválido dentro del formulario', () => {
    document.body.innerHTML = `
      <form id="form">
        <input id="fechaActividad" />
        <input id="titulo" />
      </form>
    `

    const form = document.getElementById('form') as HTMLFormElement
    const fecha = document.getElementById('fechaActividad') as HTMLInputElement
    const focused = focusFirstActividadRegistroError(
      {
        fechaActividad: 'Este campo es obligatorio.',
        titulo: 'Este campo es obligatorio.',
      },
      form,
    )

    expect(focused).toBe('fechaActividad')
    expect(document.activeElement).toBe(fecha)
  })
})
