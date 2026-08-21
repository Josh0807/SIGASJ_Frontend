import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import AppRoutes from './AppRoutes'
import { AuthProvider } from '../../modules/auth/components/AuthContext'
import {
  clearAccessToken,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
} from '../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../test/authTestHelpers'
import {
  ABONADO_PERSONAL_NAV_ITEMS,
  ABONADO_PERSONAL_ROUTE_PATHS,
} from '../../modules/auth/utils/abonadoAccess'
import {
  ADMIN_HOME_PATH,
  ADMIN_NAV_ITEMS,
  ADMIN_PROFILE_PATH,
  ADMIN_PROFILE_TITLE,
  PRIVATE_ROUTE_PATHS,
} from './privateRoutes'
import {
  LANDING_ROUTE_PATH,
  LOGIN_ROUTE_PATH,
  PUBLIC_ROUTE_PATHS,
  UNAUTHORIZED_ROUTE_PATH,
} from './publicRoutes'
import {
  EXPECTED_NAV_PATHS,
  SAMPLE_ALLOWED_CONTENT,
} from '../../test/roleAccessFixtures'

const ADMINISTRATIVE_ABONADOS_PATHS = [
  '/admin/abonados',
  '/admin/abonados/11',
  '/admin/abonados/nuevo',
] as const

const sidebarHrefs = (html: string) =>
  [
    ...html.matchAll(
      /<a[^>]*class="[^"]*admin-sidebar__link[^"]*"[^>]*href="(\/admin\/[^"]+)"/g,
    ),
  ].map((match) => match[1])

const hasAdminChrome = (html: string) =>
  html.includes('admin-layout') ||
  html.includes('admin-sidebar') ||
  html.includes('admin-header')

const collectConsole = () => {
  const errors: unknown[] = []
  const warnings: unknown[] = []
  const rejections: unknown[] = []
  const originalError = console.error
  const originalWarn = console.warn

  const onRejection = (event: PromiseRejectionEvent) => {
    rejections.push(event.reason)
  }

  console.error = (...args: unknown[]) => {
    errors.push(args)
  }
  console.warn = (...args: unknown[]) => {
    warnings.push(args)
  }
  window.addEventListener('unhandledrejection', onRejection)

  return {
    errors,
    warnings,
    rejections,
    restore: () => {
      console.error = originalError
      console.warn = originalWarn
      window.removeEventListener('unhandledrejection', onRejection)
    },
  }
}

const serializeConsole = (probe: ReturnType<typeof collectConsole>) =>
  JSON.stringify([...probe.errors, ...probe.warnings, ...probe.rejections])

