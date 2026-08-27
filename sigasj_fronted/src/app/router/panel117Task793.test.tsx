import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_HOME_PATH } from './privateRoutes'
import { UNAUTHORIZED_ROUTE_PATH } from './routePaths'
import { clearAccessToken } from '../../modules/auth/utils/authStorage'
import { loginAsRole, loginWithAdminSession } from '../../test/authTestHelpers'
import { hasAdminChrome, mountInteractiveApp } from '../../test/adminPanelTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'

describe('Tarea #793 — rutas inexistentes y accesos no autorizados', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('ruta administrativa inexistente redirige al dashboard sin filtrar datos privados', async () => {
    loginWithAdminSession()
    const app = await mountAppRoutes('/admin/modulo-inexistente')

    try {
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(app.container.innerHTML).toContain('Dashboard administrativo')
      expect(app.container.innerHTML).not.toContain('auth-page')
      expect(hasAdminChrome(app.container.innerHTML)).toBe(true)
    } finally {
      await app.cleanup()
    }
  })

  it('rol Abonado en ruta administrativa ve UnauthorizedPage sin panel ni datos de padrón', async () => {
    loginAsRole('Abonado')
    const app = await mountAppRoutes('/admin/abonados')

    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
      expect(app.container.innerHTML).not.toContain('Gestión de asociados')
      expect(app.container.innerHTML).not.toContain('admin-layout')
      expect(app.container.innerHTML).not.toContain('admin-sidebar')
    } finally {
      await app.cleanup()
    }
  })

  it('desde UnauthorizedPage el usuario puede volver a una ruta válida del panel', async () => {
    loginAsRole('Secretaria')
    const app = await mountInteractiveApp(['/admin/usuarios'])

    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')

      const homeLink = app.container.querySelector(
        `a.auth-page__submit[href="${ADMIN_HOME_PATH}"]`,
      )
      expect(homeLink).not.toBeNull()

      await act(async () => {
        ;(homeLink as HTMLAnchorElement).click()
      })

      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(hasAdminChrome(app.container.innerHTML)).toBe(true)
    } finally {
      await app.cleanup()
    }
  })
})
