import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from '../features/auth/AuthContext'
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
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
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
    clickLink: async (href: string) => {
      const link = container.querySelector<HTMLAnchorElement>(`a[href="${href}"]`)
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

    const app = await mountApp(ADMIN_BASE_PATH)

    try {
      const html = app.container.innerHTML
      const sidebar = html.indexOf('admin-sidebar')
      const header = html.indexOf('admin-header')
      const content = html.indexOf('admin-main__content')

      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(hasAdminChrome(app.container)).toBe(true)
      expect(html).toContain('admin-main')
      expect(outletTitle(app.container)).toBe('Dashboard administrativo')
      expect(app.container.querySelector('.admin-sidebar h1')).toBeNull()
      expect(app.container.querySelector('.admin-header h1')).toBeNull()
      expect(sidebar).toBeGreaterThan(-1)
      expect(sidebar).toBeLessThan(header)
      expect(header).toBeLessThan(content)
      expect(errors).toEqual([])
      expect(warnings).toEqual([])
    } finally {
      console.error = originalError
      console.warn = originalWarn
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
      const sidebar = app.container.querySelector('.admin-sidebar')
      const header = app.container.querySelector('.admin-header')
      const content = app.container.querySelector('.admin-main__content')

      expect(sidebar).not.toBeNull()
      expect(header).not.toBeNull()
      expect(content).not.toBeNull()
      expect(outletTitle(app.container)).toBe('Dashboard administrativo')
      expect(header?.textContent).toContain('Panel administrativo')

      const firstClick = await app.clickSidebarLink('/admin/abonados')
      expect(firstClick.defaultPrevented).toBe(true)
      expect(app.currentPath()).toBe('/admin/abonados')
      expect(app.container.querySelector('.admin-sidebar')).toBe(sidebar)
      expect(app.container.querySelector('.admin-header')).toBe(header)
      expect(app.container.querySelector('.admin-main__content')).toBe(content)
      expect(hasAdminChrome(app.container)).toBe(true)
      expect(outletTitle(app.container)).toBe('Gestión de abonados')
      expect(header?.textContent).toContain('Panel administrativo')
      expect(header?.textContent).not.toContain('Gestión de abonados')
      expect(sidebar?.querySelector('h1')).toBeNull()

      const secondClick = await app.clickSidebarLink('/admin/averias')
      expect(secondClick.defaultPrevented).toBe(true)
      expect(app.currentPath()).toBe('/admin/averias')
      expect(app.container.querySelector('.admin-sidebar')).toBe(sidebar)
      expect(app.container.querySelector('.admin-header')).toBe(header)
      expect(app.container.querySelector('.admin-main__content')).toBe(content)
      expect(hasAdminChrome(app.container)).toBe(true)
      expect(outletTitle(app.container)).toBe('Gestión de averías')
      expect(header?.textContent).toContain('Panel administrativo')
      expect(header?.textContent).not.toContain('Gestión de averías')

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
      expect(app.container.innerHTML).toContain('header__inner')
      expect(app.container.innerHTML).toContain('footer')
      expect(app.container.innerHTML).not.toContain('admin-layout')
      expect(app.container.innerHTML).not.toContain('admin-sidebar')
      expect(app.container.innerHTML).not.toContain('admin-header')
      expect(app.container.innerHTML).not.toContain('Panel administrativo')
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

  it('navega entre Landing, login y panel sin mezclar layouts', async () => {
    const toLogin = await mountApp('/')

    try {
      const loginClick = await toLogin.clickLink('/login')
      expect(loginClick.defaultPrevented).toBe(true)
      expect(toLogin.currentPath()).toBe('/login')
      expect(toLogin.container.innerHTML).toContain('auth-page')
      expect(toLogin.container.innerHTML).not.toContain('admin-layout')
      expect(toLogin.container.innerHTML).not.toContain('admin-sidebar')
      expect(toLogin.container.innerHTML).not.toContain('admin-header')

      const backClick = await toLogin.clickLink('/')
      expect(backClick.defaultPrevented).toBe(true)
      expect(toLogin.currentPath()).toBe('/')
      expect(toLogin.container.innerHTML).toContain('hero')
      expect(toLogin.container.innerHTML).toContain('header__inner')
      expect(hasAdminChrome(toLogin.container)).toBe(false)
    } finally {
      await toLogin.cleanup()
    }

    setAccessToken('token-de-prueba')
    const fromAdmin = await mountApp('/admin/dashboard')

    try {
      expect(hasAdminChrome(fromAdmin.container)).toBe(true)
      expect(outletTitle(fromAdmin.container)).toBe('Dashboard administrativo')
    } finally {
      await fromAdmin.cleanup()
    }

    const publicFromAdminLink = await mountApp('/admin/galeria')

    try {
      const publicClick = await publicFromAdminLink.clickLink('/')
      expect(publicClick.defaultPrevented).toBe(true)
      expect(publicFromAdminLink.currentPath()).toBe('/')
      expect(publicFromAdminLink.container.innerHTML).toContain('hero')
      expect(publicFromAdminLink.container.innerHTML).not.toContain('admin-layout')
      expect(publicFromAdminLink.container.innerHTML).not.toContain('admin-sidebar')
      expect(publicFromAdminLink.container.innerHTML).not.toContain('admin-header')
    } finally {
      await publicFromAdminLink.cleanup()
    }
  })

  it('navega desde la Landing a formularios públicos sin AdminLayout', async () => {
    const app = await mountApp('/')

    try {
      const reportClick = await app.clickLink('/reportar-averia')
      expect(reportClick.defaultPrevented).toBe(true)
      expect(app.currentPath()).toBe('/reportar-averia')
      expect(app.container.innerHTML).toContain(
        'Formulario público de reporte de averías',
      )
      expect(hasAdminChrome(app.container)).toBe(false)
      expect(app.container.innerHTML).not.toContain('admin-sidebar')
      expect(app.container.innerHTML).not.toContain('admin-header')
    } finally {
      await app.cleanup()
    }

    const requests = await mountApp('/')

    try {
      const requestClick = await requests.clickLink('/solicitudes/afiliacion')
      expect(requestClick.defaultPrevented).toBe(true)
      expect(requests.currentPath()).toBe('/solicitudes/afiliacion')
      expect(requests.container.innerHTML).toContain(
        'Formulario público de afiliación',
      )
      expect(hasAdminChrome(requests.container)).toBe(false)
      expect(requests.container.innerHTML).not.toContain('admin-sidebar')
      expect(requests.container.innerHTML).not.toContain('Panel administrativo')
    } finally {
      await requests.cleanup()
    }
  })
})
