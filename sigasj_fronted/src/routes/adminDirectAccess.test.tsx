import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../features/auth/authStorage'
import AppRoutes from './AppRoutes'
import { ADMIN_BASE_PATH, ADMIN_HOME_PATH } from './privateRoutes'
import { LOGIN_ROUTE_PATH } from './publicRoutes'

const LocationProbe = ({ onPath }: { onPath: (path: string) => void }) => {
  const location = useLocation()

  useEffect(() => {
    onPath(location.pathname)
  }, [location.pathname, onPath])

  return null
}

const hasAdminChrome = (html: string) =>
  html.includes('admin-layout') ||
  html.includes('admin-sidebar') ||
  html.includes('admin-header')

const mountApp = async (path: string) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  let pathname = path

  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <LocationProbe
          onPath={(nextPath) => {
            pathname = nextPath
          }}
        />
        <AppRoutes />
      </MemoryRouter>,
    )
  })

  return {
    container,
    currentPath: () => pathname,
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('acceso directo a rutas administrativas', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('Caso 1 — /admin sin sesión no muestra AdminLayout y redirige a /login', async () => {
    const app = await mountApp(ADMIN_BASE_PATH)

    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('auth-page')
      expect(app.container.innerHTML).not.toContain('admin-layout')
      expect(app.container.innerHTML).not.toContain('admin-sidebar')
      expect(app.container.innerHTML).not.toContain('admin-header')
      expect(app.container.innerHTML).not.toContain('Dashboard administrativo')
    } finally {
      await app.cleanup()
    }
  })

  it('Caso 2 — ruta hija sin sesión no muestra contenido privado y redirige a /login', async () => {
    for (const path of ['/admin/abonados'] as const) {
      const app = await mountApp(path)

      try {
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        expect(app.container.innerHTML).toContain('auth-page')
        expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
        expect(app.container.innerHTML).not.toContain('Gestión de abonados')
        expect(app.container.innerHTML).not.toContain('Módulo privado')
      } finally {
        await app.cleanup()
      }
    }
  })

  it('Caso 3 — con sesión válida muestra AdminLayout, sidebar, header y contenido', async () => {
    setAccessToken('token-de-prueba')
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(app.container.innerHTML).toContain('admin-layout')
      expect(app.container.innerHTML).toContain('admin-sidebar')
      expect(app.container.innerHTML).toContain('admin-header')
      expect(app.container.querySelector('.admin-main__content')?.textContent).toContain(
        'Dashboard administrativo',
      )
    } finally {
      await app.cleanup()
    }
  })

  it('Caso 4 — recargar una ruta administrativa conserva el panel si el token sigue en storage', async () => {
    setAccessToken('token-de-prueba')
    const firstLoad = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(firstLoad.container.innerHTML).toContain('admin-layout')
      expect(getAccessToken()).toBe('token-de-prueba')
    } finally {
      await firstLoad.cleanup()
    }

    const reload = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(getAccessToken()).toBe('token-de-prueba')
      expect(reload.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(reload.container.innerHTML).toContain('admin-layout')
      expect(reload.container.innerHTML).toContain('admin-sidebar')
      expect(reload.container.innerHTML).toContain('admin-header')
      expect(reload.container.querySelector('.admin-main__content')?.textContent).toContain(
        'Dashboard administrativo',
      )
    } finally {
      await reload.cleanup()
    }
  })

  it('Caso 5 — al eliminar la sesión el panel deja de ser accesible', async () => {
    setAccessToken('token-de-prueba')
    const withSession = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(withSession.container.innerHTML).toContain('admin-layout')
    } finally {
      await withSession.cleanup()
    }

    clearAccessToken()
    const afterLogout = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(getAccessToken()).toBeNull()
      expect(afterLogout.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(afterLogout.container.innerHTML).toContain('auth-page')
      expect(hasAdminChrome(afterLogout.container.innerHTML)).toBe(false)
    } finally {
      await afterLogout.cleanup()
    }
  })
})
