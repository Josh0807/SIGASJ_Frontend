import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ADMIN_HOME_PATH,
} from './privateRoutes'
import { UNAUTHORIZED_ROUTE_PATH } from './routePaths'
import {
  clearAccessToken,
  getAccessToken,
  isAuthenticated,
} from '../../modules/auth/utils/authStorage'
import { loginAsRole, loginWithAdminSession } from '../../test/authTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'
import {
  EXPECTED_BLOCKED_PATHS,
  EXPECTED_NAV_PATHS,
  INTERNAL_ROLES_UNDER_TEST,
} from '../../test/roleAccessFixtures'
import {
  assertBlockedAdminAccess,
  hasAdminChrome,
  logoutFromPanel,
  mountInteractiveApp,
  readHeaderUser,
  submitLoginForm,
  LOGIN_ROUTE_PATH,
} from '../../test/adminPanelTestHelpers'

/**
 * Suite de aceptación QA — panel administrativo SIGASJ.
 * Cubre las 4 tareas asignadas (autenticación, rutas privadas, roles, navegación).
 */
describe('QA — Tarea 1: sesión válida, panel y dashboard', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('permite ingresar, muestra layout, nombre/rol, dashboard y conserva sesión al recargar', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: 'token-admin-test',
          user: { id: '1', email: 'admin@asadasanjuan.cr', role: 'Administradora' },
        }),
      }),
    )
    const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

    try {
      expect(isAuthenticated()).toBe(false)
      await submitLoginForm(app.container)

      expect(isAuthenticated()).toBe(true)
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(hasAdminChrome(app.container.innerHTML)).toBe(true)
      expect(app.container.innerHTML).toContain('Dashboard administrativo')

      const user = readHeaderUser(app.container)
      expect(user.name).toContain('Usuario')
      expect(user.role).toBe('Administradora')

      await app.cleanup()

      const reloaded = await mountAppRoutes(ADMIN_HOME_PATH)
      try {
        expect(isAuthenticated()).toBe(true)
        expect(reloaded.currentPath()).toBe(ADMIN_HOME_PATH)
        expect(reloaded.container.innerHTML).toContain('Dashboard administrativo')
      } finally {
        await reloaded.cleanup()
      }
    } finally {
      await app.cleanup()
    }
  })
})

describe('QA — Tarea 2: rutas privadas sin sesión', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('bloquea acceso directo a rutas administrativas y redirige al login', async () => {
    for (const path of [ADMIN_HOME_PATH, '/admin/abonados', '/admin/usuarios'] as const) {
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        assertBlockedAdminAccess(app.container)
        expect(app.container.innerHTML).not.toContain('Gestión de abonados')
        expect(app.container.innerHTML).not.toContain('Gestión de usuarios')
      } finally {
        await app.cleanup()
      }
    }
  })

  it('tras logout no muestra información administrativa ni conserva token', async () => {
    loginWithAdminSession()
    const app = await mountInteractiveApp([ADMIN_HOME_PATH])

    try {
      expect(hasAdminChrome(app.container.innerHTML)).toBe(true)
      await logoutFromPanel(app.container)

      expect(isAuthenticated()).toBe(false)
      expect(getAccessToken()).toBeNull()
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      assertBlockedAdminAccess(app.container)

      await app.navigate(ADMIN_HOME_PATH)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
    } finally {
      await app.cleanup()
    }
  })
})

describe('QA — Tarea 3: menú y accesos por rol', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it.each(INTERNAL_ROLES_UNDER_TEST)(
    'rol %s — menú visible coincide con permisos y rutas prohibidas van a unauthorized',
    async (role) => {
      loginAsRole(role)
      const app = await mountAppRoutes(ADMIN_HOME_PATH)

      try {
        const visiblePaths = EXPECTED_NAV_PATHS[role]
        const blockedPaths = EXPECTED_BLOCKED_PATHS[role]

        for (const path of visiblePaths) {
          const href = `href="${path}"`
          expect(app.container.innerHTML).toContain(href)
        }

        for (const path of blockedPaths) {
          const blockedApp = await mountAppRoutes(path)
          try {
            expect(blockedApp.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
            expect(blockedApp.container.innerHTML).toContain('Acceso denegado')
          } finally {
            await blockedApp.cleanup()
          }
        }
      } finally {
        await app.cleanup()
      }
    },
  )
})

describe('QA — Tarea 4: navegación sidebar, layout y historial', () => {
  beforeEach(() => {
    clearAccessToken()
    loginWithAdminSession()
  })

  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('navega entre módulos, mantiene layout y marca opción activa', async () => {
    const app = await mountInteractiveApp([ADMIN_HOME_PATH])

    try {
      expect(app.container.innerHTML).toContain('admin-sidebar__link--active')
      expect(app.container.innerHTML).toContain('Dashboard administrativo')

      await app.navigate('/admin/galeria')
      expect(app.currentPath()).toBe('/admin/galeria')
      expect(hasAdminChrome(app.container.innerHTML)).toBe(true)
      expect(app.container.querySelector('.admin-sidebar__link--active')?.getAttribute('href')).toBe(
        '/admin/galeria',
      )

      await app.goBack()
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(app.container.innerHTML).toContain('Dashboard administrativo')
    } finally {
      await app.cleanup()
    }
  })

  it('muestra accesos rápidos en dashboard con enlaces válidos', async () => {
    const app = await mountAppRoutes(ADMIN_HOME_PATH)

    try {
      expect(app.container.innerHTML).toContain('admin-dashboard')
      expect(app.container.innerHTML).toContain('href="/admin/abonados"')
      expect(app.container.innerHTML).toContain('indicator-card')
    } finally {
      await app.cleanup()
    }
  })
})
