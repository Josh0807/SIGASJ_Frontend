import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAccessToken,
} from '../../auth/utils/authStorage'
import { loginAsRole, loginWithAdminSession } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/publicRoutes'
import { AVERIAS_ADMIN_PATH, averiasAdminDetailPath } from './averiasAdminPaths'

const flush = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}
import { AVERIAS_ADMIN_UI_FIXTURE } from './fixtures/averiasAdminList.fixture'
import { findAveriaDetailFixture } from './fixtures/averiasAdminDetail.fixture'
import * as averiasAdminApi from '../services/averiasAdminApi'

describe('GET /admin/averias — protección de ruta', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.spyOn(averiasAdminApi, 'getAdminAverias').mockResolvedValue(
      AVERIAS_ADMIN_UI_FIXTURE,
    )
    vi.spyOn(averiasAdminApi, 'getAdminAveria').mockImplementation(async (id) => {
      const found = findAveriaDetailFixture(id)
      if (!found) {
        throw new Error('HTTP 404: No se encontró la avería solicitada.')
      }
      return found
    })
  })

  afterEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  it('redirige a login sin sesión', async () => {
    const view = await mountAppRoutes(AVERIAS_ADMIN_PATH)
    expect(view.currentPath()).toBe(LOGIN_ROUTE_PATH)
    expect(view.container.textContent).not.toContain('Listado de averías')
    await view.cleanup()
  })

  it('muestra la pantalla dentro de AdminLayout para Administradora', async () => {
    loginWithAdminSession()
    const view = await mountAppRoutes(AVERIAS_ADMIN_PATH)
    await flush()
    expect(view.currentPath()).toBe(AVERIAS_ADMIN_PATH)
    expect(view.container.querySelector('.admin-layout')).toBeTruthy()
    expect(view.container.textContent).toContain('Gestión de averías')
    expect(view.container.querySelector('table')).toBeTruthy()
    expect(
      view.container
        .querySelector('.admin-sidebar__link[href="/admin/averias"]')
        ?.className,
    ).toContain('admin-sidebar__link--active')
    await view.cleanup()
  })

  it('permite a Secretaria consultar el listado', async () => {
    loginAsRole('Secretaria')
    const view = await mountAppRoutes(AVERIAS_ADMIN_PATH)
    await flush()
    expect(view.currentPath()).toBe(AVERIAS_ADMIN_PATH)
    expect(view.container.textContent).toContain('Gestión de averías')
    await view.cleanup()
  })

  it('deniega a Fontanero el listado administrativo, alineado con el Backend', async () => {
    loginAsRole('Fontanero')
    const view = await mountAppRoutes(AVERIAS_ADMIN_PATH)
    await flush()
    expect(view.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    expect(view.container.textContent).not.toContain('AV-2026-0001')
    await view.cleanup()
  })

  it('trata 401 de Backend como sesión vencida', async () => {
    loginWithAdminSession()
    vi.mocked(averiasAdminApi.getAdminAverias).mockRejectedValue(
      new Error('HTTP 401: Unauthorized'),
    )
    const view = await mountAppRoutes(AVERIAS_ADMIN_PATH)
    await flush()
    expect(view.currentPath()).toBe(LOGIN_ROUTE_PATH)
    expect(view.container.textContent).not.toContain('AV-2026-0001')
    await view.cleanup()
  })

  it('trata 403 de Backend como acceso denegado y no cierra sesión', async () => {
    loginWithAdminSession()
    vi.mocked(averiasAdminApi.getAdminAverias).mockRejectedValue(
      new Error('HTTP 403: Acceso denegado'),
    )
    const view = await mountAppRoutes(AVERIAS_ADMIN_PATH)
    await flush()
    expect(view.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    expect(view.container.textContent).not.toContain('AV-2026-0001')
    await view.cleanup()
  })

  it('deniega el panel a Abonado', async () => {
    loginAsRole('Abonado')
    const view = await mountAppRoutes(AVERIAS_ADMIN_PATH)
    expect(view.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    expect(view.container.textContent).not.toContain('AV-2026-0001')
    await view.cleanup()
  })
})

describe('GET /admin/averias/:id — protección de ruta', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.spyOn(averiasAdminApi, 'getAdminAverias').mockResolvedValue(
      AVERIAS_ADMIN_UI_FIXTURE,
    )
    vi.spyOn(averiasAdminApi, 'getAdminAveria').mockImplementation(async (id) => {
      const found = findAveriaDetailFixture(id)
      if (!found) {
        throw new Error('HTTP 404: No se encontró la avería solicitada.')
      }
      return found
    })
  })

  afterEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  it('redirige a login sin sesión', async () => {
    const view = await mountAppRoutes(averiasAdminDetailPath(1))
    expect(view.currentPath()).toBe(LOGIN_ROUTE_PATH)
    expect(view.container.textContent).not.toContain('Detalle de avería')
    await view.cleanup()
  })

  it('muestra el detalle dentro de AdminLayout para Administradora', async () => {
    loginWithAdminSession()
    const view = await mountAppRoutes(averiasAdminDetailPath(1))
    await flush()
    expect(view.currentPath()).toBe(averiasAdminDetailPath(1))
    expect(view.container.querySelector('.admin-layout')).toBeTruthy()
    expect(view.container.textContent).toContain('Detalle de avería')
    expect(view.container.textContent).toContain('AV-2026-0001')
    await view.cleanup()
  })

  it('permite a Secretaria consultar el detalle', async () => {
    loginAsRole('Secretaria')
    const view = await mountAppRoutes(averiasAdminDetailPath(2))
    await flush()
    expect(view.currentPath()).toBe(averiasAdminDetailPath(2))
    expect(view.container.textContent).toContain('Detalle de avería')
    await view.cleanup()
  })

  it('trata 401 del detalle como sesión vencida', async () => {
    loginWithAdminSession()
    vi.mocked(averiasAdminApi.getAdminAveria).mockRejectedValue(
      new Error('HTTP 401: Unauthorized'),
    )
    const view = await mountAppRoutes(averiasAdminDetailPath(1))
    await flush()
    expect(view.currentPath()).toBe(LOGIN_ROUTE_PATH)
    expect(view.container.textContent).not.toContain('AV-2026-0001')
    await view.cleanup()
  })

  it('trata 403 del detalle como acceso denegado y no cierra sesión', async () => {
    loginWithAdminSession()
    vi.mocked(averiasAdminApi.getAdminAveria).mockRejectedValue(
      new Error('HTTP 403: Acceso denegado'),
    )
    const view = await mountAppRoutes(averiasAdminDetailPath(1))
    await flush()
    expect(view.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    expect(view.container.textContent).not.toContain('AV-2026-0001')
    await view.cleanup()
  })

  it('deniega el detalle a Abonado', async () => {
    loginAsRole('Abonado')
    const view = await mountAppRoutes(averiasAdminDetailPath(1))
    expect(view.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    expect(view.container.textContent).not.toContain('AV-2026-0001')
    await view.cleanup()
  })
})
