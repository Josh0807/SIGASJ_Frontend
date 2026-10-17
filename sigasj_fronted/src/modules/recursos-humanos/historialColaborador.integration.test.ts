import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getHistorialColaborador,
  historialColaboradorEndpoint,
  toHistorialParams,
} from './historialColaboradorApi'
import { historialErrorMessage } from './historialColaborador'

const ok = (body: unknown, status = 200) =>
  ({ ok: true, status, json: async () => body }) as Response

const respuesta = {
  colaborador: {
    id: 2071,
    nombre: 'Integra',
    apellidos: 'Incapacidad3181',
    cedula: '1-0000-0000',
    cargo: 'Fontanero',
  },
  historial: [
    {
      id: 1,
      tipo: 'PERMISO' as const,
      fecha: '2026-11-05',
      fechaInicio: '2026-11-05',
      fechaFin: '2026-11-05',
      descripcion: 'retest',
    },
    {
      id: 46,
      tipo: 'VACACION' as const,
      fecha: '2026-07-15',
      fechaInicio: null,
      fechaFin: null,
      descripcion: 'Acumulado: 4 día(s). QA historial vacacion',
      tipoMovimiento: 'ACUMULADO' as const,
      cantidadDias: 4,
    },
    {
      id: 2017,
      tipo: 'INCAPACIDAD' as const,
      fecha: '2026-12-01',
      fechaInicio: '2026-12-01',
      fechaFin: '2026-12-03',
      descripcion: 'fechas corregidas',
    },
  ],
  total: 3,
  page: 1,
  limit: 10,
  totalPages: 1,
}

describe('integración historial administrativo (contrato real)', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('usa GET autenticado al endpoint consolidado sin mutations', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok(respuesta))
    vi.stubGlobal('fetch', fetchMock)

    const data = await getHistorialColaborador(2071, {
      tipo: 'INCAPACIDAD',
      fechaDesde: '2026-01-01',
      fechaHasta: '2026-12-31',
      page: 2,
    })

    expect(historialColaboradorEndpoint(2071)).toBe(
      '/rrhh/colaboradores/2071/historial',
    )
    expect(data.colaborador.id).toBe(2071)
    expect(data.historial.map((e) => e.tipo)).toEqual([
      'PERMISO',
      'VACACION',
      'INCAPACIDAD',
    ])

    const [url, init] = fetchMock.mock.calls[0]
    const parsed = new URL(String(url), 'http://localhost')
    expect(parsed.pathname).toMatch(/\/rrhh\/colaboradores\/2071\/historial$/)
    expect((init as RequestInit).method ?? 'GET').toBe('GET')
    expect((init as RequestInit).body).toBeUndefined()
    expect(Object.fromEntries(parsed.searchParams)).toEqual({
      tipo: 'INCAPACIDAD',
      fechaDesde: '2026-01-01',
      fechaHasta: '2026-12-31',
      page: '2',
      limit: '10',
    })
  })

  it('omite filtros vacíos y no inventa params', () => {
    expect(
      toHistorialParams({
        tipo: '',
        fechaDesde: '',
        fechaHasta: '  ',
        page: 1,
      }),
    ).toEqual({
      tipo: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined,
      page: 1,
      limit: 10,
    })
  })

  it('traduce 400 legible sin JSON técnico', () => {
    expect(
      historialErrorMessage(
        new Error(
          'HTTP 400: ["fechaDesde debe tener formato YYYY-MM-DD"]',
        ),
        'x',
      ),
    ).toBe('fechaDesde debe tener formato YYYY-MM-DD')
  })
})
