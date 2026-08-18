import { act, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import AppRoutes from '../../../app/router/AppRoutes'
import {
  ADMIN_HOME_PATH,
  ADMIN_PROFILE_PATH,
  ADMIN_PROFILE_TITLE,
} from '../../../app/router/privateRoutes'
import { LOGIN_ROUTE_PATH } from '../../../app/router/publicRoutes'
import {
  clearAccessToken,
  setAccessToken,
  setAuthUser,
} from '../../auth/utils/authStorage'

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

const pressKey = (
  element: Element,
  key: string,
  options: { activate?: boolean } = {},
) => {
  const down = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  })

  element.dispatchEvent(down)

  if (options.activate && (key === 'Enter' || key === ' ')) {
    element.dispatchEvent(
      new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }),
    )

    if (!down.defaultPrevented && element instanceof HTMLElement) {
      element.click()
    }
  }
}

type MountedApp = {
  container: HTMLDivElement
  root: Root
  currentPath: () => string
  openAccountMenu: () => Promise<void>
  clickProfileLink: () => Promise<void>
  cleanup: () => Promise<void>
}

const mountApp = async (path: string): Promise<MountedApp> => {
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
    root,
    currentPath: () => pathname,
    openAccountMenu: async () => {
      const trigger = container.querySelector<HTMLButtonElement>(
        '.admin-account-menu__trigger',
      )
      expect(trigger).not.toBeNull()

      await act(async () => {
        trigger?.click()
      })
    },
    clickProfileLink: async () => {
      const profileLink = container.querySelector<HTMLAnchorElement>(
        `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
      )
      expect(profileLink).not.toBeNull()

      await act(async () => {
        profileLink?.dispatchEvent(
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

describe('Mi perfil — pruebas funcionales', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('Prueba 1 — visualización del menú de usuario con sesión válida', async () => {
    setAccessToken('token-funcional')
    setAuthUser({ name: 'María', lastName: 'Solís', role: 'ADMINISTRADORA' })

    const consoleSpy = collectConsole()
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(app.container.querySelector('.admin-header')).not.toBeNull()
      expect(app.container.querySelector('.admin-account-menu')).not.toBeNull()
      expect(
        app.container.querySelector('.admin-account-menu__trigger'),
      ).not.toBeNull()

      await app.openAccountMenu()

      const profileLink = app.container.querySelector(
        `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
      )

      expect(profileLink).not.toBeNull()
      expect(profileLink?.textContent).toContain(ADMIN_PROFILE_TITLE)
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 2 — navegación con mouse hacia Mi perfil sin recarga completa', async () => {
    setAccessToken('token-funcional')
    setAuthUser({ name: 'Ana', role: 'ADMINISTRADORA' })

    const consoleSpy = collectConsole()
    const initialPathname = window.location.pathname
    const app = await mountApp(ADMIN_HOME_PATH)
    const headerBefore = app.container.querySelector('.admin-header')

    try {
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)

      await app.openAccountMenu()
      await app.clickProfileLink()

      expect(app.currentPath()).toBe(ADMIN_PROFILE_PATH)
      expect(outletTitle(app.container)).toBe(ADMIN_PROFILE_TITLE)
      expect(app.container.querySelector('.admin-header')).toBe(headerBefore)
      expect(window.location.pathname).toBe(initialPathname)
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 3 — layout administrativo persistente al entrar al perfil', async () => {
    setAccessToken('token-funcional')
    setAuthUser({ name: 'Carlos', role: 'FONTANERO' })

    const consoleSpy = collectConsole()
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const sidebar = app.container.querySelector('.admin-sidebar')
      const header = app.container.querySelector('.admin-header')
      const content = app.container.querySelector('.admin-main__content')

      expect(sidebar).not.toBeNull()
      expect(header).not.toBeNull()
      expect(content).not.toBeNull()
      expect(outletTitle(app.container)).toBe('Dashboard administrativo')

      await app.openAccountMenu()
      await app.clickProfileLink()

      expect(app.currentPath()).toBe(ADMIN_PROFILE_PATH)
      expect(hasAdminChrome(app.container)).toBe(true)
      expect(app.container.querySelector('.admin-sidebar')).toBe(sidebar)
      expect(app.container.querySelector('.admin-header')).toBe(header)
      expect(app.container.querySelector('.admin-main__content')).toBe(content)
      expect(outletTitle(app.container)).toBe(ADMIN_PROFILE_TITLE)
      expect(content?.querySelector('.admin-header')).toBeNull()
      expect(content?.querySelector('.admin-sidebar')).toBeNull()
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 4 — navegación a Mi perfil únicamente con teclado', async () => {
    setAccessToken('token-funcional')
    setAuthUser({ name: 'Ana', role: 'ADMINISTRADORA' })

    const consoleSpy = collectConsole()
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const trigger = app.container.querySelector(
        '.admin-account-menu__trigger',
      ) as HTMLButtonElement

      await act(async () => {
        trigger.focus()
      })

      expect(document.activeElement).toBe(trigger)

      await act(async () => {
        pressKey(trigger, 'Enter', { activate: true })
      })

      expect(trigger.getAttribute('aria-expanded')).toBe('true')

      const profileLink = app.container.querySelector(
        `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
      ) as HTMLAnchorElement

      expect(document.activeElement).toBe(profileLink)

      await act(async () => {
        pressKey(profileLink, 'Enter', { activate: true })
      })

      expect(app.currentPath()).toBe(ADMIN_PROFILE_PATH)
      expect(outletTitle(app.container)).toBe(ADMIN_PROFILE_TITLE)
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 5 — acceso directo a la ruta de perfil con sesión válida', async () => {
    setAccessToken('token-funcional')
    setAuthUser({ name: 'María', lastName: 'Solís', role: 'ADMINISTRADORA' })

    const consoleSpy = collectConsole()
    const app = await mountApp(ADMIN_PROFILE_PATH)

    try {
      expect(app.currentPath()).toBe(ADMIN_PROFILE_PATH)
      expect(hasAdminChrome(app.container)).toBe(true)
      expect(outletTitle(app.container)).toBe(ADMIN_PROFILE_TITLE)
      expect(app.container.querySelector('.private-module-placeholder')).not.toBeNull()
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 6 — ruta de perfil protegida sin sesión redirige a login', async () => {
    const consoleSpy = collectConsole()
    const app = await mountApp(ADMIN_PROFILE_PATH)

    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('auth-page')
      expect(hasAdminChrome(app.container)).toBe(false)
      expect(app.container.innerHTML).not.toContain(ADMIN_PROFILE_TITLE)
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })
})
