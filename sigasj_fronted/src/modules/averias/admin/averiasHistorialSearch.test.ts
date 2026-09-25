import { describe, expect, it } from 'vitest'
import {
  buildAveriasHistorialSearch,
  historialRangoFechasInvalido,
  parseAveriasHistorialSearch,
} from './averiasHistorialSearch'

describe('averiasHistorialSearch', () => {
  it('serializa filtros combinados y los restaura', () => {
    const search = buildAveriasHistorialSearch({
      page: 2,
      codigoSeguimiento: 'AV-2026-0005',
      estado: 'RESUELTA',
      prioridad: 'ALTA',
      tipo: 'TUBO_MEDIDOR',
      fontaneroId: '5',
      sector: 'Palmares',
      fechaDesde: '2026-08-01',
      fechaHasta: '2026-08-31',
    })

    expect(parseAveriasHistorialSearch(search)).toEqual({
      page: 2,
      codigoSeguimiento: 'AV-2026-0005',
      estado: 'RESUELTA',
      prioridad: 'ALTA',
      tipo: 'TUBO_MEDIDOR',
      fontaneroId: '5',
      sector: 'Palmares',
      fechaDesde: '2026-08-01',
      fechaHasta: '2026-08-31',
    })
  })

  it('omite la página 1 y descarta fechas o fontaneros inválidos', () => {
    expect(
      buildAveriasHistorialSearch({
        page: 1,
        codigoSeguimiento: '',
        estado: '',
        prioridad: '',
        tipo: '',
        fontaneroId: '',
        sector: '',
        fechaDesde: '',
        fechaHasta: '',
      }),
    ).toBe('')
    expect(parseAveriasHistorialSearch('?fontaneroId=abc&fechaDesde=01/02/2026').fontaneroId).toBe(
      '',
    )
    expect(parseAveriasHistorialSearch('?fechaDesde=01/02/2026').fechaDesde).toBe('')
  })

  it('detecta un rango de fechas invertido', () => {
    expect(historialRangoFechasInvalido('2026-09-12', '2026-08-01')).toBe(true)
    expect(historialRangoFechasInvalido('2026-08-01', '2026-08-31')).toBe(false)
  })
})
