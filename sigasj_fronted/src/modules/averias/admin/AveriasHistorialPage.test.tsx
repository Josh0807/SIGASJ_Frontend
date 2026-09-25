import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { clearAccessToken } from '../../auth/utils/authStorage'
import { loginAsRole, loginWithAdminSession } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import * as salidasApi from '../../inventario/salidas/salidasApi'
import * as solicitudesMaterialesApi from '../../inventario/solicitudes-materiales/solicitudesMaterialesApi'
import * as averiasAdminApi from '../services/averiasAdminApi'
import AveriasAdminDetailPage from './AveriasAdminDetailPage'
import AveriasHistorialPage from './AveriasHistorialPage'
import { AVERIAS_ADMIN_HISTORIAL_PATH } from './averiasAdminPaths'
import { findAveriaDetailFixture } from './fixtures/averiasAdminDetail.fixture'
import {
  AVERIAS_HISTORIAL_FIXTURE,
  AVERIAS_HISTORIAL_ITEMS,
} from './fixtures/averiasHistorial.fixture'
import { formatAveriaAdminDateTime } from './formatAveriaAdminDate'
import {
  AVERIA_NO_PRIORITY_LABEL,
  AVERIA_UNASSIGNED_LABEL,
  AVERIA_UNAVAILABLE_LABEL,
  AVERIA_UNCLASSIFIED_LABEL,
  AVERIAS_HISTORIAL_EMPTY_MESSAGE,
  AVERIAS_HISTORIAL_LOAD_ERROR,
  AVERIAS_HISTORIAL_LOADING_MESSAGE,
  AVERIAS_HISTORIAL_RANGE_ERROR,
} from './types'

const adminDir = dirname(fileURLToPath(import.meta.url))
const styles = readFileSync(join(adminDir, '../../../index.css'), 'utf8')

