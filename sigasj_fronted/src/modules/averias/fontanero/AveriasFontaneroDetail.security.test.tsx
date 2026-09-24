import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from '../../auth/utils/authStorage'
import {
  loginAsRole,
  loginWithAdminSession,
} from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/publicRoutes'
import * as averiasFontaneroApi from '../services/averiasFontaneroApi'
import * as materialesApi from '../../inventario/materialesApi'
import * as solicitudesMaterialesApi from '../../inventario/solicitudes-materiales/solicitudesMaterialesApi'
import * as salidasApi from '../../inventario/salidas/salidasApi'
import {
  FONTANERO_AVERIAS_PATH,
  FONTANERO_AVERIAS_TITLE as LIST_TITLE,
} from './averiasFontaneroPaths'
import { findFontaneroAveriaFixture } from './fixtures/averiasFontaneroDetail.fixture'
import { AVERIAS_FONTANERO_DETAIL_FORBIDDEN } from './types'

const flush = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe('GET /fontanero/averias — protección de ruta', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.spyOn(averiasFontaneroApi, 'getFontaneroAverias').mockResolvedValue({
      data: [],
    })
    vi.spyOn(averiasFontaneroApi, 'getFontaneroAveria').mockImplementation(
      async (id) => {
        const found = findFontaneroAveriaFixture(id)
        if (!found) {
          throw new Error('HTTP 404: No se encontró la avería solicitada.')
        }
        return found
      },
    )
    vi.spyOn(materialesApi, 'getMateriales').mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    })
    vi.spyOn(
      solicitudesMaterialesApi,
      'getMisSolicitudesMateriales',
    ).mockResolvedValue([])
    vi.spyOn(salidasApi, 'getSalidasPorAveria').mockResolvedValue([])
  })

  afterEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  it('redirige a login sin sesión', async () => {
    const view = await mountAppRoutes(`${FONTANERO_AVERIAS_PATH}/25`)
    expect(view.currentPath()).toBe(LOGIN_ROUTE_PATH)
    expect(view.container.textContent).not.toContain('AV-2026-0025')
    await view.cleanup()
  })

  it('permite al Fontanero autenticado ver su detalle', async () => {
    loginAsRole('Fontanero', '7')
    const view = await mountAppRoutes(`${FONTANERO_AVERIAS_PATH}/25`)
    await flush()
    expect(view.currentPath()).toBe(`${FONTANERO_AVERIAS_PATH}/25`)
    expect(view.container.querySelector('.admin-layout')).toBeTruthy()
    expect(view.container.textContent).toContain('AV-2026-0025')
    expect(
      view.container.querySelector(
        `.admin-sidebar__link[href="${FONTANERO_AVERIAS_PATH}"]`,
      )?.className,
    ).toContain('admin-sidebar__link--active')
    await view.cleanup()
  })

  it('deniega a Administradora la ruta del Fontanero', async () => {
    loginWithAdminSession()
    const view = await mountAppRoutes(`${FONTANERO_AVERIAS_PATH}/25`)
    await flush()
    expect(view.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    expect(view.container.textContent).not.toContain('AV-2026-0025')
    await view.cleanup()
  })

  it('deniega a Secretaria y Abonado', async () => {
    loginAsRole('Secretaria')
    const secretaria = await mountAppRoutes(`${FONTANERO_AVERIAS_PATH}/25`)
    await flush()
    expect(secretaria.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    await secretaria.cleanup()

    loginAsRole('Abonado')
    const abonado = await mountAppRoutes(`${FONTANERO_AVERIAS_PATH}/25`)
    await flush()
    expect(abonado.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    await abonado.cleanup()
  })

  it('401 cierra sesión y vuelve a login', async () => {
    loginAsRole('Fontanero', '7')
    vi.spyOn(averiasFontaneroApi, 'getFontaneroAveria').mockRejectedValue(
      new Error('HTTP 401: No autenticado'),
    )
    const view = await mountAppRoutes(`${FONTANERO_AVERIAS_PATH}/25`)
    await flush()
    expect(view.currentPath()).toBe(LOGIN_ROUTE_PATH)
    await view.cleanup()
  })

  it('403 de avería ajena mantiene la sesión y no muestra el reporte', async () => {
    loginAsRole('Fontanero', '7')
    vi.spyOn(averiasFontaneroApi, 'getFontaneroAveria').mockRejectedValue(
      new Error('HTTP 403: No tiene autorización para consultar esta avería.'),
    )
    const view = await mountAppRoutes(`${FONTANERO_AVERIAS_PATH}/25`)
    await flush()
    expect(view.currentPath()).toBe(`${FONTANERO_AVERIAS_PATH}/25`)
    expect(view.container.textContent).toContain(AVERIAS_FONTANERO_DETAIL_FORBIDDEN)
    expect(view.container.textContent).not.toContain('AV-2026-0025')
    await view.cleanup()
  })

  it('el listado de destino existe para volver', async () => {
    loginAsRole('Fontanero', '7')
    const view = await mountAppRoutes(FONTANERO_AVERIAS_PATH)
    await flush()
    expect(view.currentPath()).toBe(FONTANERO_AVERIAS_PATH)
    expect(view.container.textContent).toContain(LIST_TITLE)
    await view.cleanup()
  })
})
