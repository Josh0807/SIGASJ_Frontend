import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import AppRoutes from './AppRoutes'
import { AuthProvider } from '../../modules/auth/components/AuthContext'
import {
  clearAccessToken,
  getAuthUser,
  isAuthenticated,
} from '../../modules/auth/utils/authStorage'
import { fetchWithAuth } from '../../services/http/httpClient'
import { loginAsRole } from '../../test/authTestHelpers'
import { ADMIN_HOME_PATH, PRIVATE_ROUTE_PATHS } from './privateRoutes'
import {
  LOGIN_ROUTE_PATH,
  PUBLIC_ROUTE_PATHS,
  UNAUTHORIZED_ROUTE_PATH,
} from './publicRoutes'

const collectConsole = () => {
  const errors: unknown[] = []
  const warnings: unknown[] = []
  const logs: unknown[] = []
  const rejections: unknown[] = []
  const originalError = console.error
  const originalWarn = console.warn
  const originalLog = console.log

  const onRejection = (event: PromiseRejectionEvent) => {
    rejections.push(event.reason)
  }

  console.error = (...args: unknown[]) => {
    errors.push(args)
  }
  console.warn = (...args: unknown[]) => {
    warnings.push(args)
  }
  console.log = (...args: unknown[]) => {
    logs.push(args)
  }
  window.addEventListener('unhandledrejection', onRejection)

  return {
    errors,
    warnings,
    logs,
    rejections,
    restore: () => {
      console.error = originalError
      console.warn = originalWarn
      console.log = originalLog
      window.removeEventListener('unhandledrejection', onRejection)
    },
  }
}

const serialize = (probe: ReturnType<typeof collectConsole>, html = '') =>
  JSON.stringify([...probe.errors, ...probe.warnings, ...probe.logs, ...probe.rejections, html])

const assertNoSensitiveLogs = (serialized: string) => {
  expect(serialized).not.toMatch(/eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\./)
  expect(serialized).not.toMatch(/Bearer\s+[A-Za-z0-9._-]+/i)
  expect(serialized).not.toContain('sigasj_access_token')
  expect(serialized).not.toContain('JWT_SECRET')
  expect(serialized).not.toContain('super_secret_jwt')
  expect(serialized).not.toMatch(/password["']?\s*[:=]/i)
}

const assertNoFrameworkErrors = (serialized: string) => {
  expect(serialized).not.toMatch(/Maximum update depth/i)
  expect(serialized).not.toMatch(/You cannot render a <Router/i)
  expect(serialized).not.toMatch(/No routes matched/i)
  expect(serialized).not.toMatch(/useAuth debe usarse/i)
  expect(serialized).not.toMatch(/role.*undefined/i)
  expect(serialized).not.toMatch(/undefined is not/i)
  expect(serialized).not.toMatch(/AuthContext/i)
  expect(serialized).not.toMatch(/Failed to fetch/i)
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

  await act(async () => {
    await Promise.resolve()
  })

  return {
    container,
    currentPath: () => router.state.location.pathname,
    navigate: async (to: string) => {
      await act(async () => {
        await router.navigate(to)
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

describe('revisión técnica de errores — pruebas de seguridad', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('no duplica rutas públicas ni privadas', () => {
    expect(new Set(PUBLIC_ROUTE_PATHS).size).toBe(PUBLIC_ROUTE_PATHS.length)
    expect(new Set(PRIVATE_ROUTE_PATHS).size).toBe(PRIVATE_ROUTE_PATHS.length)
    expect(
      PUBLIC_ROUTE_PATHS.filter((path) => PRIVATE_ROUTE_PATHS.includes(path)),
    ).toEqual([])
  })

  it('Administradora: login, módulo y logout no ensucian consola ni exponen secretos', async () => {
    const probe = collectConsole()
    loginAsRole('Administradora')
    const app = await mountApp('/admin/abonados')

    try {
      expect(getAuthUser()?.role).toBe('Administradora')
      expect(getAuthUser()?.role).not.toBeUndefined()
      expect(app.currentPath()).toBe('/admin/abonados')

      const pathAfterWait = app.currentPath()
      await act(async () => {
        await Promise.resolve()
      })
      expect(app.currentPath()).toBe(pathAfterWait)

      await app.confirmLogout()
      expect(isAuthenticated()).toBe(false)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)

      expect(probe.errors).toEqual([])
      expect(probe.warnings).toEqual([])
      expect(probe.rejections).toEqual([])
      const serialized = serialize(probe, app.container.innerHTML)
      assertNoFrameworkErrors(serialized)
      assertNoSensitiveLogs(serialized)
    } finally {
      probe.restore()
      await app.cleanup()
    }
  })

  it('Abonado: denegación de padrón no entra en loop ni deja rol indefinido', async () => {
    const probe = collectConsole()
    loginAsRole('Abonado')
    const app = await mountApp('/admin/abonados')

    try {
      expect(getAuthUser()?.role).toBe('Abonado')
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)

      await act(async () => {
        await Promise.resolve()
      })
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')

      expect(probe.errors).toEqual([])
      expect(probe.warnings).toEqual([])
      const serialized = serialize(probe, app.container.innerHTML)
      assertNoFrameworkErrors(serialized)
      assertNoSensitiveLogs(serialized)
    } finally {
      probe.restore()
      await app.cleanup()
    }
  })

  it('401 y 403 de API no se registran como éxito ni imprimen JWT', async () => {
    const probe = collectConsole()
    loginAsRole('Administradora')

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => '',
      }),
    )

    await expect(fetchWithAuth('/usuarios')).rejects.toThrow(/401/)
    expect(isAuthenticated()).toBe(true)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => '',
      }),
    )

    await expect(fetchWithAuth('/usuarios')).rejects.toThrow(/403/)
    expect(isAuthenticated()).toBe(true)

    expect(probe.errors).toEqual([])
    expect(probe.warnings).toEqual([])
    assertNoSensitiveLogs(serialize(probe))
    probe.restore()
  })

  it('dashboard autenticado no deja AuthContext ni Router en error', async () => {
    const probe = collectConsole()
    loginAsRole('Administradora')
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(probe.errors).toEqual([])
      expect(probe.warnings).toEqual([])
      assertNoFrameworkErrors(serialize(probe, app.container.innerHTML))
      assertNoSensitiveLogs(serialize(probe, app.container.innerHTML))
    } finally {
      probe.restore()
      await app.cleanup()
    }
  })
})
