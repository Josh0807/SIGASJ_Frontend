import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { clearAccessToken, setAccessToken } from '../features/auth/authStorage'
import AppRoutes from './AppRoutes'
import { ADMIN_BASE_PATH, ADMIN_HOME_PATH } from './privateRoutes'

const LocationProbe = ({ onPath }: { onPath: (path: string) => void }) => {
  const location = useLocation()

  useEffect(() => {
    onPath(location.pathname)
  }, [location.pathname, onPath])

  return null
}

const outletTitle = (container: HTMLElement) =>
  container.querySelector('.admin-main__content h1')?.textContent ?? ''

const hasAdminChrome = (container: HTMLElement) => {
  const html = container.innerHTML
  return (
    html.includes('admin-layout') &&
    html.includes('admin-sidebar') &&
    html.includes('admin-header')
  )
}

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
    clickSidebarLink: async (href: string) => {
      const link = container.querySelector<HTMLAnchorElement>(
        `.admin-sidebar__link[href="${href}"]`,
      )
      expect(link).not.toBeNull()

      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        button: 0,
      })

      await act(async () => {
        link?.dispatchEvent(event)
      })

      return event
    },
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('navegación de rutas administrativas anidadas', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('carga AdminLayout, chrome y dashboard al entrar a /admin', async () => {
    setAccessToken('token-de-prueba')
    const app = await mountApp(ADMIN_BASE_PATH)

    try {
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(hasAdminChrome(app.container)).toBe(true)
      expect(outletTitle(app.container)).toBe('Dashboard administrativo')
      expect(app.container.querySelector('.admin-sidebar h1')).toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('cambia solo el Outlet al navegar entre rutas hijas existentes', async () => {
    setAccessToken('token-de-prueba')
    const app = await mountApp(ADMIN_HOME_PATH)
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

    try {
      expect(outletTitle(app.container)).toBe('Dashboard administrativo')

      const firstClick = await app.clickSidebarLink('/admin/abonados')
      expect(firstClick.defaultPrevented).toBe(true)
      expect(app.currentPath()).toBe('/admin/abonados')
      expect(hasAdminChrome(app.container)).toBe(true)
      expect(outletTitle(app.container)).toBe('Gestión de abonados')

      const secondClick = await app.clickSidebarLink('/admin/averias')
      expect(secondClick.defaultPrevented).toBe(true)
      expect(app.currentPath()).toBe('/admin/averias')
      expect(hasAdminChrome(app.container)).toBe(true)
      expect(outletTitle(app.container)).toBe('Gestión de averías')

      expect(errors).toEqual([])
      expect(warnings).toEqual([])
    } finally {
      console.error = originalError
      console.warn = originalWarn
      await app.cleanup()
    }
  })

  it('abre una ruta hija existente por URL directa dentro del layout', async () => {
    setAccessToken('token-de-prueba')
    const app = await mountApp('/admin/abonados')

    try {
      expect(app.currentPath()).toBe('/admin/abonados')
      expect(hasAdminChrome(app.container)).toBe(true)
      expect(outletTitle(app.container)).toBe('Gestión de abonados')
      expect(app.container.querySelector('.admin-sidebar h1')).toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('mantiene la landing fuera de AdminLayout', async () => {
    const app = await mountApp('/')

    try {
      expect(app.currentPath()).toBe('/')
      expect(app.container.innerHTML).toContain('hero')
      expect(app.container.innerHTML).not.toContain('admin-layout')
      expect(app.container.innerHTML).not.toContain('admin-sidebar')
      expect(app.container.innerHTML).not.toContain('admin-header')
    } finally {
      await app.cleanup()
    }
  })

  it('mantiene el login fuera de AdminLayout', async () => {
    const app = await mountApp('/login')

    try {
      expect(app.currentPath()).toBe('/login')
      expect(app.container.innerHTML).toContain('auth-page')
      expect(app.container.innerHTML).not.toContain('admin-layout')
      expect(app.container.innerHTML).not.toContain('admin-sidebar')
      expect(app.container.innerHTML).not.toContain('admin-header')
    } finally {
      await app.cleanup()
    }
  })
})
