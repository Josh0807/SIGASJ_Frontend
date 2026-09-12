import { describe, expect, it } from 'vitest'
import {
  averiasAdminListPathFromState,
  buildAveriasAdminListSearch,
  parseAveriasAdminListSearch,
} from './averiasAdminListSearch'

describe('averiasAdminListSearch', () => {
  it('serializa y restaura filtros activos', () => {
    const search = buildAveriasAdminListSearch({
      page: 2,
      search: 'Juan',
      estado: 'RECIBIDA',
      prioridad: 'ALTA',
      tipo: 'TUBERIA',
      fechaDesde: '2026-09-01',
      fechaHasta: '2026-09-12',
    })

    expect(search).toBe(
      '?page=2&search=Juan&estado=RECIBIDA&prioridad=ALTA&tipo=TUBERIA&fechaDesde=2026-09-01&fechaHasta=2026-09-12',
    )
    expect(parseAveriasAdminListSearch(search)).toEqual({
      page: 2,
      search: 'Juan',
      estado: 'RECIBIDA',
      prioridad: 'ALTA',
      tipo: 'TUBERIA',
      fechaDesde: '2026-09-01',
      fechaHasta: '2026-09-12',
    })
  })

  it('omite page=1 y filtros vacíos', () => {
    expect(
      buildAveriasAdminListSearch({
        page: 1,
        search: '',
        estado: '',
        prioridad: '',
        tipo: '',
        fechaDesde: '',
        fechaHasta: '',
      }),
    ).toBe('')
  })

  it('reconstruye el listado desde el state del detalle', () => {
    expect(averiasAdminListPathFromState(undefined)).toBe('/admin/averias')
    expect(
      averiasAdminListPathFromState({
        listSearch: '?page=2&search=Juan',
      }),
    ).toBe('/admin/averias?page=2&search=Juan')
  })
})
