import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from '../../../app/router/AppRoutes'
import { ADMIN_HOME_PATH } from '../../../app/router/privateRoutes'
import {
  clearAccessToken,
  setAuthSession,
} from '../../auth/utils/authStorage'
import { AuthProvider } from '../../auth/components/AuthContext'

const MOBILE_NAV_QUERY = '(max-width: 760px)'

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

const mountApp = async (path: string) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )
  })

  return {
    container,
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

const click = async (element: Element) => {
  await act(async () => {
    element.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
    )
  })
}

describe('AdminHeader — menú móvil (pruebas funcionales)', () => {
  let restoreMatchMedia: (() => void) | undefined

  beforeEach(() => {
    clearAccessToken()
    setAuthSession({
      accessToken: 'token-mobile-menu',
      user: { name: 'Ana', role: 'Secretaria' },
    })
  })

  afterEach(() => {
    restoreMatchMedia?.()
    restoreMatchMedia = undefined
    document.body.style.overflow = ''
    document.body.innerHTML = ''
  })

  it('Prueba 1 — visualización del botón según breakpoint móvil existente', async () => {
    const css = readFileSync(
      resolve(process.cwd(), 'src/index.css'),
      'utf8',
    )

    expect(css).toContain('@media (max-width: 760px)')
    expect(css).toContain('.admin-menu-toggle')
    expect(css).toContain('display: inline-flex')
    expect(css).toMatch(/\.admin-menu-toggle[\s\S]*display:\s*none/)

    restoreMatchMedia = mockMobileNav(true)
    const mobileApp = await mountApp(ADMIN_HOME_PATH)

    try {
      const toggle = mobileApp.container.querySelector('.admin-menu-toggle')
      expect(toggle).not.toBeNull()
      expect(mobileApp.container.querySelectorAll('.admin-menu-toggle').length).toBe(1)
      expect(window.matchMedia(MOBILE_NAV_QUERY).matches).toBe(true)
      expect(mobileApp.container.querySelector('.admin-header')).not.toBeNull()
    } finally {
      await mobileApp.cleanup()
    }

    restoreMatchMedia()
    restoreMatchMedia = mockMobileNav(false)
    const desktopApp = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(desktopApp.container.querySelector('.admin-menu-toggle')).not.toBeNull()
      expect(window.matchMedia(MOBILE_NAV_QUERY).matches).toBe(false)
    } finally {
      await desktopApp.cleanup()
    }
  })

  it('Prueba 2 — abrir sidebar desde el botón sin duplicar layout ni romper AdminHeader', async () => {
    restoreMatchMedia = mockMobileNav(true)
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const toggle = app.container.querySelector('.admin-menu-toggle') as HTMLButtonElement
      const headerBefore = app.container.querySelector('.admin-header')

      expect(toggle).not.toBeNull()
      expect(app.container.querySelectorAll('.admin-sidebar').length).toBe(1)
      expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()

      await click(toggle)

      expect(app.container.querySelector('.admin-layout--nav-open')).not.toBeNull()
      expect(app.container.querySelectorAll('.admin-sidebar').length).toBe(1)
      expect(app.container.querySelector('#admin-navigation')).not.toBeNull()
      expect(app.container.querySelector('.admin-nav-backdrop')).not.toBeNull()
      expect(app.container.querySelector('.admin-header')).toBe(headerBefore)
      expect(app.container.textContent).toContain('Panel administrativo')
      expect(app.container.textContent).toContain('Dashboard administrativo')
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 3 — cerrar sidebar con toggle, backdrop y Escape sin superposición incorrecta', async () => {
    restoreMatchMedia = mockMobileNav(true)
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const toggle = app.container.querySelector('.admin-menu-toggle') as HTMLButtonElement

      await click(toggle)
      expect(app.container.querySelector('.admin-layout--nav-open')).not.toBeNull()

      await click(toggle)
      expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()
      expect(app.container.querySelector('.admin-nav-backdrop')).toBeNull()

      await click(toggle)
      const backdrop = app.container.querySelector('.admin-nav-backdrop') as HTMLButtonElement
      expect(backdrop).not.toBeNull()

      await click(backdrop)
      expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()
      expect(app.container.querySelector('.admin-nav-backdrop')).toBeNull()

      await click(toggle)
      expect(app.container.querySelector('.admin-layout--nav-open')).not.toBeNull()

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      })

      expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()
      expect(app.container.querySelector('.admin-nav-backdrop')).toBeNull()
      expect(app.container.textContent).toContain('Dashboard administrativo')
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 4 — aria-expanded refleja el estado real del menú móvil', async () => {
    restoreMatchMedia = mockMobileNav(true)
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const toggle = app.container.querySelector('.admin-menu-toggle') as HTMLButtonElement

      expect(toggle.getAttribute('aria-expanded')).toBe('false')
      expect(toggle.getAttribute('aria-controls')).toBe('admin-navigation')
      expect(toggle.getAttribute('aria-label')).toBe('Abrir menú administrativo')

      await click(toggle)

      expect(toggle.getAttribute('aria-expanded')).toBe('true')
      expect(toggle.getAttribute('aria-label')).toBe('Cerrar menú administrativo')
      expect(app.container.querySelector('.admin-layout--nav-open')).not.toBeNull()

      await click(toggle)

      expect(toggle.getAttribute('aria-expanded')).toBe('false')
      expect(toggle.getAttribute('aria-label')).toBe('Abrir menú administrativo')
      expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()
    } finally {
      await app.cleanup()
    }
  })
})
