import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from '../../modules/auth/components/AuthContext'
import {
  clearAccessToken,
  getAccessToken,
} from '../../modules/auth/utils/authStorage'
import { loginWithAdminSession } from '../../test/authTestHelpers'
import AppRoutes from './AppRoutes'
import { ADMIN_BASE_PATH, ADMIN_HOME_PATH, PRIVATE_ROUTE_PATHS } from './privateRoutes'
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
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
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
        expect(app.container.innerHTML).not.toContain('Gestión de asociados')
        expect(app.container.innerHTML).not.toContain('Módulo privado')
      } finally {
        await app.cleanup()
      }
    }
  })

  it('Caso 3 — con sesión válida muestra AdminLayout, sidebar, header y contenido', async () => {
    loginWithAdminSession()
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
    loginWithAdminSession()
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

  it('Prueba 1 — acceso directo a /admin/abonados con sesión carga layout y Outlet', async () => {
    loginWithAdminSession()
    const errors: unknown[] = []
    const warnings: unknown[] = []
    const originalError = console.error
    const originalWarn = console.warn
    console.error = (...args: unknown[]) => {
      errors.push(args)
    }
    console.warn = (...args: unknown[]) => {
      warnings.push(args)
    }

    const app = await mountApp('/admin/abonados')

    try {
      expect(getAccessToken()).toBe('token-de-prueba')
      expect(app.currentPath()).toBe('/admin/abonados')
      expect(app.container.innerHTML).toContain('admin-layout')
      expect(app.container.innerHTML).toContain('admin-sidebar')
      expect(app.container.innerHTML).toContain('admin-header')
      expect(app.container.querySelector('.admin-main__content')?.textContent).toContain(
        'Gestión de asociados',
      )
      expect(app.container.querySelector('.admin-sidebar h1')).toBeNull()
      expect(app.container.innerHTML).not.toContain('No se encontró')
      expect(errors).toEqual([])
      expect(warnings).toEqual([])
    } finally {
      console.error = originalError
      console.warn = originalWarn
      await app.cleanup()
    }
  })

  it('Prueba 2 — recargar /admin/abonados conserva layout y contenido', async () => {
    loginWithAdminSession()
    const firstLoad = await mountApp('/admin/abonados')

    try {
      expect(firstLoad.currentPath()).toBe('/admin/abonados')
      expect(firstLoad.container.querySelector('.admin-main__content')?.textContent).toContain(
        'Gestión de asociados',
      )
    } finally {
      await firstLoad.cleanup()
    }

    const errors: unknown[] = []
    const warnings: unknown[] = []
    const originalError = console.error
    const originalWarn = console.warn
    console.error = (...args: unknown[]) => {
      errors.push(args)
    }
    console.warn = (...args: unknown[]) => {
      warnings.push(args)
    }

    const reload = await mountApp('/admin/abonados')

    try {
      expect(getAccessToken()).toBe('token-de-prueba')
      expect(reload.currentPath()).toBe('/admin/abonados')
      expect(reload.container.innerHTML.trim()).not.toBe('')
      expect(reload.container.innerHTML).toContain('admin-layout')
      expect(reload.container.innerHTML).toContain('admin-sidebar')
      expect(reload.container.innerHTML).toContain('admin-header')
      expect(reload.container.querySelector('.admin-main__content')?.textContent).toContain(
        'Gestión de asociados',
      )
      expect(reload.container.innerHTML).not.toContain('auth-page')
      expect(errors).toEqual([])
      expect(warnings).toEqual([])
    } finally {
      console.error = originalError
      console.warn = originalWarn
      await reload.cleanup()
    }
  })

  it('redirige una ruta administrativa inexistente al dashboard sin romper el panel', async () => {
    loginWithAdminSession()
    const errors: unknown[] = []
    const warnings: unknown[] = []
    const originalError = console.error
    const originalWarn = console.warn
    console.error = (...args: unknown[]) => {
      errors.push(args)
    }
    console.warn = (...args: unknown[]) => {
      warnings.push(args)
    }

    const app = await mountApp('/admin/ruta-inexistente')

    try {
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(app.container.innerHTML.trim()).not.toBe('')
      expect(app.container.innerHTML).toContain('admin-layout')
      expect(app.container.innerHTML).toContain('admin-sidebar')
      expect(app.container.innerHTML).toContain('admin-header')
      expect(app.container.querySelector('.admin-main__content')?.textContent).toContain(
        'Dashboard administrativo',
      )
      expect(app.container.querySelector('.admin-main__content')?.textContent).not.toContain(
        'Gestión de asociados',
      )
      expect(app.container.innerHTML).not.toContain('auth-page')
      expect(errors).toEqual([])
      expect(warnings).toEqual([])
    } finally {
      console.error = originalError
      console.warn = originalWarn
      await app.cleanup()
    }
  })

  it('audita la consola al cargar cada ruta administrativa existente', async () => {
    loginWithAdminSession()
    const findings: Record<string, { errors: unknown[]; warnings: unknown[] }> = {}

    for (const path of PRIVATE_ROUTE_PATHS) {
      const errors: unknown[] = []
      const warnings: unknown[] = []
      const originalError = console.error
      const originalWarn = console.warn
      console.error = (...args: unknown[]) => {
        errors.push(args)
      }
      console.warn = (...args: unknown[]) => {
        warnings.push(args)
      }

      const app = await mountApp(path)

      try {
        findings[path] = { errors: [...errors], warnings: [...warnings] }
        expect(app.container.innerHTML).toContain('admin-layout')
      } finally {
        console.error = originalError
        console.warn = originalWarn
        await app.cleanup()
      }
    }

    for (const path of PRIVATE_ROUTE_PATHS) {
      expect(findings[path].errors, path).toEqual([])
      expect(findings[path].warnings, path).toEqual([])
    }
  })

  it('Caso 5 — al eliminar la sesión el panel deja de ser accesible', async () => {
    loginWithAdminSession()
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
