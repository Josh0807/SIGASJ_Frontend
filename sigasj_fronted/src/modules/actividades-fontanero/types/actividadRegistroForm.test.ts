import { describe, expect, it } from 'vitest'
import { hoyEnAsada } from '../../../shared/utils/fechaAsada'
import { createActividadRegistroFormInitial } from './actividadRegistroForm'

describe('createActividadRegistroFormInitial', () => {
  it('usa el día de Costa Rica y deja el resto vacío', () => {
    const ahora = new Date('2026-03-15T08:00:00.000Z')
    const values = createActividadRegistroFormInitial(ahora)

    expect(values.fechaActividad).toBe(hoyEnAsada(ahora))
    expect(values.titulo).toBe('')
    expect(values.ubicacion).toBe('')
    expect(values.observaciones).toBe('')
    expect(values.documentos).toEqual([])
  })
})
