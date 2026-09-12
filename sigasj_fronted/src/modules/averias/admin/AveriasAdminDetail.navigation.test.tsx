import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from '../../auth/utils/authStorage'
import { loginWithAdminSession } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import { AVERIAS_ADMIN_PATH, averiasAdminDetailPath } from './averiasAdminPaths'
import { AVERIAS_ADMIN_UI_FIXTURE } from './fixtures/averiasAdminList.fixture'
import { findAveriaDetailFixture } from './fixtures/averiasAdminDetail.fixture'
import * as averiasAdminApi from '../services/averiasAdminApi'

describe('navegación listado ↔ detalle de averías', () => {
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

  it('abre el detalle desde Ver detalle y vuelve al listado', async () => {
    loginWithAdminSession()
    const view = await mountAppRoutes(AVERIAS_ADMIN_PATH)
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    const detail = [...view.container.querySelectorAll('a')].find(
      (anchor) =>
        anchor.textContent === 'Ver detalle' &&
        anchor.getAttribute('href') === averiasAdminDetailPath(1),
    )
    expect(detail).toBeTruthy()

    await act(async () => {
      detail?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(view.currentPath()).toBe(averiasAdminDetailPath(1))
    expect(view.container.querySelector('.admin-layout')).toBeTruthy()
    expect(view.container.textContent).toContain('Detalle de avería')
    expect(view.container.textContent).toContain('AV-2026-0001')
    expect(averiasAdminApi.getAdminAveria).toHaveBeenCalledWith(
      1,
      expect.any(AbortSignal),
    )

    const back = [...view.container.querySelectorAll('a')].find(
      (anchor) => anchor.textContent === 'Volver a averías',
    )
    expect(back?.getAttribute('href')).toBe(AVERIAS_ADMIN_PATH)

    await act(async () => {
      back?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(view.currentPath()).toBe(AVERIAS_ADMIN_PATH)
    expect(view.container.textContent).toContain('Gestión de averías')
    expect(view.container.querySelector('table')).toBeTruthy()

    await view.cleanup()
  })

  it('conserva page, search y estado al ir a detalle y volver', async () => {
    loginWithAdminSession()
    const listPath = `${AVERIAS_ADMIN_PATH}?page=2&search=Juan&estado=RECIBIDA`
    const view = await mountAppRoutes(listPath)
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(averiasAdminApi.getAdminAverias).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        search: 'Juan',
        estado: 'RECIBIDA',
      }),
      expect.any(AbortSignal),
    )

    const detail = [...view.container.querySelectorAll('a')].find(
      (anchor) =>
        anchor.textContent === 'Ver detalle' &&
        anchor.getAttribute('href') === averiasAdminDetailPath(1),
    )
    await act(async () => {
      detail?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    const back = [...view.container.querySelectorAll('a')].find(
      (anchor) => anchor.textContent === 'Volver a averías',
    )
    expect(back?.getAttribute('href')).toBe(listPath)

    await act(async () => {
      back?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(view.currentPath()).toBe(AVERIAS_ADMIN_PATH)
    expect(
      (view.container.querySelector('#averias-admin-buscar') as HTMLInputElement)
        .value,
    ).toBe('Juan')
    expect(
      (view.container.querySelector('#averias-admin-estado') as HTMLSelectElement)
        .value,
    ).toBe('RECIBIDA')

    await view.cleanup()
  })
})