describe('AveriasHistorialPage', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.spyOn(averiasAdminApi, 'getAdminAveriasHistorial').mockResolvedValue(
      AVERIAS_HISTORIAL_FIXTURE,
    )
    vi.spyOn(averiasAdminApi, 'getAdminAveriaFontaneros').mockResolvedValue({
      data: [{ id: 5, nombre: 'Luis Campos' }],
    })
    vi.spyOn(averiasAdminApi, 'getAdminAveriaEventosHistorial').mockResolvedValue({
      id: 1,
      codigoSeguimiento: 'AV-2026-0001',
      data: [],
    })
    vi.spyOn(averiasAdminApi, 'getAdminAveria').mockImplementation(async (id) => {
      const found = findAveriaDetailFixture(id)
      if (!found) {
        throw new Error('HTTP 404')
      }
      return found
    })
    vi.spyOn(solicitudesMaterialesApi, 'getSolicitudesMaterialesAdmin').mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
    })
    vi.spyOn(salidasApi, 'getSalidasPorAveria').mockResolvedValue([])
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const flush = async () => {
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
  }

  const renderPage = async (
    props: Parameters<typeof AveriasHistorialPage>[0] = {},
    entry = AVERIAS_ADMIN_HISTORIAL_PATH,
  ) => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[entry]}>
          <AveriasHistorialPage {...props} />
        </MemoryRouter>,
      )
    })
    await flush()
  }

  const setInputValue = (input: HTMLInputElement, value: string) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
      input,
      value,
    )
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }

  it('muestra actuales y resueltas, sin acciones de edición', async () => {
    await renderPage({
      items: AVERIAS_HISTORIAL_ITEMS,
      fontaneros: [{ id: 5, nombre: 'Luis Campos' }],
    })

    expect(container.querySelector('h1')?.textContent).toBe('Historial de averías')
    expect(container.textContent).toContain('AV-2026-0001')
    expect(container.textContent).toContain('AV-2026-0005')
    expect(container.textContent).toContain('San Juan')
    expect(container.textContent).toContain('Palmares')
    expect(container.textContent).toContain('Recibida')
    expect(container.textContent).toContain('Asignada')
    expect(container.textContent).toContain('Pendiente de atención')
    expect(container.textContent).toContain('En atención')
    expect(container.textContent).toContain('Resuelta')
    expect(container.textContent).toContain('Tubo madre')
    expect(container.textContent).toContain('Tubo medidor')
    expect(container.textContent).toContain('Alta')
    expect(container.textContent).toContain('Luis Campos')
    expect(container.textContent).toContain(AVERIA_UNCLASSIFIED_LABEL)
    expect(container.textContent).toContain(AVERIA_NO_PRIORITY_LABEL)
    expect(container.textContent).toContain(AVERIA_UNASSIGNED_LABEL)
    expect(container.textContent).toContain(AVERIA_UNAVAILABLE_LABEL)
    expect(container.textContent).toContain(
      formatAveriaAdminDateTime('2026-08-01T16:00:00.000Z'),
    )
    expect(container.textContent).not.toContain('Reportada')
    expect(container.textContent).not.toContain('En proceso')
    expect(container.textContent).not.toContain('Asignar')
    expect(container.textContent).not.toContain('Clasificar')
    expect(container.textContent).not.toContain('Guardar')
    expect(container.querySelector('.averias-admin__table')).toBeTruthy()
    expect(container.querySelector('.averias-admin__cards')).toBeTruthy()

    const detail = [...container.querySelectorAll('a')].find(
      (anchor) => anchor.textContent === 'Ver detalle',
    )
    expect(detail?.getAttribute('href')).toBe('/admin/averias/1')
  })

  it('abre el detalle administrativo y puede volver al historial filtrado', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter
          initialEntries={['/admin/averias/historial?estado=RESUELTA&page=2']}
        >
          <Routes>
            <Route path="/admin/averias/historial" element={<AveriasHistorialPage />} />
            <Route path="/admin/averias/:id" element={<AveriasAdminDetailPage />} />
          </Routes>
        </MemoryRouter>,
      )
    })
    await flush()

    const detail = [...container.querySelectorAll('a')].find(
      (anchor) =>
        anchor.textContent === 'Ver detalle' &&
        anchor.getAttribute('href') === '/admin/averias/5',
    )
    await act(async () => {
      detail?.click()
    })
    await flush()

    const back = [...container.querySelectorAll('a')].find(
      (anchor) => anchor.textContent === 'Volver al historial',
    )
    expect(back?.getAttribute('href')).toBe(
      '/admin/averias/historial?estado=RESUELTA&page=2',
    )
  })

  it('consulta el historial al entrar y restaura filtros desde la URL', async () => {
    await renderPage(
      {},
      '/admin/averias/historial?page=2&estado=RESUELTA&prioridad=ALTA&tipo=TUBO_MEDIDOR&fontaneroId=5&sector=Palmares&fechaDesde=2026-08-01&fechaHasta=2026-08-31&codigoSeguimiento=AV-2026-0005',
    )

    expect(averiasAdminApi.getAdminAveriasHistorial).toHaveBeenCalledWith(
      {
        page: 2,
        limit: 20,
        codigoSeguimiento: 'AV-2026-0005',
        estado: 'RESUELTA',
        prioridad: 'ALTA',
        tipo: 'TUBO_MEDIDOR',
        fontaneroId: 5,
        sector: 'Palmares',
        fechaDesde: '2026-08-01',
        fechaHasta: '2026-08-31',
      },
      expect.any(AbortSignal),
    )
    expect(
      (container.querySelector('#averias-historial-estado') as HTMLSelectElement).value,
    ).toBe('RESUELTA')
    expect(
      (container.querySelector('#averias-historial-fontanero') as HTMLSelectElement)
        .value,
    ).toBe('5')
  })

  it('combina filtros, los mantiene al paginar y permite limpiarlos', async () => {
    vi.mocked(averiasAdminApi.getAdminAveriasHistorial).mockResolvedValue({
      ...AVERIAS_HISTORIAL_FIXTURE,
      total: 40,
      totalPages: 2,
    })
    await renderPage()
    vi.mocked(averiasAdminApi.getAdminAveriasHistorial).mockClear()

    const estado = container.querySelector(
      '#averias-historial-estado',
    ) as HTMLSelectElement
    const prioridad = container.querySelector(
      '#averias-historial-prioridad',
    ) as HTMLSelectElement
    await act(async () => {
      estado.value = 'RESUELTA'
      estado.dispatchEvent(new Event('change', { bubbles: true }))
      prioridad.value = 'ALTA'
      prioridad.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await flush()

    expect(averiasAdminApi.getAdminAveriasHistorial).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        estado: 'RESUELTA',
        prioridad: 'ALTA',
      }),
      expect.any(AbortSignal),
    )

    const next = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Siguiente',
    )
    await act(async () => {
      next?.click()
    })
    await flush()

    expect(container.textContent).toContain('Página 2 de 2')
    expect(
      (container.querySelector('#averias-historial-estado') as HTMLSelectElement).value,
    ).toBe('RESUELTA')
    expect(averiasAdminApi.getAdminAveriasHistorial).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        estado: 'RESUELTA',
        prioridad: 'ALTA',
      }),
      expect.any(AbortSignal),
    )

    const clear = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Limpiar filtros',
    )
    await act(async () => {
      clear?.click()
    })
    await flush()

    expect(
      (container.querySelector('#averias-historial-estado') as HTMLSelectElement).value,
    ).toBe('')
    expect(averiasAdminApi.getAdminAveriasHistorial).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        estado: undefined,
        prioridad: undefined,
      }),
      expect.any(AbortSignal),
    )
  })

  it('busca por código después del debounce', async () => {
    vi.useFakeTimers()
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[AVERIAS_ADMIN_HISTORIAL_PATH]}>
          <AveriasHistorialPage />
        </MemoryRouter>,
      )
    })
    await flush()
    vi.mocked(averiasAdminApi.getAdminAveriasHistorial).mockClear()

    const input = container.querySelector(
      '#averias-historial-codigo',
    ) as HTMLInputElement
    await act(async () => {
      setInputValue(input, 'AV-2026-0005')
    })
    expect(averiasAdminApi.getAdminAveriasHistorial).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    await flush()

    expect(averiasAdminApi.getAdminAveriasHistorial).toHaveBeenCalledWith(
      expect.objectContaining({ codigoSeguimiento: 'AV-2026-0005', page: 1 }),
      expect.any(AbortSignal),
    )
  })

  it('muestra carga, vacío, error y rango inválido', async () => {
    await renderPage({ loading: true, items: [] })
    expect(container.textContent).toContain(AVERIAS_HISTORIAL_LOADING_MESSAGE)
    expect(container.querySelector('table')).toBeNull()

    await renderPage({ items: [] })
    expect(container.textContent).toContain(AVERIAS_HISTORIAL_EMPTY_MESSAGE)

    await renderPage({ items: [], error: true })
    expect(container.textContent).toContain(AVERIAS_HISTORIAL_LOAD_ERROR)
    expect(container.textContent).not.toContain('QueryFailedError')
  })

  it('no consulta el historial si el rango de fechas está invertido', async () => {
    vi.mocked(averiasAdminApi.getAdminAveriasHistorial).mockClear()
    await renderPage(
      {},
      '/admin/averias/historial?fechaDesde=2026-09-12&fechaHasta=2026-08-01',
    )
    expect(container.textContent).toContain(AVERIAS_HISTORIAL_RANGE_ERROR)
    expect(averiasAdminApi.getAdminAveriasHistorial).not.toHaveBeenCalled()
  })

  it('reutiliza la adaptación de computadora, tableta y celular del panel', () => {
    expect(styles).toContain('.averias-admin__table')
    expect(styles).toContain('.averias-admin__cards')
    expect(styles).toMatch(
      /@media \(max-width: 1199px\)[\s\S]*\.averias-admin \.gallery-admin__filters/,
    )
    expect(styles).toMatch(/@media \(max-width: 760px\)[\s\S]*\.averias-admin__table/)
    expect(styles).toMatch(/@media \(max-width: 760px\)[\s\S]*\.averias-admin__cards/)
  })
})

