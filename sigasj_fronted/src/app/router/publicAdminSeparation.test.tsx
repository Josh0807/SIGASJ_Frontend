import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from '../../modules/auth/components/AuthContext'
import { clearAccessToken } from '../../modules/auth/utils/authStorage'
import { loginWithAdminSession } from '../../test/authTestHelpers'
import AppRoutes from './AppRoutes'
import { PRIVATE_ROUTE_PATHS } from './privateRoutes'
import { PUBLIC_ROUTE_PATHS } from './publicRoutes'

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

  const click = async (selector: string) => {
    const link = container.querySelector<HTMLAnchorElement>(selector)
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
  }

  return {
    container,
    currentPath: () => pathname,
    errors,
    warnings,
    click,
    cleanup: async () => {
      console.error = originalError
      console.warn = originalWarn
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('separación entre interfaz pública y administrativa', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('Prueba 1 — Landing Page en / sin chrome administrativo', async () => {
    const app = await mountApp('/')

    try {
      expect(app.currentPath()).toBe('/')
      expect(app.container.innerHTML).toContain('hero')
      expect(app.container.innerHTML).toContain('class="header"')
      expect(app.container.innerHTML).toContain('header__inner')
      expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
      expect(app.errors).toEqual([])
      expect(app.warnings).toEqual([])
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 2 — Login sin AdminSidebar ni AdminHeader', async () => {
    const app = await mountApp('/login')

    try {
      expect(app.currentPath()).toBe('/login')
      expect(app.container.innerHTML).toContain('auth-page')
      expect(app.container.innerHTML).not.toContain('admin-sidebar')
      expect(app.container.innerHTML).not.toContain('admin-header')
      expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
      expect(app.errors).toEqual([])
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 3 — Formulario público de averías por URL directa', async () => {
    const app = await mountApp('/reportar-averia')

    try {
      expect(app.currentPath()).toBe('/reportar-averia')
      expect(app.container.innerHTML).toContain(
        'Formulario público de reporte de averías',
      )
      expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
      expect(app.errors).toEqual([])
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 4 — Solicitudes públicas por URL directa', async () => {
    const app = await mountApp('/solicitudes/afiliacion')

    try {
      expect(app.currentPath()).toBe('/solicitudes/afiliacion')
      expect(app.container.innerHTML).toContain('Formulario público de afiliación')
      expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
      expect(app.errors).toEqual([])
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 5 — Ruta administrativa existente carga AdminLayout', async () => {
    loginWithAdminSession()
    const app = await mountApp('/admin/dashboard')

    try {
      expect(app.container.innerHTML).toContain('admin-layout')
      expect(app.container.innerHTML).toContain('admin-sidebar')
      expect(app.container.innerHTML).toContain('admin-header')
      expect(app.container.querySelector('.admin-main__content')?.textContent).toContain(
        'Dashboard administrativo',
      )
      expect(app.errors).toEqual([])
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 6 — Navegación entre módulos mantiene sidebar y header', async () => {
    loginWithAdminSession()
    const app = await mountApp('/admin/dashboard')

    try {
      const first = await app.click('.admin-sidebar__link[href="/admin/abonados"]')
      expect(first.defaultPrevented).toBe(true)
      expect(app.currentPath()).toBe('/admin/abonados')
      expect(app.container.innerHTML).toContain('admin-sidebar')
      expect(app.container.innerHTML).toContain('admin-header')
      expect(app.container.querySelector('.admin-main__content')?.textContent).toContain(
        'Gestión de abonados',
      )

      const second = await app.click('.admin-sidebar__link[href="/admin/averias"]')
      expect(second.defaultPrevented).toBe(true)
      expect(app.currentPath()).toBe('/admin/averias')
      expect(app.container.innerHTML).toContain('admin-sidebar')
      expect(app.container.innerHTML).toContain('admin-header')
      expect(app.container.querySelector('.admin-main__content')?.textContent).toContain(
        'Gestión de averías',
      )
      expect(app.errors).toEqual([])
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 7 — Al volver al sitio público deja de usarse AdminLayout', async () => {
    loginWithAdminSession()
    const app = await mountApp('/admin/galeria')

    try {
      expect(app.container.innerHTML).toContain('admin-layout')
      const publicClick = await app.click('a[href="/"]')
      expect(publicClick.defaultPrevented).toBe(true)
      expect(app.currentPath()).toBe('/')
      expect(app.container.innerHTML).toContain('hero')
      expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 8 — URL directa pública no muestra componentes administrativos', async () => {
    for (const path of PUBLIC_ROUTE_PATHS) {
      const app = await mountApp(path)

      try {
        expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
        expect(app.errors).toEqual([])
      } finally {
        await app.cleanup()
      }
    }
  })

  it('Prueba 9 — URL directa administrativa carga AdminLayout con acceso', async () => {
    loginWithAdminSession()

    for (const path of ['/admin/abonados', '/admin/averias'] as const) {
      const app = await mountApp(path)

      try {
        expect(app.currentPath()).toBe(path)
        expect(app.container.innerHTML).toContain('admin-layout')
        expect(app.container.innerHTML).toContain('admin-sidebar')
        expect(app.container.innerHTML).toContain('admin-header')
        expect(app.container.querySelector('.admin-main__content')).not.toBeNull()
        expect(app.errors).toEqual([])
      } finally {
        await app.cleanup()
      }
    }

    expect(PRIVATE_ROUTE_PATHS).toContain('/admin/abonados')
    expect(PRIVATE_ROUTE_PATHS).toContain('/admin/averias')
  })
})
