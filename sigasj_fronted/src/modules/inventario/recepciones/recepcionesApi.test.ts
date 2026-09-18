import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAuthSession } from '../../auth/utils/authStorage'
import { registrarRecepcionAdmin } from './recepcionesApi'

describe('recepcionesApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setAuthSession({
      accessToken: 'jwt-admin',
      user: { id: '1', name: 'Ana', role: 'Administradora' },
    })
  })

  it('registra recepción con POST autenticado', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 5, estado: 'RECIBIDA' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await registrarRecepcionAdmin({
      idReposicion: 5,
      detalles: [{ idMaterial: 4, cantidad: 20 }],
      observacion: 'Conforme',
    })

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://localhost:3000/api/v1/admin/inventario/recepciones',
    )
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'POST' })
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      idReposicion: 5,
      detalles: [{ idMaterial: 4, cantidad: 20 }],
      observacion: 'Conforme',
    })
  })
})
