import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAuthSession } from '../../auth/utils/authStorage'
import { createSolicitudMateriales, getMiSolicitudMateriales, getMisSolicitudesMateriales, getSolicitudesMaterialesAdmin } from './solicitudesMaterialesApi'

describe('solicitudesMaterialesApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setAuthSession({
      accessToken: 'jwt-fontanero',
      user: { id: '7', name: 'Mario', role: 'Fontanero' },
    })
  })

  it('envía el JWT y el payload a la ruta del fontanero', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1, codigo: 'SOL-2026-000001' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await createSolicitudMateriales({
      motivo: 'Reparación',
      materiales: [{ idMaterial: 1, cantidad: 5 }],
    })

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:3000/api/v1/fontanero/solicitudes-materiales')
    expect(options?.method).toBe('POST')
    expect(options?.headers).toMatchObject({ Authorization: 'Bearer jwt-fontanero' })
    expect(JSON.parse(String(options?.body))).not.toHaveProperty('idFontanero')
  })

  it('consulta únicamente la colección y detalle del fontanero autenticado', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 12, detalles: [] }), { status: 200 }))

    await getMisSolicitudesMateriales({ estado: 'PENDIENTE', page: 1, limit: 10 })
    await getMiSolicitudMateriales(12)

    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3000/api/v1/fontanero/solicitudes-materiales?estado=PENDIENTE&page=1&limit=10')
    expect(fetchMock.mock.calls[1][0]).toBe('http://localhost:3000/api/v1/fontanero/solicitudes-materiales/12')
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({ Authorization: 'Bearer jwt-fontanero' })
  })

  it('consulta el listado administrativo de solicitudes pendientes', async () => {
    setAuthSession({
      accessToken: 'jwt-admin',
      user: { id: '1', name: 'Ana', role: 'Administradora' },
    })
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }), { status: 200 }),
    )

    await getSolicitudesMaterialesAdmin()

    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3000/api/v1/admin/solicitudes-materiales?estado=PENDIENTE&page=1&limit=10')
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({ Authorization: 'Bearer jwt-admin' })
  })
})
