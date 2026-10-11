import { describe, expect, it } from 'vitest'
import type { MovimientoVacacionesFormValues } from './types'
import {
  EMPTY_MOVIMIENTO_VACACIONES_VALUES,
  diasConSigno,
  formatearFechaMovimiento,
  pluralDias,
  tipoMovimientoLabel,
  toMovimientoVacacionesPayload,
  vacacionesErrorMessage,
  validateMovimientoVacaciones,
} from './vacacionesForm'

const valido: MovimientoVacacionesFormValues = {
  tipo: 'ACUMULADO',
  cantidadDias: '2',
  fecha: '2026-08-01',
  observaciones: '',
}

describe('validateMovimientoVacaciones', () => {
  it('acepta un movimiento válido', () => {
    expect(validateMovimientoVacaciones(valido)).toEqual({})
  })

  it('exige tipo, días y fecha', () => {
    const errors = validateMovimientoVacaciones(EMPTY_MOVIMIENTO_VACACIONES_VALUES)
    expect(errors.tipo).toMatch(/tipo/i)
    expect(errors.cantidadDias).toMatch(/días/i)
    expect(errors.fecha).toMatch(/fecha/i)
  })

  it.each(['0', '-1', '1.5', 'abc'])('rechaza cantidad inválida %s', (cantidadDias) => {
    expect(validateMovimientoVacaciones({ ...valido, cantidadDias }).cantidadDias).toBeDefined()
  })

  it('rechaza fechas de calendario inexistentes', () => {
    expect(validateMovimientoVacaciones({ ...valido, fecha: '2026-02-30' }).fecha).toBe('Use una fecha válida.')
  })

  it('no deja disfrutar más días que los disponibles', () => {
    const errors = validateMovimientoVacaciones({ ...valido, tipo: 'DISFRUTADO', cantidadDias: '5' }, 3)
    expect(errors.cantidadDias).toBe('Solo hay 3 días disponibles.')
  })

  it('permite disfrutar exactamente el saldo y no limita los acumulados', () => {
    expect(validateMovimientoVacaciones({ ...valido, tipo: 'DISFRUTADO', cantidadDias: '3' }, 3)).toEqual({})
    expect(validateMovimientoVacaciones({ ...valido, tipo: 'ACUMULADO', cantidadDias: '50' }, 3)).toEqual({})
  })

  it('limita las observaciones a 500 caracteres', () => {
    expect(validateMovimientoVacaciones({ ...valido, observaciones: 'x'.repeat(501) }).observaciones).toBeDefined()
  })
})

describe('toMovimientoVacacionesPayload', () => {
  it('convierte los valores del formulario al cuerpo del API', () => {
    expect(
      toMovimientoVacacionesPayload(3, { ...valido, cantidadDias: ' 2 ', observaciones: '  Nota  ' }),
    ).toEqual({
      colaboradorId: 3,
      tipo: 'ACUMULADO',
      cantidadDias: 2,
      fecha: '2026-08-01',
      observaciones: 'Nota',
    })
    expect(toMovimientoVacacionesPayload(3, valido).observaciones).toBeNull()
  })
})

describe('formato del historial', () => {
  it('muestra +N para acumulados y -N para disfrutados', () => {
    expect(diasConSigno({ tipo: 'ACUMULADO', cantidadDias: 2 })).toBe('+2')
    expect(diasConSigno({ tipo: 'DISFRUTADO', cantidadDias: 3 })).toBe('-3')
  })

  it('formatea la fecha como dd/MM/yyyy sin desfase', () => {
    expect(formatearFechaMovimiento('2026-08-01')).toBe('01/08/2026')
    expect(formatearFechaMovimiento('2026-08-15T00:00:00.000Z')).toBe('15/08/2026')
    expect(formatearFechaMovimiento('no-es-fecha')).toBe('—')
    expect(formatearFechaMovimiento(undefined as unknown as string)).toBe('—')
  })

  it('etiquetas y plurales', () => {
    expect(tipoMovimientoLabel('ACUMULADO')).toBe('Acumulado')
    expect(tipoMovimientoLabel('DISFRUTADO')).toBe('Disfrutado')
    expect(pluralDias(1)).toBe('1 día')
    expect(pluralDias(12)).toBe('12 días')
  })
})

describe('vacacionesErrorMessage', () => {
  it('traduce los códigos del backend', () => {
    expect(vacacionesErrorMessage(new Error('HTTP 403: Forbidden'), 'x')).toMatch(/No tiene acceso/)
    expect(vacacionesErrorMessage(new Error('HTTP 404: Not Found'), 'x')).toMatch(/no existe/)
    expect(vacacionesErrorMessage(new Error('Failed to fetch'), 'x')).toMatch(/conectar/)
    expect(vacacionesErrorMessage(new Error('HTTP 500: boom'), 'fallback')).toBe('fallback')
  })

  it('muestra el detalle de un 400 del backend', () => {
    expect(
      vacacionesErrorMessage(
        new Error('HTTP 400: El colaborador no tiene saldo suficiente de vacaciones: dispone de 5 día(s) y se intentan disfrutar 6'),
        'x',
      ),
    ).toMatch(/saldo suficiente/)
    expect(
      vacacionesErrorMessage(new Error('HTTP 400: ["La cantidad de días debe ser mayor a cero"]'), 'x'),
    ).toBe('La cantidad de días debe ser mayor a cero.')
  })
})
