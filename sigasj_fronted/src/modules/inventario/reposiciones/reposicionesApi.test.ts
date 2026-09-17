import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAuthSession } from '../../auth/utils/authStorage'
import { getReposicionAdmin, getReposicionesAdmin } from './reposicionesApi'

describe('reposicionesApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setAuthSession({
      accessToken: 'jwt-admin',
      user: { id: '1', name: 'Ana', role: 'Administradora' },
    })
  })

  it('consulta el listado administrativo con JWT, paginación y filtros', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await getReposicionesAdmin({ estado: 'PENDIENTE', origen: 'ALERTA_STOCK_MINIMO', page: 1, limit: 10 })

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://localhost:3000/api/v1/admin/inventario/reposiciones?estado=PENDIENTE&origen=ALERTA_STOCK_MINIMO&page=1&limit=10',
    )
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: 'Bearer jwt-admin',
    })
  })

  it('consulta el detalle de una reposición', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 5, codigo: 'REP-0005' }), {
        status: 200,
      }),
    )

    await getReposicionAdmin(5)

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://localhost:3000/api/v1/admin/inventario/reposiciones/5',
    )
  })
})
