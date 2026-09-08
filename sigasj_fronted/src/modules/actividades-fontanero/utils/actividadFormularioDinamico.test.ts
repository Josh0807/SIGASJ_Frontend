import { describe, expect, it } from 'vitest'
import { ACTIVIDAD_REGISTRO_FORM_INITIAL } from '../types/actividadRegistroForm'
import { TIPOS_ACTIVIDAD_BACKEND } from '../test/tiposActividadFixture'
import { toRegistrarActividadPayloadFromTipo } from '../types/actividadFontaneroApi'
import { validateActividadRegistroForm } from './validateActividadRegistroForm'

const validBase = {
  ...ACTIVIDAD_REGISTRO_FORM_INITIAL,
  fechaActividad: '2026-09-07',
  titulo: 'Actividad válida',
}

describe('reglas del formulario dinámico de actividades', () => {
  it.each([
    ['CONTROL_FUGAS', 'ubicacionFuga'],
    ['TOMA_PRESION', 'presionMedida'],
    ['VISITA_CAMPO', 'resultadoVisita'],
    ['CONTROL_CLOROS', 'cantidadCloro'],
    ['CONTROL_OPERATIVO', 'caudal'],
    ['INCAPACIDAD_VACACIONES', 'documentos'],
  ] as const)('requiere únicamente el dato específico de %s', (codigo, field) => {
    const errors = validateActividadRegistroForm(validBase, codigo)
    const specificFields = ['ubicacionFuga', 'presionMedida', 'resultadoVisita', 'cantidadCloro', 'caudal', 'documentos'] as const

    expect(errors[field]).toBeDefined()
    expect(specificFields.filter((item) => errors[item])).toEqual([field])
  })

  it('rechaza mediciones iguales o menores que cero', () => {
    const errors = validateActividadRegistroForm(
      { ...validBase, presionMedida: '0' },
      'TOMA_PRESION',
    )
    expect(errors.presionMedida).toContain('mayor que cero')
  })

  it('convierte las mediciones válidas al tipo numérico esperado por el backend', () => {
    const tipo = TIPOS_ACTIVIDAD_BACKEND.find(({ codigo }) => codigo === 'TOMA_PRESION')!
    const payload = toRegistrarActividadPayloadFromTipo(tipo, {
      ...validBase,
      presionMedida: '45.5',
    })
    expect(payload.presionMedida).toBe(45.5)
  })
})
