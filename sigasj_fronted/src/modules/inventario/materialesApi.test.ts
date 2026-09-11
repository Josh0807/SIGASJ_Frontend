import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMaterial, getMaterial, getMateriales, updateMaterial, updateMaterialEstado } from './materialesApi'

const response = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response

describe('contrato API de materiales', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('envía paginación, búsqueda y filtro al listado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ data: [], total: 0, page: 2, limit: 10, totalPages: 0 }))
    vi.stubGlobal('fetch', fetchMock)
    await getMateriales({ page: 2, limit: 10, nombre: 'tubo', activo: false })
    expect(String(fetchMock.mock.calls[0][0])).toContain('page=2&limit=10&nombre=tubo&activo=false')
  })

  it('consulta el detalle por id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ id: 5 }))
    vi.stubGlobal('fetch', fetchMock)
    await getMaterial(5)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/inventario\/materiales\/5$/)
  })

  it('filtra materiales por idCategoria', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }))
    vi.stubGlobal('fetch', fetchMock)
    await getMateriales({ idCategoria: 7, page: 1, limit: 10 })
    expect(String(fetchMock.mock.calls[0][0])).toContain('idCategoria=7')
  })

  it('filtra materiales por proveedor', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }))
    vi.stubGlobal('fetch', fetchMock)
    await getMateriales({ idProveedor: 10, page: 1, limit: 10 })
    expect(String(fetchMock.mock.calls[0][0])).toContain('idProveedor=10')
  })

  it('registra sin enviar stockActual', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ id: 1 }))
    vi.stubGlobal('fetch', fetchMock)
    await createMaterial({ nombre: 'Tubo', unidadMedida: 'Unidad', descripcion: null, ubicacion: null, stockMinimo: 0, idCategoria: 2, idProveedor: 10 })
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.method).toBe('POST')
    expect(options.body).not.toContain('stockActual')
    expect(options.body).toContain('"idCategoria":2')
    expect(options.body).toContain('"idProveedor":10')
  })

  it('actualiza datos sin enviar stockActual', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ id: 1 }))
    vi.stubGlobal('fetch', fetchMock)
    await updateMaterial(1, { nombre: 'Tubo', unidadMedida: 'Metro', descripcion: null, ubicacion: null, stockMinimo: 2, activo: true, idCategoria: null, idProveedor: null })
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.method).toBe('PUT')
    expect(options.body).not.toContain('stockActual')
    expect(options.body).toContain('"idCategoria":null')
    expect(options.body).toContain('"idProveedor":null')
  })

  it('usa el endpoint dedicado para activar y desactivar', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ id: 1, activo: false }))
    vi.stubGlobal('fetch', fetchMock)
    await updateMaterialEstado(1, false)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/inventario\/materiales\/1\/estado$/)
    expect((fetchMock.mock.calls[0][1] as RequestInit).body).toBe('{"activo":false}')
  })
})
