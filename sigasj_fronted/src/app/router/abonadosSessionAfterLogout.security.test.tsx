import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import AppRoutes from './AppRoutes'
import { AuthProvider } from '../../modules/auth/components/AuthContext'
import {
  clearAccessToken,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
  setAuthSession,
} from '../../modules/auth/utils/authStorage'
import { getAdminNavItemsForUser } from '../../modules/auth/utils/adminNavigation'
import { loginAsRole } from '../../test/authTestHelpers'
import { EXPECTED_NAV_PATHS } from '../../test/roleAccessFixtures'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from './publicRoutes'

const ABONADOS_PRIVATE_PATHS = ['/admin/abonados', '/admin/abonados/11'] as const

const sidebarHrefs = (html: string) =>
  [
    ...html.matchAll(
      /<a[^>]*class="[^"]*admin-sidebar__link[^"]*"[^>]*href="(\/admin\/[^"]+)"/g,
    ),
  ].map((match) => match[1])

const hasAbonadosModule = (html: string) =>
  html.includes('Gestión de abonados') || html.includes('admin-layout')

const mountApp = async (initialEntries: string[], initialIndex?: number) => {
  const router = createMemoryRouter(
    [
      {
        path: '/*',
        element: (
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        ),
      },
    ],
    {
      initialEntries,
      initialIndex: initialIndex ?? initialEntries.length - 1,
    },
  )

  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(<RouterProvider router={router} />)
  })

  return {
    container,
    currentPath: () => router.state.location.pathname,
    navigate: async (to: string) => {
      await act(async () => {
        await router.navigate(to)
      })
    },
    goBack: async () => {
      await act(async () => {
        await router.navigate(-1)
      })
    },
    submitLogin: async () => {
      const form = container.querySelector<HTMLFormElement>('.auth-page__form')
      expect(form).not.toBeNull()
      await act(async () => {
        form?.requestSubmit()
      })
    },
    confirmLogout: async () => {
      const trigger = container.querySelector<HTMLButtonElement>(
        '.admin-account-menu__trigger',
      )
      expect(trigger).not.toBeNull()
      await act(async () => {
        trigger?.click()
      })

      const logoutItem = container.querySelector<HTMLButtonElement>(
        '.admin-account-menu__item--danger',
      )
      expect(logoutItem).not.toBeNull()
      await act(async () => {
        logoutItem?.click()
      })

      const confirm = container.querySelector<HTMLButtonElement>(
        '.confirm-dialog__button--danger',
      )
      expect(confirm).not.toBeNull()
      await act(async () => {
        confirm?.click()
      })
    },
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('Gestión de Abonados después de cerrar sesión', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  describe('Administradora', () => {
    it('cierra sesión desde /admin/abonados, bloquea rutas, Atrás y recarga', async () => {
      const app = await mountApp([LOGIN_ROUTE_PATH])

      try {
        await app.submitLogin()
        await app.navigate('/admin/abonados')

        expect(isAuthenticated()).toBe(true)
        expect(getAuthUser()?.role).toBe('Administradora')
        expect(app.currentPath()).toBe('/admin/abonados')
        expect(app.container.innerHTML).toContain('Gestión de abonados')

        await app.confirmLogout()

        expect(isAuthenticated()).toBe(false)
        expect(getAccessToken()).toBeNull()
        expect(getAuthUser()).toBeNull()
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        expect(hasAbonadosModule(app.container.innerHTML)).toBe(false)

        for (const path of ABONADOS_PRIVATE_PATHS) {
          await app.navigate(path)
          expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
          expect(app.container.innerHTML).toContain('Iniciar sesión')
          expect(app.container.innerHTML).not.toContain('Gestión de abonados')
        }

        await app.goBack()
        expect(isAuthenticated()).toBe(false)
        expect(hasAbonadosModule(app.container.innerHTML)).toBe(false)
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      } finally {
        await app.cleanup()
      }

      for (const path of ABONADOS_PRIVATE_PATHS) {
        const reloaded = await mountApp([path])
        try {
          expect(isAuthenticated()).toBe(false)
          expect(reloaded.currentPath()).toBe(LOGIN_ROUTE_PATH)
          expect(reloaded.container.innerHTML).not.toContain('Gestión de abonados')
        } finally {
          await reloaded.cleanup()
        }
      }
    })
  })

  describe('Abonado', () => {
    it('con sesión no entra al padrón; tras limpiar sesión el acceso directo va a login', async () => {
      loginAsRole('Abonado', 'abonado-a-id')
      const app = await mountApp(['/admin/abonados'])

      try {
        expect(isAuthenticated()).toBe(true)
        expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
        expect(app.container.innerHTML).toContain('Acceso denegado')
        expect(app.container.innerHTML).not.toContain('Gestión de abonados')

        await act(async () => {
          clearAccessToken()
        })
        await app.navigate('/admin/abonados')

        expect(isAuthenticated()).toBe(false)
        expect(getAuthUser()).toBeNull()
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        expect(app.currentPath()).not.toBe(UNAUTHORIZED_ROUTE_PATH)
        expect(app.container.innerHTML).toContain('Iniciar sesión')
        expect(app.container.innerHTML).not.toContain('Gestión de abonados')
      } finally {
        await app.cleanup()
      }
    })
  })

  describe('nueva sesión', () => {
    it('tras Administradora, Fontanero no conserva menú ni datos de la sesión anterior', async () => {
      const app = await mountApp([LOGIN_ROUTE_PATH])

      try {
        await app.submitLogin()
        await app.navigate('/admin/abonados')
        expect(getAuthUser()?.role).toBe('Administradora')
        expect(sidebarHrefs(app.container.innerHTML)).toContain('/admin/abonados')
        expect(
          app.container.querySelector('.admin-header__user-detail')?.textContent,
        ).toBe('Administradora')

        await app.confirmLogout()
        expect(isAuthenticated()).toBe(false)

        await act(async () => {
          setAuthSession({
            accessToken: 'token-fontanero-nuevo',
            user: {
              id: 'fontanero-9',
              role: 'Fontanero',
              name: 'Pedro',
              lastName: 'Fontanero',
            },
          })
        })
        await app.navigate('/admin/dashboard')

        expect(isAuthenticated()).toBe(true)
        expect(getAuthUser()?.id).toBe('fontanero-9')
        expect(getAuthUser()?.role).toBe('Fontanero')
        expect(getAccessToken()).toBe('token-fontanero-nuevo')
        expect(app.currentPath()).toBe('/admin/dashboard')
        expect(sidebarHrefs(app.container.innerHTML)).toEqual([
          ...EXPECTED_NAV_PATHS.Fontanero,
        ])
        expect(sidebarHrefs(app.container.innerHTML)).not.toContain('/admin/abonados')
        expect(getAdminNavItemsForUser(getAuthUser()).map((item) => item.path)).not.toContain(
          '/admin/abonados',
        )
        expect(app.container.innerHTML).not.toContain('Gestión de abonados')
        expect(
          app.container.querySelector('.admin-header__user-detail')?.textContent,
        ).toBe('Fontanero')
        expect(app.container.innerHTML).toContain('Pedro Fontanero')
        expect(app.container.innerHTML).not.toContain('Usuario Administradora')
      } finally {
        await app.cleanup()
      }
    })
  })
})
