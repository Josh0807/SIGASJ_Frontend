import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AppRoutes from './AppRoutes'
import { AuthProvider } from '../../modules/auth/components/AuthContext'
import {
  clearAuthSession,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
  setAuthSession,
} from '../../modules/auth/utils/authStorage'
import { fetchWithAuth } from '../../services/http/httpClient'

vi.mock('../../modules/auth/services/authApi', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('../../modules/auth/services/authApi')
  >()

  return {
    ...actual,
    fetchCurrentUser: vi.fn(async () => {
      const user = getAuthUser()
      if (!user?.id || !user.role) throw new Error('Sesion de prueba ausente')
      return {
        id: user.id,
        email: user.email ?? 'usuario@asadasanjuan.cr',
        role: user.role,
        name: user.name ?? 'Usuario anterior',
      }
    }),
  }
})

const LocationProbe = ({ onPath }: { onPath: (path: string) => void }) => {
  const { pathname } = useLocation()
  onPath(pathname)
  return null
}

const mountApp = async (path: string) => {
  let currentPath = path
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: (
          <AuthProvider>
            <LocationProbe onPath={(next) => (currentPath = next)} />
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
    await Promise.resolve()
  })

  return {
    container,
    router,
    currentPath: () => currentPath,
    cleanup: async () => {
      await act(async () => root.unmount())
      container.remove()
    },
  }
}

const logoutFromHeader = async (container: HTMLElement) => {
  const accountTrigger = container.querySelector<HTMLButtonElement>(
    '.admin-account-menu__trigger',
  )
  expect(accountTrigger).not.toBeNull()
  await act(async () => accountTrigger?.click())

  const logoutButton = container.querySelector<HTMLButtonElement>(
    '.admin-account-menu__item--danger',
  )
  expect(logoutButton).not.toBeNull()
  await act(async () => logoutButton?.click())

  const confirmButton = container.querySelector<HTMLButtonElement>(
    '.confirm-dialog__button--danger',
  )
  expect(confirmButton).not.toBeNull()
  await act(async () => confirmButton?.click())
}

describe('aceptacion full-stack simulada - logout y expiracion', () => {
  beforeEach(() => {
    clearAuthSession()
  })

  afterEach(() => {
    clearAuthSession()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it.each(['Administradora', 'Secretaria', 'Fontanero'] as const)(
    '%s: logout manual bloquea regreso y recarga de ruta privada',
    async (role) => {
      setAuthSession({
        accessToken: `token-${role.toLowerCase()}`,
        user: { id: role, role, name: `Usuario ${role}` },
      })
      const app = await mountApp('/admin/dashboard')

      try {
        expect(app.currentPath()).toBe('/admin/dashboard')
        expect(app.container.innerHTML).toContain('admin-layout')
        expect(app.container.textContent).toContain(`Usuario ${role}`)

        await logoutFromHeader(app.container)

        expect(isAuthenticated()).toBe(false)
        expect(getAccessToken()).toBeNull()
        expect(getAuthUser()).toBeNull()
        expect(app.currentPath()).toBe('/login')
        expect(app.container.textContent).toContain('Iniciar sesi')
        expect(app.container.textContent).not.toContain(`Usuario ${role}`)
        expect(app.container.innerHTML).not.toContain('admin-layout')

        await act(async () => {
          await app.router.navigate('/admin/dashboard')
        })
        expect(app.currentPath()).toBe('/login')
        expect(app.container.innerHTML).not.toContain('admin-layout')
      } finally {
        await app.cleanup()
      }

      const reload = await mountApp('/admin/dashboard')
      try {
        expect(reload.currentPath()).toBe('/login')
        expect(reload.container.textContent).toContain('Iniciar sesi')
        expect(reload.container.textContent).not.toContain(`Usuario ${role}`)
        expect(reload.container.innerHTML).not.toContain('admin-layout')
      } finally {
        await reload.cleanup()
      }
    },
  )

  it('token vencido limpia identidad, redirige y muestra aviso sin repetir requests', async () => {
    setAuthSession({
      accessToken: 'token-vencido',
      user: { id: '1', role: 'Administradora', name: 'Usuario anterior' },
    })
    const app = await mountApp('/admin/dashboard')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => '',
    })
    vi.stubGlobal('fetch', fetchMock)

    try {
      await act(async () => {
        await expect(fetchWithAuth('/datos-privados')).rejects.toThrow(/401/)
      })

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(isAuthenticated()).toBe(false)
      expect(getAuthUser()).toBeNull()
      expect(app.currentPath()).toBe('/login')
      expect(app.container.textContent).toContain('Tu sesión expiró')
      expect(app.container.textContent).not.toContain('Usuario anterior')
      expect(app.container.innerHTML).not.toContain('admin-layout')
    } finally {
      await app.cleanup()
    }
  })
})
