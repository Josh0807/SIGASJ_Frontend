import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { clearAccessToken } from '../../auth/utils/authStorage'
import { loginAsRole, loginWithAdminSession } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import * as averiasAdminApi from '../services/averiasAdminApi'
import AveriasReporteResumenPage from './AveriasReporteResumenPage'
import { AVERIAS_ADMIN_REPORTE_PATH } from './averiasAdminPaths'
import {
  indicadoresReporte,
  sumaEstadosReporte,
} from './averiasReporteResumen'
import {
  AVERIAS_REPORTE_EMPTY_MESSAGE,
  AVERIAS_REPORTE_LOAD_ERROR,
  AVERIAS_REPORTE_LOADING_MESSAGE,
  AVERIAS_REPORTE_RANGE_ERROR,
  type AveriasReporteResumen,
} from './types'

const adminDir = dirname(fileURLToPath(import.meta.url))
const styles = readFileSync(join(adminDir, '../../../index.css'), 'utf8')

const AGOSTO: AveriasReporteResumen = {
  fechaDesde: '2026-08-01',
  fechaHasta: '2026-08-31',
  total: 42,
  porEstado: {
    RECIBIDA: 3,
    EN_REVISION: 0,
    ASIGNADA: 5,
    PENDIENTE: 4,
    EN_ATENCION: 6,
    RESUELTA: 24,
    CANCELADA: 0,
  },
  otros: 0,
}

const CEROS: AveriasReporteResumen = {
  fechaDesde: '2026-01-01',
  fechaHasta: '2026-01-31',
  total: 0,
  porEstado: {
    RECIBIDA: 0,
    EN_REVISION: 0,
    ASIGNADA: 0,
    PENDIENTE: 0,
    EN_ATENCION: 0,
    RESUELTA: 0,
    CANCELADA: 0,
  },
  otros: 0,
}

describe('indicadores del resumen', () => {
  it('el total coincide con la suma de los estados mostrados', () => {
    const visibles = indicadoresReporte(AGOSTO).filter((item) => item.id !== 'total')
    expect(visibles.map((item) => item.titulo)).toEqual([
      'Recibidas',
      'Asignadas',
      'Pendientes de atención',
      'En atención',
      'Resueltas',
    ])
    expect(visibles.reduce((sum, item) => sum + item.cantidad, 0)).toBe(AGOSTO.total)
    expect(sumaEstadosReporte(AGOSTO)).toBe(AGOSTO.total)
    expect(indicadoresReporte(AGOSTO).some((item) => item.titulo === 'En proceso')).toBe(
      false,
    )
  })

  it('muestra Canceladas cuando hay registros en ese estado', () => {
    const conCanceladas: AveriasReporteResumen = {
      ...AGOSTO,
      total: 44,
      porEstado: { ...AGOSTO.porEstado, CANCELADA: 2 },
    }
    const visibles = indicadoresReporte(conCanceladas)
    expect(visibles.find((item) => item.id === 'CANCELADA')?.cantidad).toBe(2)
    expect(visibles.filter((item) => item.id !== 'total').reduce((sum, item) => sum + item.cantidad, 0)).toBe(
      44,
    )
  })
})

