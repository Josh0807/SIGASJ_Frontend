import { describe, expect, it } from 'vitest'
import {
  domingoPascua,
  feriadosDelAnio,
  resumenDiasVacaciones,
} from './feriadosCostaRica'

describe('feriadosCostaRica', () => {
  it('calcula Pascua 2026', () => {
    expect(domingoPascua(2026)).toEqual({ mes: 4, dia: 5 })
  })

  it('lista feriados oficiales 2026', () => {
    expect(feriadosDelAnio(2026).map((f) => f.fecha)).toEqual([
      '2026-01-01',
      '2026-04-02',
      '2026-04-03',
      '2026-04-11',
      '2026-05-01',
      '2026-07-25',
      '2026-08-02',
      '2026-08-15',
      '2026-08-31',
      '2026-09-15',
      '2026-12-01',
      '2026-12-25',
    ])
  })

  it('descuenta feriados del saldo de vacaciones', () => {
    const resumen = resumenDiasVacaciones('2026-04-01', '2026-04-12')
    expect(resumen.diasCalendario).toBe(12)
    expect(resumen.feriados).toHaveLength(3)
    expect(resumen.diasNetos).toBe(9)
  })
})
