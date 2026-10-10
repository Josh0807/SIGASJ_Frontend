import { describe, expect, it } from 'vitest'
import {
  EMPTY_PERMISO_VALUES,
  esFechaCalendario,
  formatearFechaPermiso,
  permisoErrorMessage,
  toPermisoPayload,
  validatePermiso,
} from './permisoForm'

const valid = {
  colaboradorId: '3',
  fechaInicio: '2026-10-12',
  fechaFin: '2026-10-14',
  motivo: ' Cita médica ',
  observaciones: ' Cobertura ',
}

describe('formulario de permiso', () => {
  it('exige colaborador, fechas y motivo', () => {
    expect(Object.keys(validatePermiso(EMPTY_PERMISO_VALUES)).sort()).toEqual(
      ['colaboradorId', 'fechaFin', 'fechaInicio', 'motivo'].sort(),
    )
  })

  it('rechaza fechas inválidas y fin anterior al inicio', () => {
    expect(esFechaCalendario('2026-02-31')).toBe(false)
    expect(validatePermiso({ ...valid, fechaFin: '2026-10-11' }).fechaFin).toMatch(/anterior/)
    expect(validatePermiso(valid)).toEqual({})
  })

  it('arma el payload recortando textos', () => {
    expect(toPermisoPayload(valid)).toEqual({
      colaboradorId: 3,
      fechaInicio: '2026-10-12',
      fechaFin: '2026-10-14',
      motivo: 'Cita médica',
      observaciones: 'Cobertura',
    })
  })

  it('formatea la fecha del permiso en español', () => {
    expect(formatearFechaPermiso('2026-10-12T00:00:00.000Z')).toMatch(/12/)
  })

  it('interpreta errores HTTP del backend', () => {
    expect(permisoErrorMessage(new Error('HTTP 403: x'), 'x')).toMatch(/acceso/)
    expect(permisoErrorMessage(new Error('HTTP 404: x'), 'x')).toMatch(/no existe/)
    expect(permisoErrorMessage(new Error('HTTP 400: El colaborador con id 9 no existe'), 'x')).toMatch(
      /colaborador/,
    )
  })
})