describe('AveriasReporteResumenPage', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.spyOn(averiasAdminApi, 'getAdminAveriasReporteResumen').mockResolvedValue(AGOSTO)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  const flush = async () => {
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
  }

  const renderPage = async (
    props: Parameters<typeof AveriasReporteResumenPage>[0] = {},
    entry = AVERIAS_ADMIN_REPORTE_PATH,
  ) => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[entry]}>
          <AveriasReporteResumenPage {...props} />
        </MemoryRouter>,
      )
    })
    await flush()
  }

  it('muestra el rango y las cantidades que devuelve el Backend', async () => {
    await renderPage({ resumen: AGOSTO })
    expect(container.querySelector('h1')?.textContent).toBe('Resumen de averías')
    expect(container.textContent).toContain('01/08/2026 - 31/08/2026')
    expect(container.textContent).toContain('Total registradas')
    expect(container.textContent).toContain('42')
    expect(container.textContent).toContain('Recibidas')
    expect(container.textContent).toContain('3')
    expect(container.textContent).toContain('Asignadas')
    expect(container.textContent).toContain('5')
    expect(container.textContent).toContain('Pendientes de atención')
    expect(container.textContent).toContain('4')
    expect(container.textContent).toContain('En atención')
    expect(container.textContent).toContain('6')
    expect(container.textContent).toContain('Resueltas')
    expect(container.textContent).toContain('24')
    expect(container.textContent).not.toContain('En proceso')
    expect(container.textContent).not.toContain('Canceladas')
    expect(container.querySelector('.admin-dashboard__indicators-grid')).toBeTruthy()
  })

  it('consulta el resumen al cambiar el rango', async () => {
    await renderPage(
      {},
      '/admin/averias/reportes/resumen?fechaDesde=2026-08-01&fechaHasta=2026-08-31',
    )
    expect(averiasAdminApi.getAdminAveriasReporteResumen).toHaveBeenCalledWith(
      { fechaDesde: '2026-08-01', fechaHasta: '2026-08-31' },
      expect.any(AbortSignal),
    )
    expect(container.textContent).toContain('42')

    const hasta = container.querySelector('#averias-reporte-hasta') as HTMLInputElement
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
        hasta,
        '2026-08-15',
      )
      hasta.dispatchEvent(new Event('input', { bubbles: true }))
      hasta.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await flush()

    expect(averiasAdminApi.getAdminAveriasReporteResumen).toHaveBeenCalledWith(
      { fechaDesde: '2026-08-01', fechaHasta: '2026-08-15' },
      expect.any(AbortSignal),
    )
  })

  it('muestra ceros, carga, error y un rango inválido', async () => {
    await renderPage({ resumen: CEROS })
    expect(container.textContent).toContain(AVERIAS_REPORTE_EMPTY_MESSAGE)
    expect(container.textContent).toContain('Total registradas')
    expect(container.querySelector('.indicator-card__value')?.textContent).toBe('0')

    await renderPage({ loading: true })
    expect(container.textContent).toContain(AVERIAS_REPORTE_LOADING_MESSAGE)
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
    expect(container.textContent).not.toContain('42')

    await renderPage({ error: true })
    expect(container.textContent).toContain(AVERIAS_REPORTE_LOAD_ERROR)
    expect(container.textContent).not.toContain('QueryFailedError')
  })

  it('no consulta el resumen si el rango está invertido', async () => {
    vi.mocked(averiasAdminApi.getAdminAveriasReporteResumen).mockClear()
    await renderPage(
      {},
      '/admin/averias/reportes/resumen?fechaDesde=2026-08-31&fechaHasta=2026-08-01',
    )
    expect(container.textContent).toContain(AVERIAS_REPORTE_RANGE_ERROR)
    expect(averiasAdminApi.getAdminAveriasReporteResumen).not.toHaveBeenCalled()
  })

  it('usa la grilla adaptable del panel en tableta y celular', () => {
    expect(styles).toContain('.admin-dashboard__indicators-grid')
    expect(styles).toMatch(
      /@media \(min-width: 761px\) and \(max-width: 1199px\)[\s\S]*\.admin-dashboard__indicators-grid/,
    )
    expect(styles).toMatch(
      /@media \(max-width: 760px\)[\s\S]*\.admin-dashboard__indicators-grid/,
    )
    expect(styles).toContain('.averias-reporte__rango')
  })
})

describe('GET /admin/averias/reportes/resumen — protección de ruta', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.spyOn(averiasAdminApi, 'getAdminAveriasReporteResumen').mockResolvedValue(AGOSTO)
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

  it('muestra el resumen dentro del panel para Administradora y lo niega sin sesión o a Fontanero', async () => {
    const anon = await mountAppRoutes(AVERIAS_ADMIN_REPORTE_PATH)
    expect(anon.currentPath()).toBe(LOGIN_ROUTE_PATH)
    await anon.cleanup()

    loginWithAdminSession()
    const admin = await mountAppRoutes(AVERIAS_ADMIN_REPORTE_PATH)
    await flush()
    expect(admin.currentPath()).toBe(AVERIAS_ADMIN_REPORTE_PATH)
    expect(admin.container.querySelector('.admin-layout')).toBeTruthy()
    expect(admin.container.textContent).toContain('Resumen de averías')
    expect(admin.container.textContent).toContain('42')
    await admin.cleanup()

    clearAccessToken()
    loginAsRole('Fontanero')
    const fontanero = await mountAppRoutes(AVERIAS_ADMIN_REPORTE_PATH)
    await flush()
    expect(fontanero.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    expect(fontanero.container.textContent).not.toContain('42')
    await fontanero.cleanup()
  })

  it('permite el resumen a Secretaria y lo niega a Abonado', async () => {
    loginAsRole('Secretaria')
    const secretaria = await mountAppRoutes(AVERIAS_ADMIN_REPORTE_PATH)
    await flush()
    expect(secretaria.currentPath()).toBe(AVERIAS_ADMIN_REPORTE_PATH)
    expect(secretaria.container.textContent).toContain('Resumen de averías')
    await secretaria.cleanup()

    clearAccessToken()
    loginAsRole('Abonado')
    const abonado = await mountAppRoutes(AVERIAS_ADMIN_REPORTE_PATH)
    await flush()
    expect(abonado.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    expect(abonado.container.textContent).not.toContain('42')
    await abonado.cleanup()
  })
})
