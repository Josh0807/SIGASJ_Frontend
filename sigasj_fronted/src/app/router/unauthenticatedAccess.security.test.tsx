import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from './AppRoutes'
import { AuthProvider } from '../../modules/auth/components/AuthContext'
import {
  clearAccessToken,
  isAuthenticated,
} from '../../modules/auth/utils/authStorage'
import { LocationProbe } from '../../test/location-probe'
import { ADMIN_HOME_PATH, ADMIN_PROFILE_PATH } from './privateRoutes'
import { LOGIN_ROUTE_PATH } from './publicRoutes'

const UNAUTHENTICATED_PRIVATE_PATHS = [
  { label: 'ruta administrativa principal', path: ADMIN_HOME_PATH },
  { label: 'Gestión de asociados', path: '/admin/abonados' },
  { label: 'ruta hija privada existente', path: '/admin/galeria' },
  { label: 'perfil interno privado', path: ADMIN_PROFILE_PATH },
] as const

const assertNoPrivateChrome = (html: string) => {
  expect(html).not.toContain('admin-layout')
  expect(html).not.toContain('admin-sidebar')
  expect(html).not.toContain('admin-header')
  expect(html).not.toContain('Gestión de asociados')
  expect(html).not.toContain('Dashboard administrativo')
  expect(html).not.toContain('Galería de fotografías')
  expect(html).toContain('Iniciar sesión')
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
    submitLogin: async () => {
      const form = container.querySelector<HTMLFormElement>('.auth-page__form')
      expect(form).not.toBeNull()
      await act(async () => {
        form?.requestSubmit()
        await new Promise((resolve) => setTimeout(resolve, 50))
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

describe('seguridad — sin sesión activa', () => {
  beforeEach(() => {
    clearAccessToken()
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
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('cierra sesión con el mecanismo existente y deja de mostrar el panel', async () => {
    const app = await mountApp(LOGIN_ROUTE_PATH)

    try {
      await app.submitLogin()
      expect(isAuthenticated()).toBe(true)
      expect(app.container.innerHTML).toContain('admin-layout')

      await app.logout()

      expect(isAuthenticated()).toBe(false)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).not.toContain('admin-layout')
    } finally {
      await app.cleanup()
    }
  })

  it.each([...UNAUTHENTICATED_PRIVATE_PATHS])(
    'sin sesión, $label ($path) redirige a /login y oculta el chrome privado',
    async ({ path }) => {
      const app = await mountApp(path)

      try {
        expect(isAuthenticated()).toBe(false)
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        assertNoPrivateChrome(app.container.innerHTML)
      } finally {
        await app.cleanup()
      }
    },
  )

  it('tras logout, el acceso directo a rutas privadas vuelve a /login', async () => {
    const app = await mountApp(LOGIN_ROUTE_PATH)

    try {
      await app.submitLogin()
      await app.logout()

      for (const { path } of UNAUTHENTICATED_PRIVATE_PATHS) {
        const next = await mountApp(path)
        try {
          expect(isAuthenticated()).toBe(false)
          expect(next.currentPath()).toBe(LOGIN_ROUTE_PATH)
          assertNoPrivateChrome(next.container.innerHTML)
        } finally {
          await next.cleanup()
        }
      }
    } finally {
      await app.cleanup()
    }
  })
})
