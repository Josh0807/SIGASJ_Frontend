import { describe, expect, it } from 'vitest'
import {
  getAveriaAsignacionView,
  puedeAsignarFontaneroAveria,
} from './averiaAsignacionView'
import { findAveriaDetailFixture } from './fixtures/averiasAdminDetail.fixture'

describe('averiaAsignacionView', () => {
  it('permite formulario en EN_REVISION y PENDIENTE sin fontanero', () => {
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
  })

  it('no permite RECIBIDA ni avería ya asignada', () => {
    const recibida = findAveriaDetailFixture(1)!
    expect(puedeAsignarFontaneroAveria(recibida)).toBe(false)
    expect(getAveriaAsignacionView(recibida, true)).toBe('recibida_info')

    const asignada = findAveriaDetailFixture(2)!
    expect(puedeAsignarFontaneroAveria(asignada)).toBe(false)
    expect(getAveriaAsignacionView(asignada, true)).toBe('asignada')
  })
})
