import { afterEach, describe, expect, it, vi } from 'vitest'
import { actualizarAsociado, getAsociado, getAsociados, getHistorialAsociados, registrarAsociado, toAsociadosParams, cambiarEstadoAsociado } from './asociadosApi'

const ok = (body: unknown, status = 200) => ({ ok: true, status, json: async () => body }) as Response
const listadoVacio = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }

describe('contrato API de asociados', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('consulta el historial con filtros, orden y paginación', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok(listadoVacio))
    vi.stubGlobal('fetch', fetchMock)
    await getHistorialAsociados({
      search: '  Mora ', estado: 'inactivo', fechaRegistroDesde: '2023-01-01',
      fechaRegistroHasta: '', fechaInactivacionDesde: '2026-01-01',
      fechaInactivacionHasta: '2026-12-31', orden: 'DESC', page: 2,
    })
    const url = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost')
    expect(url.pathname).toMatch(/\/asociados\/historial$/)
    expect(url.searchParams.get('search')).toBe('Mora')
    expect(url.searchParams.get('estado')).toBe('inactivo')
    expect(url.searchParams.get('fechaRegistroDesde')).toBe('2023-01-01')
    expect(url.searchParams.get('fechaInactivacionHasta')).toBe('2026-12-31')
    expect(url.searchParams.get('orden')).toBe('DESC')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('limit')).toBe('10')
  })

  it('consulta el listado con búsqueda, estado y paginación', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok(listadoVacio))
    vi.stubGlobal('fetch', fetchMock)
    await getAsociados({ search: '  Pérez ', estado: 'inactivos', page: 2 })
    const url = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost')
    expect(url.pathname).toMatch(/\/asociados$/)
    expect(url.searchParams.get('search')).toBe('Pérez')
    expect(url.searchParams.get('activo')).toBe('false')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('limit')).toBe('10')
  })

  it('omite búsqueda vacía y estado "todos"', () => {
    expect(toAsociadosParams({ search: '   ', estado: 'todos', page: 1 })).toEqual({
      search: undefined,
      activo: undefined,
      page: 1,
      limit: 10,
    })
    expect(toAsociadosParams({ search: '', estado: 'activos', page: 1 }).activo).toBe(true)
  })

  it('consulta el detalle por id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 5 }))
    vi.stubGlobal('fetch', fetchMock)
    await getAsociado(5)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/asociados\/5$/)
  })

  it('registra con POST y el payload esperado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 1 }, 201))
    vi.stubGlobal('fetch', fetchMock)
    const payload = { nombre: 'Juan', apellidos: 'Pérez', cedula: '1-1234', correoElectronico: 'juan@example.com' }
    await registrarAsociado(payload)
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify(payload))
  })

  it('actualiza por id mediante PATCH sin incluir el estado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 5, nombre: 'Carlos' }))
    vi.stubGlobal('fetch', fetchMock)
    await actualizarAsociado(5, { nombre: 'Carlos' })
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/asociados\/5$/)
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.method).toBe('PATCH')
    expect(options.body).toBe('{"nombre":"Carlos"}')
    expect(options.body).not.toContain('activo')
  })

  it('inactiva con PATCH /estado enviando el motivo', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 3, activo: false }))
    vi.stubGlobal('fetch', fetchMock)
    await cambiarEstadoAsociado(3, false, 'Venta de la propiedad')
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/asociados\/3\/estado$/)
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.method).toBe('PATCH')
    expect(JSON.parse(String(options.body))).toEqual({ activo: false, motivo: 'Venta de la propiedad' })
  })

  it('reactiva con PATCH /estado sin enviar motivo', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 3, activo: true }))
    vi.stubGlobal('fetch', fetchMock)
    await cambiarEstadoAsociado(3, true, 'ignorado')
    expect(JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))).toEqual({ activo: true })
  })
})
