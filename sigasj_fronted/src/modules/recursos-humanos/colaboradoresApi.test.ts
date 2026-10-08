import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  actualizarColaborador,
  cambiarEstadoColaborador,
  getColaborador,
  getColaboradores,
  getCuentasUsuario,
  registrarColaborador,
} from './colaboradoresApi'

const ok = (body: unknown, status = 200) => ({ ok: true, status, json: async () => body }) as Response
const payload = {
  nombre: 'Juan',
  apellidos: 'Pérez',
  cedula: '1-1111-1111',
  correoElectronico: 'juan@example.com',
  cargo: 'Fontanero',
}

describe('contrato API de colaboradores', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('lista con búsqueda, cargo, estado y paginación', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ data: [], total: 0, page: 2, limit: 10, totalPages: 0 }))
    vi.stubGlobal('fetch', fetchMock)
    await getColaboradores({ search: ' juan ', cargo: 'Fontanero', estado: 'inactivos', page: 2 })
    const url = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost')
    expect(url.pathname).toMatch(/\/rrhh\/colaboradores$/)
    expect(Object.fromEntries(url.searchParams)).toEqual({
      search: 'juan',
      cargo: 'Fontanero',
      activo: 'false',
      page: '2',
      limit: '10',
    })
  })

  it('omite filtros vacíos y el estado "todos"', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }))
    vi.stubGlobal('fetch', fetchMock)
    await getColaboradores({ search: '', cargo: ' ', estado: 'todos', page: 1 })
    const url = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost')
    expect(Object.fromEntries(url.searchParams)).toEqual({ page: '1', limit: '10' })
  })

  it('consulta, registra, edita y cambia estado con el método esperado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 4 }))
    vi.stubGlobal('fetch', fetchMock)
    await getColaborador(4)
    await registrarColaborador(payload)
    await actualizarColaborador(4, { ...payload, usuarioId: null })
    await cambiarEstadoColaborador(4, false)

    const llamadas = fetchMock.mock.calls.map(([url, init]) => [
      new URL(String(url), 'http://localhost').pathname.replace(/^.*\/rrhh/, '/rrhh'),
      (init as RequestInit).method ?? 'GET',
      (init as RequestInit).body,
    ])
    expect(llamadas).toEqual([
      ['/rrhh/colaboradores/4', 'GET', undefined],
      ['/rrhh/colaboradores', 'POST', JSON.stringify(payload)],
      ['/rrhh/colaboradores/4', 'PATCH', JSON.stringify({ ...payload, usuarioId: null })],
      ['/rrhh/colaboradores/4/estado', 'PATCH', JSON.stringify({ activo: false })],
    ])
  })

  it('normaliza las cuentas de usuario que responde { data }', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        ok({ data: [{ id: 20, nombre: 'Fontanero demo', correo: 'f@x.cr', activo: true, rol: 'FONTANERO' }] }),
      ),
    )
    await expect(getCuentasUsuario()).resolves.toEqual([
      { id: 20, nombre: 'Fontanero demo', correo: 'f@x.cr', activo: true, rol: 'FONTANERO' },
    ])
  })
})
