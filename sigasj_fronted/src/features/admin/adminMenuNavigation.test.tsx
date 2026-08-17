import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { clearAccessToken, setAccessToken } from '../auth/authStorage'
import AppRoutes from '../../routes/AppRoutes'
import {
  ADMIN_HOME_PATH,
  ADMIN_NAV_ITEMS,
  PRIVATE_ROUTES,
} from '../../routes/privateRoutes'
import AdminSidebar from './AdminSidebar'

const LocationProbe = ({ onPath }: { onPath: (path: string) => void }) => {
  const location = useLocation()

  useEffect(() => {
    onPath(location.pathname)
  }, [location.pathname, onPath])

  return null
}

const outletTitle = (container: HTMLElement) =>
  container.querySelector('.admin-main__content h1')?.textContent ?? ''

const activeNavLink = (container: HTMLElement) =>
  container.querySelector<HTMLAnchorElement>(
    '.admin-sidebar__link[aria-current="page"]',
  )

const clickElement = async (element: Element) => {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    button: 0,
  })

  await act(async () => {
    element.dispatchEvent(event)
  })

  return event
}

const captureConsole = () => {
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

const mockMobileNav = (matches: boolean) => {
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

  await act(async () => {
    await Promise.resolve()
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

describe('navegación del menú administrativo', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    clearAccessToken()
    setAccessToken('token-de-prueba')
    mockMobileNav(false)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '[]',
      }),
    )
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    document.body.style.overflow = ''
    vi.unstubAllGlobals()
    clearAccessToken()
  })

  it('recorre todos los enlaces disponibles sin recargar ni errores de consola', async () => {
    const consoleProbe = captureConsole()
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const sidebar = app.container.querySelector('.admin-sidebar')
      const header = app.container.querySelector('.admin-header')
      const content = app.container.querySelector('.admin-main__content')

      expect(ADMIN_NAV_ITEMS.length).toBeGreaterThan(1)
      expect(sidebar).not.toBeNull()
      expect(header).not.toBeNull()
      expect(content).not.toBeNull()

      for (const { path, title } of ADMIN_NAV_ITEMS) {
        const link = app.container.querySelector<HTMLAnchorElement>(
          `.admin-sidebar__link[href="${path}"]`,
        )
        expect(link, path).not.toBeNull()
        expect(link?.textContent).toContain(title)

        const click = await clickElement(link!)
        expect(click.defaultPrevented, path).toBe(true)
        expect(app.currentPath()).toBe(path)
        expect(app.container.querySelector('.admin-sidebar')).toBe(sidebar)
        expect(app.container.querySelector('.admin-header')).toBe(header)
        expect(app.container.querySelector('.admin-main__content')).toBe(content)
        expect(outletTitle(app.container).length).toBeGreaterThan(0)
        expect(activeNavLink(app.container)?.getAttribute('href')).toBe(path)
        expect(
          app.container.querySelectorAll('.admin-sidebar__link[aria-current="page"]')
            .length,
        ).toBe(1)
      }

      expect(consoleProbe.errors).toEqual([])
      expect(consoleProbe.warnings).toEqual([])
    } finally {
      consoleProbe.restore()
      await app.cleanup()
    }
  })

  it('actualiza el indicador activo al cambiar de módulo', async () => {
    const app = await mountApp('/admin/abonados')

    try {
      expect(activeNavLink(app.container)?.getAttribute('href')).toBe('/admin/abonados')
      expect(activeNavLink(app.container)?.className).toContain(
        'admin-sidebar__link--active',
      )
      expect(outletTitle(app.container)).toBe('Gestión de abonados')

      await clickElement(
        app.container.querySelector('.admin-sidebar__link[href="/admin/averias"]')!,
      )

      expect(app.currentPath()).toBe('/admin/averias')
      expect(activeNavLink(app.container)?.getAttribute('href')).toBe('/admin/averias')
      expect(outletTitle(app.container)).toBe('Gestión de averías')
      expect(app.container.querySelector('[href="/admin/abonados"]')?.className).not.toContain(
        'admin-sidebar__link--active',
      )
    } finally {
      await app.cleanup()
    }
  })

  it('mantiene activa la opción padre en una ruta hija del módulo', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/admin/galeria/foto-12']}>
          <AdminSidebar />
        </MemoryRouter>,
      )
    })

    try {
      const galeria = container.querySelector<HTMLAnchorElement>(
        '.admin-sidebar__link[href="/admin/galeria"]',
      )

      expect(galeria?.getAttribute('aria-current')).toBe('page')
      expect(galeria?.className).toContain('admin-sidebar__link--active')
      expect(container.querySelector('.admin-sidebar__active-mark')).not.toBeNull()
    } finally {
      act(() => {
        root.unmount()
      })
      container.remove()
    }
  })

  it('abre el menú móvil, navega y lo cierra sin ocultar el contenido', async () => {
    mockMobileNav(true)
    const consoleProbe = captureConsole()
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const toggle = app.container.querySelector<HTMLButtonElement>('.admin-menu-toggle')
      expect(toggle).not.toBeNull()
      expect(toggle?.getAttribute('aria-expanded')).toBe('false')

      await clickElement(toggle!)
      expect(toggle?.getAttribute('aria-expanded')).toBe('true')
      expect(app.container.querySelector('.admin-layout--nav-open')).not.toBeNull()
      expect(outletTitle(app.container)).toBe('Dashboard administrativo')

      const click = await clickElement(
        app.container.querySelector('.admin-sidebar__link[href="/admin/solicitudes"]')!,
      )

      expect(click.defaultPrevented).toBe(true)
      expect(app.currentPath()).toBe('/admin/solicitudes')
      expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()
      expect(toggle?.getAttribute('aria-expanded')).toBe('false')
      expect(outletTitle(app.container)).toBe('Gestión de solicitudes')
      expect(activeNavLink(app.container)?.getAttribute('href')).toBe(
        '/admin/solicitudes',
      )
      expect(consoleProbe.errors).toEqual([])
    } finally {
      consoleProbe.restore()
      await app.cleanup()
    }
  })

  it('permite enfocar las opciones y activarlas con teclado', async () => {
    mockMobileNav(true)
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const toggle = app.container.querySelector<HTMLButtonElement>('.admin-menu-toggle')
      const links = [
        ...app.container.querySelectorAll<HTMLAnchorElement>('.admin-sidebar__link'),
      ]

      expect(toggle?.getAttribute('tabindex')).not.toBe('-1')
      toggle?.focus()
      expect(document.activeElement).toBe(toggle)

      await clickElement(toggle!)
      const closeButton = app.container.querySelector<HTMLButtonElement>(
        '.admin-sidebar__close',
      )
      expect(document.activeElement).toBe(closeButton)

      for (const link of links) {
        expect(link.getAttribute('tabindex')).not.toBe('-1')
        link.focus()
        expect(document.activeElement).toBe(link)
      }

      const reportes = links.find((link) => link.getAttribute('href') === '/admin/reportes')
      expect(reportes).toBeDefined()
      reportes?.focus()

      const enter = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      })
      await act(async () => {
        reportes?.dispatchEvent(enter)
        if (!enter.defaultPrevented) {
          reportes?.dispatchEvent(
            new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
          )
        }
      })

      expect(app.currentPath()).toBe('/admin/reportes')
      expect(outletTitle(app.container)).toBe('Gestión de reportes')
      expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('redirige rutas administrativas inexistentes al dashboard sin errores', async () => {
    const consoleProbe = captureConsole()
    const unknownPaths = [
      '/admin/comunicados',
      '/admin/no-existe',
      '/admin/galeria/foto-12',
    ]

    try {
      for (const path of unknownPaths) {
        const app = await mountApp(path)

        try {
          expect(app.currentPath(), path).toBe(ADMIN_HOME_PATH)
          expect(outletTitle(app.container)).toBe('Dashboard administrativo')
          expect(activeNavLink(app.container)?.getAttribute('href')).toBe(
            ADMIN_HOME_PATH,
          )
          expect(app.container.innerHTML).toContain('admin-layout')
          expect(app.container.innerHTML).not.toContain('auth-page')
        } finally {
          await app.cleanup()
        }
      }

      expect(consoleProbe.errors).toEqual([])
      expect(consoleProbe.warnings).toEqual([])
    } finally {
      consoleProbe.restore()
    }
  })

  it('expone en el menú exactamente los módulos configurados como disponibles', async () => {
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const hrefs = [
        ...app.container.querySelectorAll<HTMLAnchorElement>('.admin-sidebar__link'),
      ].map((link) => link.getAttribute('href'))

      expect(hrefs).toEqual(ADMIN_NAV_ITEMS.map(({ path }) => path))
      expect(hrefs).toEqual(
        PRIVATE_ROUTES.filter(({ availableInNav }) => availableInNav).map(
          ({ path }) => path,
        ),
      )
      expect(hrefs).not.toContain('/admin/comunicados')
    } finally {
      await app.cleanup()
    }
  })
})
