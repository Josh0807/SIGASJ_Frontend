import { describe, expect, it } from 'vitest'
import {
  EMPTY_INCAPACIDAD_VALUES,
  esFechaCalendario,
  incapacidadErrorMessage,
  resumenObservaciones,
  toIncapacidadPayload,
  validateIncapacidad,
} from './incapacidadForm'

const valid = {
  colaboradorId: '3',
  fechaInicio: '2026-10-12',
  fechaFin: '2026-10-20',
  observaciones: ' Documento entregado ',
  origen: '' as const,
}

describe('formulario de incapacidad', () => {
  it('exige colaborador y fechas; observaciones son opcionales', () => {
    expect(Object.keys(validateIncapacidad(EMPTY_INCAPACIDAD_VALUES)).sort()).toEqual(
      ['colaboradorId', 'fechaFin', 'fechaInicio'].sort(),
    )
    expect(validateIncapacidad({ ...valid, fechaInicio: '' }).fechaInicio).toMatch(
      /inicio/i,
    )
    expect(validateIncapacidad({ ...valid, observaciones: '' })).toEqual({})
  })

  it('rechaza fechas inválidas y fin anterior al inicio', () => {
    expect(esFechaCalendario('2026-02-31')).toBe(false)
    expect(
      validateIncapacidad({ ...valid, fechaFin: '2026-10-11' }).fechaFin,
    ).toMatch(/fecha final/i)
    expect(validateIncapacidad(valid)).toEqual({})
  })

  it('arma el payload recortando textos', () => {
    expect(toIncapacidadPayload(valid)).toEqual({
      colaboradorId: 3,
      fechaInicio: '2026-10-12',
      origen: null,
      fechaFin: '2026-10-20',
      observaciones: 'Documento entregado',
    })
    expect(
      toIncapacidadPayload({ ...valid, observaciones: '   ' }).observaciones,
    ).toBeNull()
  })

  it('resume observaciones largas y muestra vacío claro', () => {
    expect(resumenObservaciones(null)).toBe('Sin observaciones')
    expect(resumenObservaciones('Corta')).toBe('Corta')
    expect(resumenObservaciones('x'.repeat(100)).endsWith('…')).toBe(true)
  })

  it('interpreta errores HTTP del backend', () => {
    expect(incapacidadErrorMessage(new Error('HTTP 403: x'), 'x')).toMatch(
      /acceso/,
    )
    expect(incapacidadErrorMessage(new Error('HTTP 404: x'), 'x')).toMatch(
      /incapacidad/,
    )
    expect(
      incapacidadErrorMessage(
        new Error('HTTP 404: No se encontró el colaborador solicitado.'),
        'x',
      ),
    ).toMatch(/colaborador/)
    expect(
      incapacidadErrorMessage(
        new Error('HTTP 400: La fecha final no puede ser anterior a la fecha inicial.'),
        'x',
      ),
    ).toMatch(/fecha final/)
    expect(
      incapacidadErrorMessage(new Error('HTTP 500: SELECT * FROM Incapacidad'), 'x'),
    ).toBe('No fue posible completar la operación. Intente nuevamente.')
    expect(incapacidadErrorMessage(new Error('Failed to fetch'), 'x')).toMatch(
      /conectar/,
    )
  })

  it('envía fechas YYYY-MM-DD sin convertir a Date', () => {
    const payload = toIncapacidadPayload({
      colaboradorId: '7',
      fechaInicio: '2026-10-17',
      fechaFin: '2026-10-17',
      observaciones: '',
    })
    expect(payload.fechaInicio).toBe('2026-10-17')
    expect(payload.fechaFin).toBe('2026-10-17')
    expect(payload.observaciones).toBeNull()
  })
})
