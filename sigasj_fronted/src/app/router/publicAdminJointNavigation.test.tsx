import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from '../../modules/auth/components/AuthContext'
import { clearAccessToken } from '../../modules/auth/utils/authStorage'
import { loginWithAdminSession } from '../../test/authTestHelpers'
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

const outletTitle = (container: HTMLElement) =>
  container.querySelector('.admin-main__content h1')?.textContent ?? ''

const hasAdminChrome = (html: string) =>
  html.includes('admin-layout') ||
  html.includes('admin-sidebar') ||
  html.includes('admin-header') ||
  html.includes('Panel administrativo')

const clickHref = async (container: HTMLElement, href: string) => {
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
}

const mountApp = async (path: string) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  let pathname = path
  const snapshots: string[] = []
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

  const observer = new MutationObserver(() => {
    snapshots.push(container.innerHTML)
  })
  observer.observe(container, {
    childList: true,
    subtree: true,
    characterData: true,
  })

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

  snapshots.push(container.innerHTML)

  return {
    container,
    currentPath: () => pathname,
    snapshots,
    errors,
    warnings,
    cleanup: async () => {
      observer.disconnect()
      console.error = originalError
      console.warn = originalWarn
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('navegación conjunta entre área pública y administrativa', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('sin sesión recorre las rutas públicas y envía /admin a login', async () => {
    const publicArea = await mountApp('/')

    try {
      expect(publicArea.currentPath()).toBe('/')
      expect(publicArea.container.innerHTML).toContain('hero')
      expect(publicArea.container.innerHTML).toContain('header__inner')
      expect(hasAdminChrome(publicArea.container.innerHTML)).toBe(false)
      expect(publicArea.errors).toEqual([])
      expect(publicArea.warnings).toEqual([])

      const toLogin = await clickHref(publicArea.container, LOGIN_ROUTE_PATH)
      expect(toLogin.defaultPrevented).toBe(true)
      expect(publicArea.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(publicArea.container.innerHTML).toContain('auth-page')
      expect(hasAdminChrome(publicArea.container.innerHTML)).toBe(false)

      const backHome = await clickHref(publicArea.container, '/')
      expect(backHome.defaultPrevented).toBe(true)
      expect(publicArea.currentPath()).toBe('/')

      const toFaults = await clickHref(publicArea.container, '/reportar-averia')
      expect(toFaults.defaultPrevented).toBe(true)
      expect(publicArea.currentPath()).toBe('/reportar-averia')
      expect(publicArea.container.innerHTML).toContain(
        'Formulario público de reporte de averías',
      )
      expect(hasAdminChrome(publicArea.container.innerHTML)).toBe(false)
      expect(publicArea.errors).toEqual([])
      expect(publicArea.warnings).toEqual([])
    } finally {
      await publicArea.cleanup()
    }

    const requests = await mountApp('/')

    try {
      const toRequests = await clickHref(requests.container, '/solicitudes/afiliacion')
      expect(toRequests.defaultPrevented).toBe(true)
      expect(requests.currentPath()).toBe('/solicitudes/afiliacion')
      expect(requests.container.innerHTML).toContain('Formulario público de afiliación')
      expect(hasAdminChrome(requests.container.innerHTML)).toBe(false)
      expect(requests.errors).toEqual([])
      expect(requests.warnings).toEqual([])
    } finally {
      await requests.cleanup()
    }

    const adminAttempt = await mountApp(ADMIN_BASE_PATH)

    try {
      expect(adminAttempt.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(adminAttempt.container.innerHTML).toContain('auth-page')
      expect(hasAdminChrome(adminAttempt.container.innerHTML)).toBe(false)
      expect(
        adminAttempt.snapshots.some((html) => hasAdminChrome(html)),
      ).toBe(false)
      expect(adminAttempt.errors).toEqual([])
      expect(adminAttempt.warnings).toEqual([])
    } finally {
      await adminAttempt.cleanup()
    }
  })

  it('con sesión abre /admin, carga la hija en AdminLayout y cambia solo el contenido', async () => {
    loginWithAdminSession()
    const app = await mountApp(ADMIN_BASE_PATH)

    try {
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(app.container.innerHTML).toContain('admin-layout')
      expect(app.container.innerHTML).toContain('admin-sidebar')
      expect(app.container.innerHTML).toContain('admin-header')
      expect(outletTitle(app.container)).toBe('Dashboard administrativo')

      const toAbonados = await clickHref(app.container, '/admin/abonados')
      expect(toAbonados.defaultPrevented).toBe(true)
      expect(app.currentPath()).toBe('/admin/abonados')
      expect(app.container.innerHTML).toContain('admin-layout')
      expect(app.container.innerHTML).toContain('admin-sidebar')
      expect(app.container.innerHTML).toContain('admin-header')
      expect(outletTitle(app.container)).toBe('Gestión de abonados')

      const toAverias = await clickHref(app.container, '/admin/averias')
      expect(toAverias.defaultPrevented).toBe(true)
      expect(app.currentPath()).toBe('/admin/averias')
      expect(app.container.innerHTML).toContain('admin-sidebar')
      expect(app.container.innerHTML).toContain('admin-header')
      expect(outletTitle(app.container)).toBe('Gestión de averías')
      expect(app.errors).toEqual([])
      expect(app.warnings).toEqual([])
    } finally {
      await app.cleanup()
    }
  })

  it('no muestra contenido administrativo ni un instante al redirigir sin sesión', async () => {
    const staticMarkup = renderToStaticMarkup(
      <MemoryRouter initialEntries={[ADMIN_BASE_PATH]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(hasAdminChrome(staticMarkup)).toBe(false)
    expect(staticMarkup).not.toContain('Dashboard administrativo')
    expect(staticMarkup).not.toContain('Módulo privado')

    const app = await mountApp('/admin/abonados')

    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.snapshots.every((html) => !hasAdminChrome(html))).toBe(true)
      expect(app.container.innerHTML).toContain('auth-page')
      expect(app.container.innerHTML).not.toContain('Gestión de abonados')
      expect(app.errors).toEqual([])
      expect(app.warnings).toEqual([])
    } finally {
      await app.cleanup()
    }
  })
})
