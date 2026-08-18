import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import {
  clearAccessToken,
  getAccessToken,
  isAuthenticated,
} from '../../modules/auth/utils/authStorage'
import AppRoutes from './AppRoutes'
import {
  ADMIN_BASE_PATH,
  ADMIN_HOME_PATH,
  ADMIN_PROFILE_PATH,
  PRIVATE_ROUTE_PATHS,
} from './privateRoutes'
import { LOGIN_ROUTE_PATH } from './publicRoutes'

const hasAdminChrome = (html: string) =>
  html.includes('admin-layout') ||
  html.includes('admin-sidebar') ||
  html.includes('admin-header')

const assertBlockedAdminAccess = (container: HTMLElement) => {
  expect(container.innerHTML).toContain('auth-page')
  expect(container.innerHTML).not.toContain('admin-layout')
  expect(container.innerHTML).not.toContain('admin-sidebar')
  expect(container.innerHTML).not.toContain('admin-header')
  expect(container.innerHTML).not.toContain('Panel administrativo')
  expect(hasAdminChrome(container.innerHTML)).toBe(false)
}

const mountInteractiveApp = async (
  initialEntries: string[],
  initialIndex = initialEntries.length - 1,
) => {
  const router = createMemoryRouter([{ path: '/*', element: <AppRoutes /> }], {
    initialEntries,
    initialIndex,
  })

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
    goBack: async () => {
      await act(async () => {
        await router.navigate(-1)
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

const submitLogin = async (container: HTMLElement) => {
  const form = container.querySelector('.auth-page__form') as HTMLFormElement | null
  expect(form).not.toBeNull()

  await act(async () => {
    form?.requestSubmit()
  })
}

const logoutFromAccountMenu = async (container: HTMLElement) => {
  const trigger = container.querySelector(
    '.admin-account-menu__trigger',
  ) as HTMLButtonElement | null
  expect(trigger).not.toBeNull()

  await act(async () => {
    trigger?.click()
  })

  const logoutItem = container.querySelector(
    '.admin-account-menu__item--danger',
  ) as HTMLButtonElement | null
  expect(logoutItem).not.toBeNull()

  await act(async () => {
    logoutItem?.click()
  })

  const confirmButton = container.querySelector(
    '.confirm-dialog__button--danger',
  ) as HTMLButtonElement | null
  expect(confirmButton).not.toBeNull()

  await act(async () => {
    confirmButton?.click()
  })
}

describe('protección de rutas administrativas después del logout', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('flujo completo: login → panel → cerrar sesión → redirección al login', async () => {
    const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(isAuthenticated()).toBe(false)

      await submitLogin(app.container)

      expect(isAuthenticated()).toBe(true)
      expect(getAccessToken()).toBe('local-admin-session')
      expect(app.currentPath()).toBe('/admin/galeria')
      expect(app.container.innerHTML).toContain('admin-layout')
      expect(app.container.innerHTML).toContain('admin-sidebar')
      expect(app.container.innerHTML).toContain('admin-header')

      await logoutFromAccountMenu(app.container)

      expect(isAuthenticated()).toBe(false)
      expect(getAccessToken()).toBeNull()
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      assertBlockedAdminAccess(app.container)
    } finally {
      await app.cleanup()
    }
  })

  it('bloquea acceso directo a /admin y /admin/dashboard tras cerrar sesión', async () => {
    const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

    try {
      await submitLogin(app.container)
      await logoutFromAccountMenu(app.container)

      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)

      for (const path of [ADMIN_BASE_PATH, ADMIN_HOME_PATH] as const) {
        await app.navigate(path)

        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        assertBlockedAdminAccess(app.container)
      }
    } finally {
      await app.cleanup()
    }
  })

  it('bloquea acceso directo a rutas administrativas hijas tras cerrar sesión', async () => {
    const childPaths = [
      '/admin/abonados',
      '/admin/averias',
      ADMIN_PROFILE_PATH,
    ] as const

    const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

    try {
      await submitLogin(app.container)
      await logoutFromAccountMenu(app.container)

      for (const path of childPaths) {
        await app.navigate(path)

        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        assertBlockedAdminAccess(app.container)
      }
    } finally {
      await app.cleanup()
    }
  })

  it('impide volver al panel con el botón Atrás cuando el historial contiene una URL administrativa', async () => {
    clearAccessToken()

    const app = await mountInteractiveApp(
      [ADMIN_HOME_PATH, LOGIN_ROUTE_PATH],
      1,
    )

    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(isAuthenticated()).toBe(false)

      await app.goBack()

      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      assertBlockedAdminAccess(app.container)
    } finally {
      await app.cleanup()
    }
  })

  it('revalida ProtectedRoute al retroceder desde login hacia una ruta hija administrativa', async () => {
    clearAccessToken()

    const app = await mountInteractiveApp(
      ['/admin/abonados', LOGIN_ROUTE_PATH],
      1,
    )

    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)

      await app.goBack()

      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      assertBlockedAdminAccess(app.container)
      expect(app.container.innerHTML).not.toContain('Gestión de abonados')
    } finally {
      await app.cleanup()
    }
  })

  it('cubre todas las rutas privadas registradas después de invalidar la sesión', async () => {
    const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

    try {
      await submitLogin(app.container)
      await logoutFromAccountMenu(app.container)

      for (const path of PRIVATE_ROUTE_PATHS) {
        await app.navigate(path)

        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        assertBlockedAdminAccess(app.container)
      }
    } finally {
      await app.cleanup()
    }
  })
})
