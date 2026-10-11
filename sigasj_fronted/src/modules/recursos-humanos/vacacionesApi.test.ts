import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getBalanceVacaciones,
  getMovimientosVacaciones,
  registrarMovimientoVacaciones,
} from './vacacionesApi'

const ok = (body: unknown, status = 200) => ({ ok: true, status, json: async () => body }) as Response

describe('contrato API de vacaciones', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('consulta el balance del colaborador en el servidor', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      ok({ colaboradorId: 3, diasAcumulados: 20, diasDisfrutados: 8, diasDisponibles: 12, totalMovimientos: 4 }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const balance = await getBalanceVacaciones(3)
    const url = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost')
    expect(url.pathname).toMatch(/\/rrhh\/vacaciones\/colaboradores\/3\/balance$/)
    expect(balance.diasDisponibles).toBe(12)
  })

  it('lista el historial con colaborador, tipo, fechas y paginación', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ data: [], total: 0, page: 2, limit: 10, totalPages: 0 }))
    vi.stubGlobal('fetch', fetchMock)
    await getMovimientosVacaciones({
      colaboradorId: ' 3 ',
      tipo: 'DISFRUTADO',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-12-31',
      page: 2,
    })
    const url = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost')
    expect(url.pathname).toMatch(/\/rrhh\/vacaciones\/movimientos$/)
    expect(Object.fromEntries(url.searchParams)).toEqual({
      colaboradorId: '3',
      tipo: 'DISFRUTADO',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-12-31',
      page: '2',
      limit: '10',
    })
  })

  it('omite filtros vacíos', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }))
    vi.stubGlobal('fetch', fetchMock)
    await getMovimientosVacaciones({ colaboradorId: '', tipo: '', fechaInicio: ' ', fechaFin: '', page: 1 })
    const url = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost')
    expect(Object.fromEntries(url.searchParams)).toEqual({ page: '1', limit: '10' })
  })

  it('registra con POST y el cuerpo esperado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 8 }, 201))
    vi.stubGlobal('fetch', fetchMock)
    const payload = {
      colaboradorId: 3,
      tipo: 'ACUMULADO' as const,
      cantidadDias: 2,
      fecha: '2026-08-01',
      observaciones: null,
    }
    await registrarMovimientoVacaciones(payload)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(new URL(url, 'http://localhost').pathname).toMatch(/\/rrhh\/vacaciones\/movimientos$/)
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify(payload))
  })
})
