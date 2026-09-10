import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCategoria, getCategoria, getCategorias, updateCategoria, updateCategoriaEstado } from './categoriasApi'

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response
describe('contrato API de categorías', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('lista con búsqueda, estado y paginación', async () => { const fetchMock = vi.fn().mockResolvedValue(ok({ data: [] })); vi.stubGlobal('fetch', fetchMock); await getCategorias({ nombre: 'PVC', activo: false, page: 2, limit: 20 }); expect(String(fetchMock.mock.calls[0][0])).toContain('nombre=PVC&activo=false&page=2&limit=20') })
  it('solicita únicamente categorías activas para selectores', async () => { const fetchMock = vi.fn().mockResolvedValue(ok({ data: [] })); vi.stubGlobal('fetch', fetchMock); await getCategorias({ activo: true, page: 1, limit: 100 }); expect(String(fetchMock.mock.calls[0][0])).toContain('activo=true&page=1&limit=100') })
  it('consulta detalle', async () => { const fetchMock = vi.fn().mockResolvedValue(ok({ id: 4 })); vi.stubGlobal('fetch', fetchMock); await getCategoria(4); expect(String(fetchMock.mock.calls[0][0])).toMatch(/categorias\/4$/) })
  it('registra por POST y normaliza descripción vacía', async () => { const fetchMock = vi.fn().mockResolvedValue(ok({ id: 1 })); vi.stubGlobal('fetch', fetchMock); await createCategoria({ nombre: 'PVC', descripcion: null }); const options = fetchMock.mock.calls[0][1] as RequestInit; expect(options.method).toBe('POST'); expect(options.body).toBe('{"nombre":"PVC","descripcion":null}') })
  it('edita por PATCH', async () => { const fetchMock = vi.fn().mockResolvedValue(ok({ id: 1 })); vi.stubGlobal('fetch', fetchMock); await updateCategoria(1, { nombre: 'PVC', descripcion: 'Accesorios' }); expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('PATCH') })
  it('cambia estado sin usar DELETE', async () => { const fetchMock = vi.fn().mockResolvedValue(ok({ id: 1 })); vi.stubGlobal('fetch', fetchMock); await updateCategoriaEstado(1, false); expect(String(fetchMock.mock.calls[0][0])).toMatch(/categorias\/1\/estado$/); const options = fetchMock.mock.calls[0][1] as RequestInit; expect(options.method).toBe('PATCH'); expect(options.body).toBe('{"activo":false}') })
})
