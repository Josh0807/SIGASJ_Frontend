import { describe, expect, it } from 'vitest'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import {
  actividadToFormValues,
  toCorregirActividadPayload,
} from './actividadCorreccionMapper'

const actividadBase = (): ActividadFontaneroRegistrada => ({
  id: 10,
  tipoActividadId: 2,
  tipoActividadNombre: 'Toma de Presión',
  fechaActividad: '2026-02-15T00:00:00.000Z',
  titulo: '  Medición sector 3 ',
  descripcion: ' Lectura matutina ',
  ubicacion: ' Planta ',
  observaciones: ' Nota previa ',
  estado: 'REQUIERE_CORRECCION',
  observacionCorreccion: 'Verifique la presión.',
  datosEspecificos: { presionMedida: 42.5 },
  createdAt: '2026-02-16T10:00:00.000Z',
  updatedAt: '2026-02-16T12:00:00.000Z',
})

describe('actividadCorreccionMapper', () => {
  it('actividadToFormValues normaliza campos generales y específicos', () => {
    const values = actividadToFormValues(actividadBase())

    expect(values.fechaActividad).toBe('2026-02-15')
    expect(values.titulo).toBe('  Medición sector 3 ')
    expect(values.presionMedida).toBe('42.5')
    expect(values.documentos).toEqual([])
  })

  it('toCorregirActividadPayload omite fecha y observaciones', () => {
    const values = actividadToFormValues(actividadBase())
    values.titulo = ' Medición corregida '
    values.descripcion = ' Lectura validada '
    values.ubicacion = ' Planta sur '
    values.observaciones = ' No debe enviarse '
    values.presionMedida = '44'

    const payload = toCorregirActividadPayload(values, 'TOMA_PRESION')

    expect(payload).toEqual({
      titulo: 'Medición corregida',
      descripcion: 'Lectura validada',
      ubicacion: 'Planta sur',
      presionMedida: 44,
    })
    expect(payload).not.toHaveProperty('fechaActividad')
    expect(payload).not.toHaveProperty('observaciones')
  })
})
