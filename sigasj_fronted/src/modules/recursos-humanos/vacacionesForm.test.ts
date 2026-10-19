import { describe, expect, it } from 'vitest'
import type { MovimientoVacacionesFormValues } from './types'
import {
  EMPTY_MOVIMIENTO_VACACIONES_VALUES,
  avisoMovimientoRegistrado,
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
  signoAjuste: '',
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

  it('exige motivo y signo en AJUSTE', () => {
    const errors = validateMovimientoVacaciones({
      ...valido,
      tipo: 'AJUSTE',
      signoAjuste: '',
      observaciones: '',
    })
    expect(errors.signoAjuste).toBeDefined()
    expect(errors.observaciones).toMatch(/motivo/i)
  })

  it('acepta AJUSTE con suma y motivo', () => {
    expect(
      validateMovimientoVacaciones({
        ...valido,
        tipo: 'AJUSTE',
        signoAjuste: '1',
        observaciones: 'Corrección',
      }),
    ).toEqual({})
  })

  it('no deja disfrutar más días que los disponibles', () => {
    const errors = validateMovimientoVacaciones(
      { ...valido, tipo: 'DISFRUTADO', cantidadDias: '5' },
      3,
    )
    expect(errors.cantidadDias).toBe('Solo hay 3 días disponibles.')
  })
})

describe('toMovimientoVacacionesPayload', () => {
  it('incluye signoAjuste solo en AJUSTE', () => {
    expect(
      toMovimientoVacacionesPayload(3, {
        ...valido,
        tipo: 'AJUSTE',
        signoAjuste: '-1',
        observaciones: 'Motivo',
      }),
    ).toEqual({
      colaboradorId: 3,
      tipo: 'AJUSTE',
      cantidadDias: 2,
      signoAjuste: -1,
      fecha: '2026-08-01',
      observaciones: 'Motivo',
    })
  })
})

describe('formato del historial', () => {
  it('muestra Adquisición / Disfrute / Ajuste', () => {
    expect(tipoMovimientoLabel('ACUMULADO')).toBe('Adquisición')
    expect(tipoMovimientoLabel('DISFRUTADO')).toBe('Disfrute')
    expect(tipoMovimientoLabel('AJUSTE')).toBe('Ajuste')
    expect(diasConSigno({ tipo: 'AJUSTE', cantidadDias: 2, signoAjuste: -1 })).toBe('-2')
    expect(pluralDias(1)).toBe('1 día')
    expect(avisoMovimientoRegistrado('AJUSTE', 2, -1)).toMatch(/ajuste/)
    expect(formatearFechaMovimiento('2026-08-01')).toBe('01/08/2026')
  })
})

describe('vacacionesErrorMessage', () => {
  it('traduce los códigos del backend', () => {
    expect(vacacionesErrorMessage(new Error('HTTP 403: Forbidden'), 'x')).toMatch(/No tiene acceso/)
  })
})
