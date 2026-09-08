import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ActividadesAdminReportesPage from './ActividadesAdminReportesPage'
import * as actividadesApi from '../services/actividadesFontaneroApi'
import * as authStorage from '../../auth/utils/authStorage'
import type { ReporteActividadesResponse } from '../types/actividadReportes'
import { TIPOS_ACTIVIDAD_BACKEND } from '../test/tiposActividadFixture'

const reporte = (
  overrides: Partial<ReporteActividadesResponse> = {},
): ReporteActividadesResponse => ({
  total: 34,
  porEstado: { REPORTADA: 34 },
  porTipo: [
    {
      tipoActividadId: 1,
      tipoActividadNombre: 'Control de Fugas',
      cantidad: 10,
    },
    {
      tipoActividadId: 2,
      tipoActividadNombre: 'Toma de presión',
      cantidad: 6,
    },
  ],
  porFontanero: [
    { fontaneroId: 'fontanero-1', cantidad: 20 },
    { fontaneroId: 'fontanero-2', cantidad: 14 },
  ],
  actividades: [
    {
      id: 15,
      fechaActividad: '2026-09-05',
      estado: 'REPORTADA',
      tipoActividadId: 1,
      tipoActividadNombre: 'Control de Fugas',
      fontaneroId: 'fontanero-1',
    },
    {
      id: 14,
      fechaActividad: '2026-09-04',
      estado: 'REPORTADA',
      tipoActividadId: 2,
      tipoActividadNombre: 'Toma de presión',
      fontaneroId: 'fontanero-2',
    },
  ],
  ...overrides,
})

const EMPTY_REPORTE = reporte({
  total: 0,
  porEstado: {},
  porTipo: [],
  porFontanero: [],
  actividades: [],
})

