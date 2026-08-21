import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import AppRoutes from './AppRoutes'
import { AuthProvider } from '../../modules/auth/components/AuthContext'
import {
  ABONADO_PERSONAL_NAV_ITEMS,
  getAbonadoPersonalNavItems,
} from '../../modules/auth/utils/abonadoAccess'
import {
  getAbonadosNavItemsForUser,
  getAdminNavItemsForUser,
} from '../../modules/auth/utils/adminNavigation'
import {
  clearAccessToken,
  getAuthUser,
  isAuthenticated,
  setAuthSession,
} from '../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../test/authTestHelpers'
import { EXPECTED_NAV_PATHS } from '../../test/roleAccessFixtures'
import { ADMIN_HOME_PATH, ADMIN_NAV_ITEMS } from './privateRoutes'
import {
  LANDING_ROUTE_PATH,
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from './publicRoutes'

const REAL_ABONADOS_NAV_PATH = '/admin/abonados'
const REAL_ABONADOS_NAV_TITLE = 'Gestión de abonados'
const INVENTED_ABONADOS_NAV_HREFS = [
  '/admin/abonados/nuevo',
  '/admin/abonados/11',
  '/admin/abonados/me',
  '/mis-datos',
  '/solicitar-cambio',
] as const

const sidebarHrefs = (html: string) =>
  [
    ...html.matchAll(
      /<a[^>]*class="[^"]*admin-sidebar__link[^"]*"[^>]*href="(\/admin\/[^"]+)"/g,
    ),
  ].map((match) => match[1])

const sidebarLabels = (container: HTMLElement) =>
  [...container.querySelectorAll('.admin-sidebar__label')].map(
    (node) => node.textContent?.trim() ?? '',
  )

const hasAdminChrome = (html: string) =>
  html.includes('admin-layout') ||
  html.includes('admin-sidebar') ||
  html.includes('admin-header')

