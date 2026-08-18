import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, useLocation } from 'react-router-dom'
import {
  clearAccessToken,
  setAccessToken,
  setAuthUser,
} from '../../auth/utils/authStorage'
import AppRoutes from '../../../app/router/AppRoutes'
import { ADMIN_HOME_PATH } from '../../../app/router/privateRoutes'
import { LOGIN_ROUTE_PATH } from '../../../app/router/publicRoutes'

const LocationProbe = ({ onPath }: { onPath: (path: string) => void }) => {
  const location = useLocation()

  useEffect(() => {
    onPath(location.pathname)
  }, [location.pathname, onPath])

  return null
}

const outletTitle = (container: HTMLElement) =>
  container.querySelector('.admin-main__content h1')?.textContent ?? ''

const collectConsole = () => {
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

  return {
    errors,
    warnings,
    restore: () => {
      console.error = originalError
      console.warn = originalWarn
    },
  }
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

      await act(async () => {
        link?.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
        )
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

const renderPath = (path: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )

const mockMobileNav = (matches: boolean) => {
  const original = window.matchMedia
  window.matchMedia = ((query: string) => ({
    matches: query.includes('760px') ? matches : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia

  return () => {
    window.matchMedia = original
  }
}

describe('AdminHeader — pruebas funcionales', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('Prueba 1 — panel administrativo con sesión válida', async () => {
    setAccessToken('token-de-prueba')
    setAuthUser({
      name: 'Usuario',
      lastName: 'Administrador',
      role: 'ADMINISTRADORA',
    })

    const consoleSpy = collectConsole()
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const html = app.container.innerHTML
      const layoutIndex = html.indexOf('admin-layout')
      const sidebarIndex = html.indexOf('admin-sidebar')
      const headerIndex = html.indexOf('admin-header')
      const contentIndex = html.indexOf('admin-main__content')

      expect(app.container.querySelector('.admin-header')).not.toBeNull()
      expect(app.container.querySelector('.admin-layout')).not.toBeNull()
      expect(app.container.querySelector('.admin-sidebar')).not.toBeNull()
      expect(app.container.querySelector('.admin-main__content')).not.toBeNull()
      expect(outletTitle(app.container)).toBe('Dashboard administrativo')
      expect(layoutIndex).toBeGreaterThan(-1)
      expect(sidebarIndex).toBeGreaterThan(layoutIndex)
      expect(headerIndex).toBeGreaterThan(sidebarIndex)
      expect(contentIndex).toBeGreaterThan(headerIndex)
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 2 — cambio de ruta mantiene AdminHeader y AdminSidebar', async () => {
    setAccessToken('token-de-prueba')
    setAuthUser({ name: 'Ana', role: 'SECRETARIA' })

    const consoleSpy = collectConsole()
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const sidebar = app.container.querySelector('.admin-sidebar')
      const header = app.container.querySelector('.admin-header')
      const content = app.container.querySelector('.admin-main__content')

      expect(outletTitle(app.container)).toBe('Dashboard administrativo')

      await app.clickSidebarLink('/admin/galeria')
      expect(app.currentPath()).toBe('/admin/galeria')
      expect(app.container.querySelector('.admin-sidebar')).toBe(sidebar)
      expect(app.container.querySelector('.admin-header')).toBe(header)
      expect(app.container.querySelector('.admin-main__content')).toBe(content)
      expect(outletTitle(app.container)).toBe('Galería de fotografías')
      expect(header?.textContent).toContain('Panel administrativo')

      await app.clickSidebarLink('/admin/transparencia')
      expect(app.currentPath()).toBe('/admin/transparencia')
      expect(app.container.querySelector('.admin-header')).toBe(header)
      expect(app.container.querySelector('.admin-sidebar')).toBe(sidebar)
      expect(outletTitle(app.container)).toBe('Transparencia y calidad del agua')

      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 3 — información del usuario disponible y campos opcionales ausentes', async () => {
    setAccessToken('token-de-prueba')
    setAuthUser({
      name: 'María',
      lastName: 'Solís',
      role: 'ADMINISTRADORA',
      email: 'maria@sigasj.local',
    })

    const fullUserApp = await mountApp(ADMIN_HOME_PATH)

    try {
      const header = fullUserApp.container.querySelector('.admin-header')
      expect(header?.textContent).toContain('María Solís')
      expect(header?.textContent).toContain('Administradora')
      expect(header?.querySelector('.admin-header__avatar')).not.toBeNull()
      expect(
        fullUserApp.container.querySelector('.visually-hidden')?.textContent,
      ).toContain('María Solís')
    } finally {
      await fullUserApp.cleanup()
    }

    clearAccessToken()
    setAccessToken('token-sin-perfil')

    const partialUserApp = await mountApp(ADMIN_HOME_PATH)

    try {
      const header = partialUserApp.container.querySelector('.admin-header')
      expect(header?.textContent).toContain('Sesión administrativa')
      expect(header?.textContent).toContain('SIGASJ')
      expect(header?.querySelector('.admin-header__user-detail')).not.toBeNull()
    } finally {
      await partialUserApp.cleanup()
    }

    clearAccessToken()
    setAccessToken('token-nombre-solo')
    setAuthUser({ name: 'Ana' })

    const nameOnlyApp = await mountApp(ADMIN_HOME_PATH)

    try {
      const header = nameOnlyApp.container.querySelector('.admin-header')
      expect(header?.textContent).toContain('Ana')
      expect(header?.querySelector('.admin-header__user-detail')).toBeNull()
      expect(
        nameOnlyApp.container.querySelector('.visually-hidden')?.textContent,
      ).toBe('Ana')
    } finally {
      await nameOnlyApp.cleanup()
    }
  })

  it('Prueba 4 — menú móvil invoca el sidebar y actualiza aria-expanded', async () => {
    setAccessToken('token-de-prueba')
    setAuthUser({ name: 'Ana', role: 'SECRETARIA' })

    const restoreMatchMedia = mockMobileNav(true)
    const consoleSpy = collectConsole()
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const toggle = app.container.querySelector<HTMLButtonElement>(
        '.admin-menu-toggle',
      )

      expect(toggle).not.toBeNull()
      expect(toggle?.getAttribute('aria-expanded')).toBe('false')
      expect(toggle?.getAttribute('aria-controls')).toBe('admin-navigation')
      expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()

      await act(async () => {
        toggle?.click()
      })

      expect(toggle?.getAttribute('aria-expanded')).toBe('true')
      expect(app.container.querySelector('.admin-layout--nav-open')).not.toBeNull()
      expect(app.container.querySelector('.admin-nav-backdrop')).not.toBeNull()
      expect(app.container.querySelector('#admin-navigation')).not.toBeNull()
      expect(outletTitle(app.container)).toBe('Dashboard administrativo')

      await act(async () => {
        toggle?.click()
      })

      expect(toggle?.getAttribute('aria-expanded')).toBe('false')
      expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
      restoreMatchMedia()
      await app.cleanup()
    }
  })

  it('Prueba 5 — Landing Page no muestra AdminHeader', () => {
    setAccessToken('token-de-prueba')
    setAuthUser({ name: 'Ana' })

    const consoleSpy = collectConsole()

    try {
      const markup = renderPath('/')

      expect(markup).toContain('hero')
      expect(markup).toContain('header__inner')
      expect(markup).not.toContain('admin-header')
      expect(markup).not.toContain('admin-layout')
      expect(markup).not.toContain('admin-sidebar')
      expect(markup).not.toContain('Panel administrativo')
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
    }
  })

  it('Prueba 6 — Login no muestra AdminHeader', async () => {
    const consoleSpy = collectConsole()

    try {
      const markup = renderPath(LOGIN_ROUTE_PATH)

      expect(markup).toContain('auth-page')
      expect(markup).not.toContain('admin-header')
      expect(markup).not.toContain('admin-layout')
      expect(markup).not.toContain('admin-sidebar')
      expect(markup).not.toContain('Panel administrativo')

      const app = await mountApp(LOGIN_ROUTE_PATH)
      expect(app.container.querySelector('.admin-header')).toBeNull()
      expect(app.container.querySelector('.auth-page')).not.toBeNull()
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
      await app.cleanup()
    } finally {
      consoleSpy.restore()
    }
  })
})
