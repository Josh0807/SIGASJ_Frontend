import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ABONADO_ROLE } from '../../modules/auth/utils/internalRoles'
import {
  clearAccessToken,
  getAuthUser,
  isAuthenticated,
} from '../../modules/auth/utils/authStorage'
import { getAdminNavItemsForUser } from '../../modules/auth/utils/adminNavigation'
import { loginAsRole } from '../../test/authTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from './publicRoutes'

const RESTRICTED_ADMIN_PATH = '/admin/abonados'

const sidebarHrefs = (html: string) =>
  [
    ...html.matchAll(
      /<a[^>]*class="[^"]*admin-sidebar__link[^"]*"[^>]*href="(\/admin\/[^"]+)"/g,
    ),
  ].map((match) => match[1])

describe('acceso manual a rutas restringidas (React Router)', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
  })

  it('el menú y el guard de ruta son mecanismos distintos', () => {
    const adminItems = getAdminNavItemsForUser({ role: 'Administradora' })
    const abonadoItems = getAdminNavItemsForUser({ role: ABONADO_ROLE })

    expect(adminItems.some((item) => item.path === RESTRICTED_ADMIN_PATH)).toBe(true)
    expect(abonadoItems).toEqual([])
  })

  it('Caso 1 — Administradora: URL directa de ruta administrativa permitida', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes(RESTRICTED_ADMIN_PATH)

    try {
      expect(app.currentPath()).toBe(RESTRICTED_ADMIN_PATH)
      expect(app.currentPath()).not.toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Gestión de asociados')
      expect(app.container.innerHTML).toContain('admin-layout')
      expect(app.container.innerHTML).not.toContain('Acceso denegado')
    } finally {
      await app.cleanup()
    }
  })

  it('Caso 2 — Abonado: la misma URL no muestra el padrón y va a Acceso denegado', async () => {
    loginAsRole(ABONADO_ROLE)
    const app = await mountAppRoutes(RESTRICTED_ADMIN_PATH)

    try {
      expect(isAuthenticated()).toBe(true)
      expect(getAuthUser()?.role).toBe(ABONADO_ROLE)
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
      expect(app.container.innerHTML).toContain(
        'No tiene permisos para acceder a esta sección.',
      )
      expect(app.container.innerHTML).not.toContain('Iniciar sesión')
      expect(app.container.innerHTML).not.toContain('Gestión de asociados')
      expect(app.container.innerHTML).not.toContain('admin-layout')
      expect(app.container.innerHTML).not.toContain('admin-sidebar')
      expect(sidebarHrefs(app.container.innerHTML)).toEqual([])
    } finally {
      await app.cleanup()
    }
  })

  it('Caso 3 — sin sesión: la misma URL redirige a /login', async () => {
    const app = await mountAppRoutes(RESTRICTED_ADMIN_PATH)

    try {
      expect(isAuthenticated()).toBe(false)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Iniciar sesión')
      expect(app.container.innerHTML).not.toContain('Acceso denegado')
      expect(app.container.innerHTML).not.toContain('Gestión de asociados')
      expect(app.container.innerHTML).not.toContain('admin-layout')
    } finally {
      await app.cleanup()
    }
  })
})
