import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from './AppRoutes'
import { AuthProvider } from '../../modules/auth/components/AuthContext'
import {
  clearAccessToken,
  getAuthUser,
  isAuthenticated,
} from '../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../test/authTestHelpers'
import { LocationProbe } from '../../test/location-probe'
import {
  EXPECTED_NAV_PATHS,
  SAMPLE_ALLOWED_CONTENT,
} from '../../test/roleAccessFixtures'
import { ADMIN_HOME_PATH, ADMIN_PROFILE_PATH } from './privateRoutes'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from './publicRoutes'

const ADMINISTRATIVE_ABONADOS_PATHS = [
  '/admin/abonados',
  '/admin/abonados/11',
  '/admin/abonados/nuevo',
] as const

const DIRECT_ADMIN_PATHS = [
  ...EXPECTED_NAV_PATHS.Administradora,
  ADMIN_PROFILE_PATH,
  ...ADMINISTRATIVE_ABONADOS_PATHS,
] as const

const sidebarHrefs = (html: string) =>
  [
    ...html.matchAll(
      /<a[^>]*class="[^"]*admin-sidebar__link[^"]*"[^>]*href="(\/admin\/[^"]+)"/g,
    ),
  ].map((match) => match[1])

const assertAdminChrome = (html: string) => {
  expect(html).toContain('admin-layout')
  expect(html).toContain('admin-sidebar')
  expect(html).toContain('admin-header')
  expect(html).not.toContain('Acceso denegado')
}

const mountApp = async (path: string) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  let pathname = path

  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <LocationProbe
            onLocation={(next) => {
              pathname = next.pathname
            }}
          />
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )
  })

  return {
    container,
    currentPath: () => pathname,
    clickSidebar: async (href: string) => {
      const link = container.querySelector<HTMLAnchorElement>(
        `.admin-sidebar__link[href="${href}"]`,
      )
      expect(link, href).not.toBeNull()
      await act(async () => {
        link?.click()
      })
    },
    submitLogin: async () => {
      const form = container.querySelector<HTMLFormElement>('.auth-page__form')
      expect(form).not.toBeNull()
      await act(async () => {
        form?.requestSubmit()
      })
    },
    navigate: async (to: string) => {
      const app = await mountApp(to)
      return app
    },
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('seguridad — sesión Administradora', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('inicia sesión como Administradora y entra al panel con layout completo', async () => {
    const app = await mountApp(LOGIN_ROUTE_PATH)

    try {
      await app.submitLogin()

      expect(isAuthenticated()).toBe(true)
      expect(getAuthUser()?.role).toBe('Administradora')
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(app.currentPath()).not.toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      assertAdminChrome(app.container.innerHTML)
      expect(app.container.innerHTML).toContain('Dashboard administrativo')
      expect(app.container.innerHTML).toContain('Panel administrativo')
    } finally {
      await app.cleanup()
    }
  })

  it('ve las opciones administrativas de su rol e ingresa a Gestión de Abonados', async () => {
    loginAsRole('Administradora')
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const links = sidebarHrefs(app.container.innerHTML)

      expect(links).toEqual([...EXPECTED_NAV_PATHS.Administradora])
      expect(links).toContain('/admin/abonados')
      assertAdminChrome(app.container.innerHTML)

      await app.clickSidebar('/admin/abonados')

      expect(app.currentPath()).toBe('/admin/abonados')
      expect(app.container.innerHTML).toContain('Gestión de abonados')
      assertAdminChrome(app.container.innerHTML)
    } finally {
      await app.cleanup()
    }
  })

  it('navega por menú únicamente las rutas definidas para Administradora', async () => {
    loginAsRole('Administradora')
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      for (const path of EXPECTED_NAV_PATHS.Administradora) {
        await app.clickSidebar(path)

        expect(app.currentPath()).toBe(path)
        expect(app.currentPath()).not.toBe(UNAUTHORIZED_ROUTE_PATH)
        assertAdminChrome(app.container.innerHTML)

        const title = SAMPLE_ALLOWED_CONTENT[path]
        if (title) {
          expect(app.container.innerHTML).toContain(title)
        }
      }
    } finally {
      await app.cleanup()
    }
  })

  it.each([...DIRECT_ADMIN_PATHS])(
    'acceso directo permitido a %s sin Acceso denegado',
    async (path) => {
      loginAsRole('Administradora')
      const app = await mountApp(path)

      try {
        expect(app.currentPath()).toBe(path)
        expect(app.currentPath()).not.toBe(UNAUTHORIZED_ROUTE_PATH)
        expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
        assertAdminChrome(app.container.innerHTML)

        if (path.startsWith('/admin/abonados')) {
          expect(app.container.innerHTML).toContain('Gestión de abonados')
        }
      } finally {
        await app.cleanup()
      }
    },
  )
})
