import { describe, expect, it } from 'vitest'
import {
  getAveriaAsignacionView,
  puedeAsignarFontaneroAveria,
} from './averiaAsignacionView'
import { findAveriaDetailFixture } from './fixtures/averiasAdminDetail.fixture'

describe('averiaAsignacionView', () => {
  it('permite formulario en RECIBIDA, EN_REVISION y PENDIENTE sin fontanero', () => {
    const base = findAveriaDetailFixture(1)!
    expect(
      puedeAsignarFontaneroAveria({
        ...base,
        estado: 'EN_REVISION',
        fontanero: null,
      }),
    ).toBe(true)
    expect(
      puedeAsignarFontaneroAveria({
        ...base,
        estado: 'PENDIENTE',
        fontanero: null,
      }),
    ).toBe(true)
    expect(getAveriaAsignacionView(
      { ...base, estado: 'EN_REVISION', fontanero: null },
      true,
    )).toBe('formulario')
    expect(getAveriaAsignacionView(
      { ...base, estado: 'RECIBIDA', fontanero: null },
      true,
    )).toBe('formulario')
    expect(puedeAsignarFontaneroAveria({
      ...base,
      estado: 'RECIBIDA',
      fontanero: null,
    })).toBe(true)
  })

  it('no permite una avería ya asignada', () => {
    const recibida = findAveriaDetailFixture(1)!
    expect(puedeAsignarFontaneroAveria({ ...recibida, fontanero: { id: 4, nombre: 'Luis' } })).toBe(false)

    const asignada = findAveriaDetailFixture(2)!
    expect(puedeAsignarFontaneroAveria(asignada)).toBe(false)
    expect(getAveriaAsignacionView(asignada, true)).toBe('asignada')
  })
})