const assertCleanConsole = (probe: ReturnType<typeof collectConsole>) => {
  expect(probe.errors).toEqual([])
  expect(probe.warnings).toEqual([])
  expect(probe.rejections).toEqual([])

  const serialized = serializeConsole(probe)
  expect(serialized).not.toMatch(/Maximum update depth/i)
  expect(serialized).not.toMatch(/You cannot render a <Router/i)
  expect(serialized).not.toMatch(/No routes matched/i)
  expect(serialized).not.toMatch(/useAuth debe usarse/i)
  expect(serialized).not.toMatch(/role.*undefined/i)
  expect(serialized).not.toMatch(/undefined is not/i)
}

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
    router,
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

      await vi.waitFor(() => {
        expect(isAuthenticated()).toBe(true)
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

describe('pruebas funcionales de autorización — Gestión de Abonados', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('no registra rutas duplicadas en el árbol público ni administrativo', () => {
    expect(new Set(PUBLIC_ROUTE_PATHS).size).toBe(PUBLIC_ROUTE_PATHS.length)
    expect(new Set(PRIVATE_ROUTE_PATHS).size).toBe(PRIVATE_ROUTE_PATHS.length)
    expect(new Set(ADMIN_NAV_ITEMS.map((item) => item.path)).size).toBe(
      ADMIN_NAV_ITEMS.length,
    )
    expect(
      PUBLIC_ROUTE_PATHS.filter((path) => PRIVATE_ROUTE_PATHS.includes(path)),
    ).toEqual([])
  })

  describe('Escenario 1 — Administradora', () => {
    it('entra al panel, ve opciones autorizadas y abre Gestión de Abonados', async () => {
      const probe = collectConsole()
      const app = await mountApp(LOGIN_ROUTE_PATH)

      try {
        await app.submitLogin()

        expect(isAuthenticated()).toBe(true)
        expect(getAuthUser()?.role).toBe('Administradora')
        expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
        expect(app.container.innerHTML).toContain('admin-layout')
        expect(app.container.innerHTML).toContain('Dashboard administrativo')

        const links = sidebarHrefs(app.container.innerHTML)
        expect(links).toEqual([...EXPECTED_NAV_PATHS.Administradora])
        expect(links).toContain('/admin/abonados')
        expect(new Set(links).size).toBe(links.length)

        await app.clickSidebar('/admin/abonados')

        expect(app.currentPath()).toBe('/admin/abonados')
        expect(app.container.innerHTML).toContain('Gestión de abonados')
        expect(app.container.innerHTML).toContain('admin-layout')
        expect(app.container.innerHTML).not.toContain('Acceso denegado')

        assertCleanConsole(probe)
      } finally {
        probe.restore()
        await app.cleanup()
      }
    })

    it('abre por menú las rutas administrativas autorizadas y acepta URL directa', async () => {
      const probe = collectConsole()
      loginAsRole('Administradora')
      const app = await mountApp(ADMIN_HOME_PATH)

      try {
        expect(getAuthUser()?.role).toBe('Administradora')

        for (const path of EXPECTED_NAV_PATHS.Administradora) {
          await app.clickSidebar(path)
          expect(app.currentPath()).toBe(path)
          expect(app.container.innerHTML).toContain('admin-layout')
          const title = SAMPLE_ALLOWED_CONTENT[path]
          if (title) {
            expect(app.container.innerHTML).toContain(title)
          }
          expect(app.container.innerHTML).not.toContain('Acceso denegado')
        }

        for (const path of ['/admin/abonados', '/admin/abonados/11', ADMIN_PROFILE_PATH]) {
          await app.navigate(path)
          expect(app.currentPath()).toBe(path)
          expect(hasAdminChrome(app.container.innerHTML)).toBe(true)
          expect(app.container.innerHTML).not.toContain('Acceso denegado')
        }

        expect(app.container.innerHTML).toContain(ADMIN_PROFILE_TITLE)
        assertCleanConsole(probe)
      } finally {
        probe.restore()
        await app.cleanup()
      }
    })
  })

  describe('Escenario 2 — Abonado', () => {
    it('solo usa funciones personales existentes y no ve opciones administrativas', async () => {
      const probe = collectConsole()
      loginAsRole('Abonado')
      const app = await mountApp(LANDING_ROUTE_PATH)

      try {
        expect(isAuthenticated()).toBe(true)
        expect(getAuthUser()?.role).toBe('Abonado')
        expect(getAuthUser()?.role).not.toBeUndefined()
        expect(app.currentPath()).toBe(LANDING_ROUTE_PATH)
        expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
        expect(sidebarHrefs(app.container.innerHTML)).toEqual([])
        expect(app.container.innerHTML).not.toContain('Gestión de abonados')
        expect(app.container.innerHTML).not.toContain('admin-sidebar')

        expect(ABONADO_PERSONAL_NAV_ITEMS.map((item) => item.path)).toEqual([
          ...ABONADO_PERSONAL_ROUTE_PATHS,
        ])

        for (const item of ABONADO_PERSONAL_NAV_ITEMS) {
          await app.navigate(item.path)
          expect(app.currentPath()).toBe(item.path)
          expect(app.container.innerHTML).toContain(item.title)
          expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
        }

        await app.navigate(ADMIN_PROFILE_PATH)
        expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
        expect(app.container.innerHTML).not.toContain(ADMIN_PROFILE_TITLE)
        expect(isAuthenticated()).toBe(true)

        assertCleanConsole(probe)
      } finally {
        probe.restore()
        await app.cleanup()
      }
    })

    it('no inventa perfil de padrón ni solicitud de cambios si esas rutas no existen', async () => {
      expect(ABONADO_PERSONAL_ROUTE_PATHS).not.toContain(ADMIN_PROFILE_PATH)
      expect(ABONADO_PERSONAL_ROUTE_PATHS.some((path) => /perfil|cambio/i.test(path))).toBe(
        false,
      )
      expect(ABONADO_PERSONAL_NAV_ITEMS).toEqual([])
    })
  })

  describe('Escenario 3 — Abonado intenta ruta administrativa', () => {
    it('mantiene la sesión, oculta el padrón y muestra Acceso denegado', async () => {
      const probe = collectConsole()
      loginAsRole('Abonado')
      const app = await mountApp('/admin/abonados')

      try {
        for (const path of ADMINISTRATIVE_ABONADOS_PATHS) {
          await app.navigate(path)

          expect(isAuthenticated()).toBe(true)
          expect(getAccessToken()).not.toBeNull()
          expect(getAuthUser()?.role).toBe('Abonado')
          expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
          expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
          expect(app.container.innerHTML).toContain('Acceso denegado')
          expect(app.container.innerHTML).not.toContain('Iniciar sesión')
          expect(app.container.innerHTML).not.toContain('Gestión de abonados')
          expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
        }

        assertCleanConsole(probe)
      } finally {
        probe.restore()
        await app.cleanup()
      }
    })
  })

  describe('Escenario 4 — Sin sesión', () => {
    it('redirige al login desde cualquier ruta privada del módulo', async () => {
      const probe = collectConsole()
      const privateModulePaths = [
        ...ADMINISTRATIVE_ABONADOS_PATHS,
        ADMIN_PROFILE_PATH,
        ...ABONADO_PERSONAL_ROUTE_PATHS,
      ]

      try {
        for (const path of privateModulePaths) {
          const app = await mountApp(path)

          try {
            expect(isAuthenticated()).toBe(false)
            expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
            expect(app.container.innerHTML).toContain('Iniciar sesión')
            expect(app.container.innerHTML).not.toContain('Acceso denegado')
            expect(app.container.innerHTML).not.toContain('Gestión de abonados')
            expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
          } finally {
            await app.cleanup()
          }
        }

        assertCleanConsole(probe)
      } finally {
        probe.restore()
      }
    })
  })

  describe('Escenario 5 — Logout', () => {
    it('tras cerrar sesión las rutas de Gestión de Abonados vuelven a quedar bloqueadas', async () => {
      const probe = collectConsole()
      const app = await mountApp(LOGIN_ROUTE_PATH)

      try {
        await app.submitLogin()
        await app.navigate('/admin/abonados')
        expect(app.container.innerHTML).toContain('Gestión de abonados')
        expect(isAuthenticated()).toBe(true)

        await app.logout()

        expect(isAuthenticated()).toBe(false)
        expect(getAuthUser()).toBeNull()
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        expect(hasAdminChrome(app.container.innerHTML)).toBe(false)

        for (const path of ADMINISTRATIVE_ABONADOS_PATHS) {
          await app.navigate(path)
          expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
          expect(app.container.innerHTML).toContain('Iniciar sesión')
          expect(app.container.innerHTML).not.toContain('Gestión de abonados')
        }

        assertCleanConsole(probe)
      } finally {
        probe.restore()
        await app.cleanup()
      }
    })
  })
})
