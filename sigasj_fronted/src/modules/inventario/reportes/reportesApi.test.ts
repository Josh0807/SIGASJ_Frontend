import { afterEach, describe, expect, it, vi } from 'vitest'
import { getReporteInventarioAdmin } from './reportesApi'

const response = (body: unknown, ok = true, status = 200) => ({
  ok,
  status,
  statusText: ok ? 'OK' : 'Error',
  text: async () => JSON.stringify(body),
  json: async () => body,
}) as Response

describe('reportesApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('consulta el reporte con filtros', async () => {
    localStorage.setItem('token', 'test-token')
    const fetchMock = vi.fn(async () => response({
      indicadores: {
        totalMateriales: 2,
        materialesActivos: 2,
        materialesStockBajo: 1,
        entradasRegistradas: 3,
        salidasRegistradas: 1,
      },
      porCategoria: [],
      materiales: [],
      movimientos: [],
    }))
    vi.stubGlobal('fetch', fetchMock)

    await getReporteInventarioAdmin({
      fechaDesde: '2026-08-01',
      fechaHasta: '2026-08-31',
      idCategoria: 2,
      tipo: 'SALIDA',
    })

    const url = String(fetchMock.mock.calls[0]?.[0])
    expect(url).toContain('/admin/inventario/reportes/resumen')
    expect(url).toContain('fechaDesde=2026-08-01')
    expect(url).toContain('idCategoria=2')
    expect(url).toContain('tipo=SALIDA')
  })
})
