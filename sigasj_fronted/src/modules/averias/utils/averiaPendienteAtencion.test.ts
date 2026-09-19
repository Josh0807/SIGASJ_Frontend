import { describe, expect, it } from 'vitest'
import {
  MENSAJE_INICIO_ATENCION_FUERA_DE_HORARIO,
  esPendienteDeAtencion,
  mostrarAvisoHorarioFontanero,
  mostrarAvisoPendienteAdmin,
  parseInicioAtencionError,
  puedeIntentarIniciarAtencion,
} from './averiaPendienteAtencion'

describe('averiaPendienteAtencion', () => {
  it('trata PENDIENTE como Pendiente de atención, no como Fuera de horario', () => {
    expect(esPendienteDeAtencion('PENDIENTE')).toBe(true)
    expect(esPendienteDeAtencion('PENDIENTE_ATENCION')).toBe(true)
    expect(esPendienteDeAtencion('ASIGNADA')).toBe(false)
    expect(esPendienteDeAtencion('EN_ATENCION')).toBe(false)
    expect(esPendienteDeAtencion('FUERA_DE_HORARIO')).toBe(false)
  })

  it('permite intentar iniciar en Asignada o Pendiente de atención', () => {
    expect(puedeIntentarIniciarAtencion('ASIGNADA')).toBe(true)
    expect(puedeIntentarIniciarAtencion('PENDIENTE')).toBe(true)
    expect(puedeIntentarIniciarAtencion('EN_ATENCION')).toBe(false)
  })

  it('muestra el aviso de horario solo cuando está pendiente', () => {
    expect(mostrarAvisoHorarioFontanero('PENDIENTE')).toBe(true)
    expect(mostrarAvisoHorarioFontanero('ASIGNADA')).toBe(false)
    expect(mostrarAvisoPendienteAdmin('PENDIENTE', true)).toBe(true)
    expect(mostrarAvisoPendienteAdmin('PENDIENTE', false)).toBe(false)
    expect(mostrarAvisoPendienteAdmin('ASIGNADA', true)).toBe(false)
  })

  it('traduce el rechazo de horario sin exponer errores técnicos', () => {
    expect(
      parseInicioAtencionError(
        new Error(
          'HTTP 400: La atención no puede iniciarse en este momento porque se encuentra fuera del horario laboral establecido.',
        ),
        'fallback',
      ),
    ).toBe(MENSAJE_INICIO_ATENCION_FUERA_DE_HORARIO)
    expect(
      parseInicioAtencionError(
        new Error('HTTP 500: QueryFailedError TypeORM SQL Server'),
        'No fue posible iniciar la atención. Intente nuevamente.',
      ),
    ).toBe('No fue posible iniciar la atención. Intente nuevamente.')
  })
})
