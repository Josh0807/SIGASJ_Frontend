import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getHistorialColaborador,
  historialColaboradorEndpoint,
  toHistorialParams,
} from './historialColaboradorApi'

const ok = (body: unknown, status = 200) =>
  ({ ok: true, status, json: async () => body }) as Response

describe('contrato API de historial del colaborador', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('consulta con tipo, fechas y paginación', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      ok({
        colaborador: { id: 3, nombre: 'Ana', apellidos: 'Rojas', cedula: '1', cargo: 'Fontanera' },
        historial: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await getHistorialColaborador(3, {
      tipo: 'INCAPACIDAD',
      fechaDesde: '2026-01-01',
      fechaHasta: '2026-12-31',
      page: 2,
    })

    const url = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost')
    expect(url.pathname).toMatch(/\/rrhh\/colaboradores\/3\/historial$/)
    expect(Object.fromEntries(url.searchParams)).toEqual({
      tipo: 'INCAPACIDAD',
      fechaDesde: '2026-01-01',
      fechaHasta: '2026-12-31',
      page: '2',
      limit: '10',
    })
  })

  it('omite filtros vacíos y conserva page/limit', async () => {
    expect(
      toHistorialParams({
        tipo: '',
        fechaDesde: ' ',
        fechaHasta: '',
        page: 1,
      }),
    ).toEqual({
      tipo: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined,
      page: 1,
      limit: 10,
    })
    expect(historialColaboradorEndpoint(7)).toBe('/rrhh/colaboradores/7/historial')
  })
})
