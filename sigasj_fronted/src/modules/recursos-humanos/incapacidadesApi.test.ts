import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  actualizarIncapacidad,
  getIncapacidad,
  getIncapacidades,
  registrarIncapacidad,
} from './incapacidadesApi'

const ok = (body: unknown, status = 200) =>
  ({ ok: true, status, json: async () => body }) as Response

const payload = {
  colaboradorId: 3,
  fechaInicio: '2026-10-12',
  fechaFin: '2026-10-20',
  observaciones: null,
}

describe('contrato API de incapacidades', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('lista con colaborador, fechas y paginación', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        ok({ data: [], total: 0, page: 2, limit: 10, totalPages: 0 }),
      )
    vi.stubGlobal('fetch', fetchMock)
    await getIncapacidades({
      colaboradorId: ' 3 ',
      fechaInicio: '2026-10-01',
      fechaFin: '2026-10-31',
      page: 2,
    })
    const url = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost')
    expect(url.pathname).toMatch(/\/rrhh\/incapacidades$/)
    expect(Object.fromEntries(url.searchParams)).toEqual({
      colaboradorId: '3',
      fechaInicio: '2026-10-01',
      fechaFin: '2026-10-31',
      page: '2',
      limit: '10',
    })
  })

  it('omite filtros vacíos', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        ok({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
      )
    vi.stubGlobal('fetch', fetchMock)
    await getIncapacidades({
      colaboradorId: '',
      fechaInicio: ' ',
      fechaFin: '',
      page: 1,
    })
    const url = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      page: '1',
      limit: '10',
    })
  })

  it('consulta, registra y edita con el método esperado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 8 }))
    vi.stubGlobal('fetch', fetchMock)
    await getIncapacidad(8)
    await registrarIncapacidad(payload)
    await actualizarIncapacidad(8, payload)

    const llamadas = fetchMock.mock.calls.map(([url, init]) => [
      new URL(String(url), 'http://localhost').pathname.replace(
        /^.*\/rrhh/,
        '/rrhh',
      ),
      (init as RequestInit).method ?? 'GET',
      (init as RequestInit).body,
    ])
    expect(llamadas).toEqual([
      ['/rrhh/incapacidades/8', 'GET', undefined],
      ['/rrhh/incapacidades', 'POST', JSON.stringify(payload)],
      ['/rrhh/incapacidades/8', 'PATCH', JSON.stringify(payload)],
    ])
  })
})
