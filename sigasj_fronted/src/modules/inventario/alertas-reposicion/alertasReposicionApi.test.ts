import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAuthSession } from '../../auth/utils/authStorage'
import { getAlertasReposicionAdmin, patchAlertaReposicionEstado } from './alertasReposicionApi'

describe('alertasReposicionApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setAuthSession({
      accessToken: 'jwt-admin',
      user: { id: '1', name: 'Ana', role: 'Administradora' },
    })
  })

  it('consulta el listado administrativo con JWT, paginación y filtro de estado', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await getAlertasReposicionAdmin({ estado: 'PENDIENTE', page: 1, limit: 10 })

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://localhost:3000/api/v1/admin/inventario/alertas-reposicion?estado=PENDIENTE&page=1&limit=10',
    )
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: 'Bearer jwt-admin',
    })
  })

  it('omite el estado cuando se consultan todas las alertas', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [], total: 0, page: 2, limit: 10, totalPages: 0 }), {
        status: 200,
      }),
    )

    await getAlertasReposicionAdmin({ page: 2, limit: 10 })

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://localhost:3000/api/v1/admin/inventario/alertas-reposicion?page=2&limit=10',
    )
  })

  it('actualiza el estado de una alerta con PATCH autenticado', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 3, estado: 'EN_GESTION' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await patchAlertaReposicionEstado(3, 'EN_GESTION')

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://localhost:3000/api/v1/admin/inventario/alertas-reposicion/3/estado',
    )
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'PATCH',
      headers: { Authorization: 'Bearer jwt-admin' },
    })
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ estado: 'EN_GESTION' })
  })
})