const mountApp = async (path: string) => {
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
    { initialEntries: [path] },
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
    logout: async () => {
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

describe('menú de Gestión de Abonados según el rol', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('el catálogo real del módulo es un solo ítem administrativo; no inventa subopciones', () => {
    const administradora = { id: '1', role: 'Administradora' }
    const abonado = { id: '4', role: 'Abonado' }
    const realItem = ADMIN_NAV_ITEMS.find((item) => item.path === REAL_ABONADOS_NAV_PATH)

    expect(realItem).toEqual({
      path: REAL_ABONADOS_NAV_PATH,
      title: REAL_ABONADOS_NAV_TITLE,
      icon: 'abonados',
    })
    expect(getAbonadosNavItemsForUser(administradora)).toEqual([realItem])
    expect(getAbonadosNavItemsForUser(abonado)).toEqual([])
    expect(ABONADO_PERSONAL_NAV_ITEMS).toEqual([])
    expect(getAbonadoPersonalNavItems(abonado)).toEqual([])
  })

  describe('Administradora', () => {
    it('inicia sesión y ve únicamente las opciones administrativas reales, incluida Gestión de abonados', async () => {
      const app = await mountApp(LOGIN_ROUTE_PATH)

      try {
        await app.submitLogin()

        expect(isAuthenticated()).toBe(true)
        expect(getAuthUser()?.role).toBe('Administradora')
        expect(app.currentPath()).toBe(ADMIN_HOME_PATH)

        const links = sidebarHrefs(app.container.innerHTML)
        const labels = sidebarLabels(app.container)

        expect(links).toEqual([...EXPECTED_NAV_PATHS.Administradora])
        expect(links).toContain(REAL_ABONADOS_NAV_PATH)
        expect(labels).toContain(REAL_ABONADOS_NAV_TITLE)
        expect(labels.filter((label) => label === REAL_ABONADOS_NAV_TITLE)).toHaveLength(1)

        for (const invented of INVENTED_ABONADOS_NAV_HREFS) {
          expect(links).not.toContain(invented)
          expect(app.container.querySelector(`[href="${invented}"]`)).toBeNull()
        }

        expect(app.container.innerHTML).not.toContain('Mis datos')
        expect(app.container.innerHTML).not.toContain('Solicitar cambio de datos')

        await app.clickSidebar(REAL_ABONADOS_NAV_PATH)

        expect(app.currentPath()).toBe(REAL_ABONADOS_NAV_PATH)
        expect(app.container.querySelector('.admin-main__content h1')?.textContent).toBe(
          REAL_ABONADOS_NAV_TITLE,
        )
        expect(
          app.container
            .querySelector(`.admin-sidebar__link[href="${REAL_ABONADOS_NAV_PATH}"]`)
            ?.className,
        ).toContain('admin-sidebar__link--active')
      } finally {
        await app.cleanup()
      }
    })
  })

  describe('Abonado', () => {
    it('no muestra opciones administrativas y solo las personales que ya existen', async () => {
      loginAsRole('Abonado')
      const app = await mountApp(LANDING_ROUTE_PATH)

      try {
        expect(isAuthenticated()).toBe(true)
        expect(getAuthUser()?.role).toBe('Abonado')
        expect(getAdminNavItemsForUser(getAuthUser())).toEqual([])
        expect(getAbonadoPersonalNavItems(getAuthUser())).toEqual([
          ...ABONADO_PERSONAL_NAV_ITEMS,
        ])
        expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
        expect(sidebarHrefs(app.container.innerHTML)).toEqual([])
        expect(app.container.querySelector('.admin-sidebar')).toBeNull()
        expect(app.container.innerHTML).not.toContain(REAL_ABONADOS_NAV_TITLE)

        for (const path of EXPECTED_NAV_PATHS.Administradora) {
          expect(app.container.querySelector(`[href="${path}"]`)).toBeNull()
        }

        for (const item of ABONADO_PERSONAL_NAV_ITEMS) {
          await app.navigate(item.path)
          expect(app.currentPath()).toBe(item.path)
          expect(app.container.innerHTML).toContain(item.title)
          expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
        }
      } finally {
        await app.cleanup()
      }
    })
  })

  describe('cambio de sesión', () => {
    it('al cerrar sesión de Administradora e iniciar como Abonado el menú se actualiza sin estado visual anterior', async () => {
      const app = await mountApp(LOGIN_ROUTE_PATH)

      try {
        await app.submitLogin()
        expect(getAuthUser()?.role).toBe('Administradora')
        expect(sidebarHrefs(app.container.innerHTML)).toContain(REAL_ABONADOS_NAV_PATH)
        expect(app.container.innerHTML).toContain(REAL_ABONADOS_NAV_TITLE)
        expect(app.container.innerHTML).toContain('admin-header__user-detail')
        expect(
          app.container.querySelector('.admin-header__user-detail')?.textContent,
        ).toBe('Administradora')

        await app.logout()

        expect(isAuthenticated()).toBe(false)
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
        expect(sidebarHrefs(app.container.innerHTML)).toEqual([])
        expect(app.container.querySelector('.admin-sidebar')).toBeNull()

        await act(async () => {
          setAuthSession({
            accessToken: 'token-abonado',
            user: {
              id: 'abonado-1',
              role: 'Abonado',
              name: 'Carlos',
              lastName: 'Abonado',
            },
          })
        })

        await app.navigate(LANDING_ROUTE_PATH)

        expect(isAuthenticated()).toBe(true)
        expect(getAuthUser()?.role).toBe('Abonado')
        expect(app.currentPath()).toBe(LANDING_ROUTE_PATH)
        expect(app.currentPath()).not.toBe(UNAUTHORIZED_ROUTE_PATH)
        expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
        expect(sidebarHrefs(app.container.innerHTML)).toEqual([])
        expect(app.container.querySelector('.admin-sidebar')).toBeNull()
        expect(app.container.innerHTML).not.toContain(REAL_ABONADOS_NAV_TITLE)
        expect(app.container.innerHTML).not.toContain('Panel administrativo')
        expect(app.container.innerHTML).not.toContain('Dashboard administrativo')
        expect(app.container.querySelector('.admin-header__user-detail')).toBeNull()
        expect(app.container.innerHTML).not.toContain('href="/admin/abonados"')
        expect(getAbonadosNavItemsForUser(getAuthUser())).toEqual([])
      } finally {
        await app.cleanup()
      }
    })
  })
})