describe('GET /admin/averias/historial — protección de ruta', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.spyOn(averiasAdminApi, 'getAdminAveriasHistorial').mockResolvedValue(
      AVERIAS_HISTORIAL_FIXTURE,
    )
    vi.spyOn(averiasAdminApi, 'getAdminAveriaFontaneros').mockResolvedValue({
      data: [{ id: 5, nombre: 'Luis Campos' }],
    })
  })

  afterEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  const flush = async () => {
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
  }

  it('redirige a login sin sesión', async () => {
    const view = await mountAppRoutes(AVERIAS_ADMIN_HISTORIAL_PATH)
    expect(view.currentPath()).toBe(LOGIN_ROUTE_PATH)
    expect(view.container.textContent).not.toContain('Historial de averías')
    await view.cleanup()
  })

  it('muestra el historial dentro del panel para Administradora y Secretaria', async () => {
    loginWithAdminSession()
    const admin = await mountAppRoutes(AVERIAS_ADMIN_HISTORIAL_PATH)
    await flush()
    expect(admin.currentPath()).toBe(AVERIAS_ADMIN_HISTORIAL_PATH)
    expect(admin.container.querySelector('.admin-layout')).toBeTruthy()
    expect(admin.container.textContent).toContain('Historial de averías')
    expect(
      admin.container
        .querySelector('.admin-sidebar__link[href="/admin/averias"]')
        ?.className,
    ).toContain('admin-sidebar__link--active')
    await admin.cleanup()

    clearAccessToken()
    loginAsRole('Secretaria')
    const secretaria = await mountAppRoutes(AVERIAS_ADMIN_HISTORIAL_PATH)
    await flush()
    expect(secretaria.currentPath()).toBe(AVERIAS_ADMIN_HISTORIAL_PATH)
    expect(secretaria.container.textContent).toContain('Historial de averías')
    await secretaria.cleanup()
  })

  it('deniega el historial a Fontanero y Abonado', async () => {
    for (const role of ['Fontanero', 'Abonado'] as const) {
      clearAccessToken()
      loginAsRole(role)
      const view = await mountAppRoutes(AVERIAS_ADMIN_HISTORIAL_PATH)
      await flush()
      expect(view.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(view.container.textContent).not.toContain('AV-2026-0001')
      await view.cleanup()
    }
  })
})