const setInputValue = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const changeSelect = (select: HTMLSelectElement, value: string) => {
  select.value = value
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('ActividadesAdminReportesPage', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.spyOn(actividadesApi, 'getTiposActividadFontanero').mockResolvedValue({
      data: TIPOS_ACTIVIDAD_BACKEND,
      total: TIPOS_ACTIVIDAD_BACKEND.length,
    })
    vi.spyOn(actividadesApi, 'getReportesAdmin').mockResolvedValue(reporte())
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  const renderPage = async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ActividadesAdminReportesPage />
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
  }

  const fechaInicio = () =>
    container.querySelector('#reportes-fecha-inicio') as HTMLInputElement
  const fechaFin = () =>
    container.querySelector('#reportes-fecha-fin') as HTMLInputElement
  const fontaneroSelect = () =>
    container.querySelector('#reportes-fontanero') as HTMLSelectElement
  const tipoSelect = () =>
    container.querySelector('#reportes-tipo') as HTMLSelectElement
  const consultarBtn = () =>
    Array.from(container.querySelectorAll('button')).find((btn) =>
      /Consultar|Consultando/.test(btn.textContent ?? ''),
    ) as HTMLButtonElement
  const limpiarBtn = () =>
    Array.from(container.querySelectorAll('button')).find((btn) =>
      (btn.textContent ?? '').includes('Limpiar filtros'),
    ) as HTMLButtonElement

  it('carga reporte general y muestra total, tipos y listado', async () => {
    await renderPage()

    expect(actividadesApi.getReportesAdmin).toHaveBeenCalledWith({})
    expect(container.textContent).toContain('Reporte de actividades del Fontanero')
    expect(container.textContent).toContain('Total de actividades')
    expect(container.textContent).toContain('34')
    expect(container.textContent).toContain('Control de Fugas')
    expect(container.textContent).toContain('Toma de presión')
    expect(container.textContent).toContain('fontanero-1')
    expect(container.textContent).not.toMatch(/\bEditar\b/)
    expect(container.textContent).not.toMatch(/\bEliminar\b/)
    expect(container.textContent).not.toMatch(/\bGuardar\b/)
  })

  it('envía fechaInicio y fechaFin al consultar', async () => {
    await renderPage()
    vi.mocked(actividadesApi.getReportesAdmin).mockClear()
    vi.mocked(actividadesApi.getReportesAdmin).mockResolvedValue(
      reporte({ total: 2, actividades: [reporte().actividades[0]] }),
    )

    await act(async () => {
      setInputValue(fechaInicio(), '2026-09-01')
      setInputValue(fechaFin(), '2026-09-30')
      consultarBtn().click()
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(actividadesApi.getReportesAdmin).toHaveBeenCalledWith({
      fechaInicio: '2026-09-01',
      fechaFin: '2026-09-30',
      fontaneroId: undefined,
      tipoActividadId: undefined,
    })
    expect(container.textContent).toContain('2')
  })

  it('envía fontaneroId al consultar', async () => {
    await renderPage()
    vi.mocked(actividadesApi.getReportesAdmin).mockClear()

    await act(async () => {
      changeSelect(fontaneroSelect(), 'fontanero-1')
      consultarBtn().click()
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(actividadesApi.getReportesAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ fontaneroId: 'fontanero-1' }),
    )
  })

  it('envía tipoActividadId al consultar', async () => {
    await renderPage()
    const tipo = TIPOS_ACTIVIDAD_BACKEND[0]
    vi.mocked(actividadesApi.getReportesAdmin).mockClear()

    await act(async () => {
      changeSelect(tipoSelect(), String(tipo.id))
      consultarBtn().click()
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(actividadesApi.getReportesAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ tipoActividadId: tipo.id }),
    )
  })

  it('combina todos los filtros en un solo request', async () => {
    await renderPage()
    const tipo = TIPOS_ACTIVIDAD_BACKEND[1]
    vi.mocked(actividadesApi.getReportesAdmin).mockClear()

    await act(async () => {
      setInputValue(fechaInicio(), '2026-09-01')
      setInputValue(fechaFin(), '2026-09-30')
      changeSelect(fontaneroSelect(), 'fontanero-2')
      changeSelect(tipoSelect(), String(tipo.id))
      consultarBtn().click()
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(actividadesApi.getReportesAdmin).toHaveBeenCalledWith({
      fechaInicio: '2026-09-01',
      fechaFin: '2026-09-30',
      fontaneroId: 'fontanero-2',
      tipoActividadId: tipo.id,
    })
  })

  it('limpia filtros y vuelve al reporte general', async () => {
    await renderPage()

    await act(async () => {
      setInputValue(fechaInicio(), '2026-09-01')
      changeSelect(fontaneroSelect(), 'fontanero-1')
      consultarBtn().click()
    })
    await act(async () => {
      await Promise.resolve()
    })

    vi.mocked(actividadesApi.getReportesAdmin).mockClear()
    vi.mocked(actividadesApi.getReportesAdmin).mockResolvedValue(reporte())

    await act(async () => {
      limpiarBtn().click()
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(fechaInicio().value).toBe('')
    expect(fechaFin().value).toBe('')
    expect(fontaneroSelect().value).toBe('')
    expect(tipoSelect().value).toBe('')
    expect(actividadesApi.getReportesAdmin).toHaveBeenCalledWith({})
  })

  it('muestra loading sin empty state mientras consulta', async () => {
    let resolveReport!: (value: ReporteActividadesResponse) => void
    vi.mocked(actividadesApi.getReportesAdmin).mockImplementation(
      () =>
        new Promise<ReporteActividadesResponse>((resolve) => {
          resolveReport = resolve
        }),
    )

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ActividadesAdminReportesPage />
        </MemoryRouter>,
      )
    })

    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
    expect(container.textContent).not.toContain(
      'No se encontraron actividades con los filtros seleccionados.',
    )

    await act(async () => {
      resolveReport(reporte())
      await Promise.resolve()
    })
  })

  it('muestra empty state con total 0', async () => {
    vi.mocked(actividadesApi.getReportesAdmin).mockResolvedValue(EMPTY_REPORTE)
    await renderPage()

    expect(container.textContent).toContain(
      'No se encontraron actividades con los filtros seleccionados.',
    )
    expect(container.querySelector('.gallery-admin__banner--error')).toBeNull()
  })

  it('muestra error comprensible ante fallo 500', async () => {
    vi.mocked(actividadesApi.getReportesAdmin).mockRejectedValue(
      new Error('HTTP 500: Error interno'),
    )
    await renderPage()

    expect(container.textContent).toContain(
      'No fue posible cargar el reporte. Intente nuevamente.',
    )
    expect(container.textContent).not.toContain(
      'No se encontraron actividades con los filtros seleccionados.',
    )
  })

  it('valida rango inválido en cliente sin llamar al backend', async () => {
    await renderPage()
    vi.mocked(actividadesApi.getReportesAdmin).mockClear()

    await act(async () => {
      setInputValue(fechaInicio(), '2026-09-30')
      setInputValue(fechaFin(), '2026-09-01')
      consultarBtn().click()
    })

    expect(container.textContent).toContain(
      'La fecha inicial no puede ser posterior a la fecha final.',
    )
    expect(actividadesApi.getReportesAdmin).not.toHaveBeenCalled()
  })

  it('muestra mensaje de 400 del backend', async () => {
    await renderPage()
    vi.mocked(actividadesApi.getReportesAdmin).mockRejectedValue(
      new Error('HTTP 400: fechaInicio no puede ser posterior a fechaFin'),
    )

    await act(async () => {
      setInputValue(fechaInicio(), '2026-09-01')
      setInputValue(fechaFin(), '2026-09-30')
      consultarBtn().click()
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(container.textContent).toContain(
      'fechaInicio no puede ser posterior a fechaFin',
    )
  })

  it('ante 401 limpia sesión y redirige a login', async () => {
    const clearSpy = vi.spyOn(authStorage, 'clearAccessToken')
    vi.mocked(actividadesApi.getReportesAdmin).mockRejectedValue(
      new Error('HTTP 401: No autenticado'),
    )

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/actividades-fontanero/reportes']}>
          <ActividadesAdminReportesPage />
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(clearSpy).toHaveBeenCalled()
    expect(container.textContent).not.toContain(
      'No se encontraron actividades con los filtros seleccionados.',
    )
  })

  it('ante 403 navega a acceso denegado', async () => {
    vi.mocked(actividadesApi.getReportesAdmin).mockRejectedValue(
      new Error('HTTP 403: Acceso denegado'),
    )

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/actividades-fontanero/reportes']}>
          <ActividadesAdminReportesPage />
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    // Navigate a /unauthorized deja el árbol vacío en MemoryRouter sin ruta destino
    expect(container.textContent).not.toContain('Total de actividades')
    expect(container.textContent).not.toContain(
      'No se encontraron actividades con los filtros seleccionados.',
    )
  })

  it('error de red no se muestra como empty state', async () => {
    vi.mocked(actividadesApi.getReportesAdmin).mockRejectedValue(
      new Error('Failed to fetch'),
    )
    await renderPage()

    expect(container.textContent).toContain(
      'No fue posible conectar con el servidor. Verifique su conexión.',
    )
    expect(container.textContent).not.toContain(
      'No se encontraron actividades con los filtros seleccionados.',
    )
  })

  it('solo lectura: no ejecuta mutaciones de actividades', async () => {
    const registrarSpy = vi.spyOn(actividadesApi, 'registrarActividad')
    const corregirSpy = vi.spyOn(actividadesApi, 'corregirActividad')
    await renderPage()

    expect(registrarSpy).not.toHaveBeenCalled()
    expect(corregirSpy).not.toHaveBeenCalled()
    expect(actividadesApi.getReportesAdmin).toHaveBeenCalled()
    for (const call of vi.mocked(actividadesApi.getReportesAdmin).mock.calls) {
      expect(call.length).toBeLessThanOrEqual(1)
    }
  })
})
