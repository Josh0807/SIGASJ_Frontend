import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import {
  clearAccessToken,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
} from '../../modules/auth/utils/authStorage'
import AppRoutes from './AppRoutes'
import { AuthProvider } from '../../modules/auth/components/AuthContext'
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
  const router = createMemoryRouter(
    [{ path: '/*', element: <AuthProvider><AppRoutes /></AuthProvider> }],
    {
    initialEntries,
    initialIndex,
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
    await new Promise((resolve) => setTimeout(resolve, 50))
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
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: 'local-administradora-session',
          user: { id: '1', email: 'admin@asadasanjuan.cr', role: 'Administradora' },
        }),
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('Prueba 1 — logout desde diálogo invalida sesión y redirige a /login', async () => {
    const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(isAuthenticated()).toBe(false)

      await submitLogin(app.container)

      expect(isAuthenticated()).toBe(true)
      expect(getAccessToken()).toBe('local-administradora-session')
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
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

  it('Prueba 2 — acceso directo a ruta administrativa principal bloqueado tras logout', async () => {
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

  it('Prueba 3 — acceso directo a rutas administrativas hijas bloqueado tras logout', async () => {
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

  it('Prueba 4 — acceso directo a Mi perfil bloqueado tras logout', async () => {
    const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

    try {
      await submitLogin(app.container)
      await logoutFromAccountMenu(app.container)

      expect(isAuthenticated()).toBe(false)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)

      await app.navigate(ADMIN_PROFILE_PATH)

      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      assertBlockedAdminAccess(app.container)
      expect(app.container.innerHTML).not.toContain('Mi perfil')
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 5 — botón Atrás no recupera acceso al panel tras logout', async () => {
    const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

    try {
      await submitLogin(app.container)

      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(isAuthenticated()).toBe(true)
      expect(app.container.innerHTML).toContain('admin-layout')

      await logoutFromAccountMenu(app.container)

      expect(isAuthenticated()).toBe(false)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      assertBlockedAdminAccess(app.container)

      await app.goBack()

      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      assertBlockedAdminAccess(app.container)
      expect(app.container.innerHTML).not.toContain('Dashboard administrativo')
      expect(app.container.innerHTML).not.toContain('Panel administrativo')
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 5b — historial con URL admin sin sesión sigue bloqueado al retroceder', async () => {
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
      expect(app.container.innerHTML).not.toContain('Gestión de asociados')
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

  describe('Gestión de asociados tras cerrar sesión', () => {
    const ABONADOS_PATHS = ['/admin/abonados', '/admin/abonados/11'] as const

    const assertLoggedOutFromAbonados = (container: HTMLElement) => {
      expect(isAuthenticated()).toBe(false)
      expect(getAccessToken()).toBeNull()
      expect(getAuthUser()).toBeNull()
      assertBlockedAdminAccess(container)
      expect(container.innerHTML).not.toContain('Gestión de asociados')
    }

    it('invalida la sesión al cerrar sesión desde Gestión de asociados', async () => {
      const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

      try {
        await submitLogin(app.container)
        await app.navigate('/admin/abonados')

        expect(isAuthenticated()).toBe(true)
        expect(getAuthUser()).not.toBeNull()
        expect(app.currentPath()).toBe('/admin/abonados')
        expect(app.container.innerHTML).toContain('admin-layout')
        expect(app.container.innerHTML).toContain('Gestión de asociados')

        await logoutFromAccountMenu(app.container)

        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        assertLoggedOutFromAbonados(app.container)
      } finally {
        await app.cleanup()
      }
    })

    it('bloquea el acceso directo a Gestión de asociados después del logout', async () => {
      const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

      try {
        await submitLogin(app.container)
        await app.navigate('/admin/abonados')
        await logoutFromAccountMenu(app.container)

        for (const path of ABONADOS_PATHS) {
          await app.navigate(path)

          expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
          assertLoggedOutFromAbonados(app.container)
        }
      } finally {
        await app.cleanup()
      }
    })

    it('el botón Atrás no recupera Gestión de asociados aunque la URL anterior reaparezca', async () => {
      const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

      try {
        await submitLogin(app.container)
        await app.navigate('/admin/abonados')
        expect(app.container.innerHTML).toContain('Gestión de asociados')

        await logoutFromAccountMenu(app.container)
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)

        await app.goBack()

        expect(isAuthenticated()).toBe(false)
        expect(app.container.innerHTML).not.toContain('Gestión de asociados')
        expect(app.container.innerHTML).not.toContain('admin-layout')
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      } finally {
        await app.cleanup()
      }
    })

    it('ProtectedRoute vuelve a comprobar la sesión al volver a /admin/abonados sin autenticación', async () => {
      clearAccessToken()

      const app = await mountInteractiveApp(
        ['/admin/abonados', LOGIN_ROUTE_PATH],
        1,
      )

      try {
        expect(isAuthenticated()).toBe(false)
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)

        await app.goBack()

        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        assertLoggedOutFromAbonados(app.container)
      } finally {
        await app.cleanup()
      }
    })

    it('recargar una URL de Gestión de asociados tras logout sigue bloqueada', async () => {
      const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

      try {
        await submitLogin(app.container)
        await app.navigate('/admin/abonados')
        await logoutFromAccountMenu(app.container)
        expect(isAuthenticated()).toBe(false)
      } finally {
        await app.cleanup()
      }

      for (const path of ABONADOS_PATHS) {
        const reloaded = await mountInteractiveApp([path])

        try {
          expect(reloaded.currentPath()).toBe(LOGIN_ROUTE_PATH)
          assertLoggedOutFromAbonados(reloaded.container)
        } finally {
          await reloaded.cleanup()
        }
      }
    })
  })
})
