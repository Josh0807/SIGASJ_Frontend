import { afterEach, describe, expect, it, vi } from 'vitest'
import { getMovimientoAdmin, getMovimientosAdmin } from './movimientosApi'

const response = (body: unknown, ok = true, status = 200) => ({
  ok,
  status,
  statusText: ok ? 'OK' : 'Error',
  text: async () => JSON.stringify(body),
  json: async () => body,
}) as Response

describe('movimientosApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('consulta el historial con filtros', async () => {
    localStorage.setItem('token', 'test-token')
    const fetchMock = vi.fn(async () => response({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    }))
    vi.stubGlobal('fetch', fetchMock)

    await getMovimientosAdmin({
      tipo: 'ENTRADA',
      idMaterial: 4,
      fechaDesde: '2026-08-01',
      fechaHasta: '2026-08-31',
      page: 2,
      limit: 10,
    })

    const url = String(fetchMock.mock.calls[0]?.[0])
    expect(url).toContain('/admin/inventario/movimientos')
    expect(url).toContain('tipo=ENTRADA')
    expect(url).toContain('idMaterial=4')
    expect(url).toContain('fechaDesde=2026-08-01')
    expect(url).toContain('page=2')
  })

  it('consulta el detalle de un movimiento', async () => {
    localStorage.setItem('token', 'test-token')
    const fetchMock = vi.fn(async () => response({ id: 25, tipo: 'SALIDA' }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await getMovimientoAdmin(25)

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/admin/inventario/movimientos/25')
    expect(result.id).toBe(25)
  })
})
