import { afterEach, describe, expect, it, vi } from 'vitest'
import { createProveedor, getProveedor, getProveedores, updateProveedor, updateProveedorEstado } from './proveedoresApi'

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response

describe('contrato API de proveedores', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('lista con búsqueda, estado y paginación', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ data: [] })); vi.stubGlobal('fetch', fetchMock)
    await getProveedores({ search: 'Lagar', activo: false, page: 2, limit: 10 })
    expect(String(fetchMock.mock.calls[0][0])).toContain('search=Lagar&activo=false&page=2&limit=10')
  })

  it('solicita solo activos para selectores de nuevas asignaciones', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ data: [] })); vi.stubGlobal('fetch', fetchMock)
    await getProveedores({ activo: true, page: 1, limit: 100 })
    expect(String(fetchMock.mock.calls[0][0])).toContain('activo=true&page=1&limit=100')
  })

  it('consulta un proveedor por id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 8 })); vi.stubGlobal('fetch', fetchMock)
    await getProveedor(8)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/proveedores\/8$/)
  })

  it('registra y edita usando los métodos administrativos', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 8 })); vi.stubGlobal('fetch', fetchMock)
    await createProveedor({ nombre: 'Ferretería', razonSocial: null, identificacion: null, telefono: null, correo: null, direccion: null, personaContacto: null })
    await updateProveedor(8, { telefono: '2680-1122' })
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('POST')
    expect((fetchMock.mock.calls[1][1] as RequestInit).method).toBe('PATCH')
  })

  it('cambia estado sin eliminar físicamente', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 8, activo: false })); vi.stubGlobal('fetch', fetchMock)
    await updateProveedorEstado(8, false)
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/proveedores\/8\/estado$/)
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe('{"activo":false}')
  })
})
