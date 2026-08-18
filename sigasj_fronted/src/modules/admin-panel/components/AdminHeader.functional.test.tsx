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

const readHeaderUser = (container: HTMLElement) => ({
  sectionText: container.querySelector('.admin-header__user')?.textContent ?? '',
  name: container.querySelector('.admin-header__user-name')?.textContent ?? '',
  role: container.querySelector('.admin-header__user-detail')?.textContent ?? '',
})

const assertStableUserMarkup = (html: string) => {
  expect(html).not.toMatch(/\bundefined\b/i)
  expect(html).not.toMatch(/\bnull\b/i)
  expect(html).not.toContain('[object Object]')
}

const assertNoSensitiveUserDataInHeader = (html: string) => {
  assertStableUserMarkup(html)
  expect(html).not.toContain('local-admin-session')
  expect(html).not.toContain('token-de-prueba')
  expect(html).not.toContain('token-usuario-a')
  expect(html).not.toContain('token-usuario-b')
  expect(html).not.toContain('demo-user-id')
  expect(html).not.toContain('refreshToken')
  expect(html).not.toContain('accessToken')
  expect(html).not.toContain('sigasj_access_token')
  expect(html).not.toContain('admin@sigasj.local')
  expect(html).not.toMatch(/Bearer\s+/i)
  expect(html).not.toMatch(/\beyJ[A-Za-z0-9_-]{10,}/)
  expect(html).not.toContain('password')
  expect(html).not.toContain('contraseña')
}

const submitLogin = async (container: HTMLElement) => {
  const submit = container.querySelector<HTMLButtonElement>('.auth-page__submit')
  expect(submit).not.toBeNull()

  await act(async () => {
    submit?.click()
  })
}

const confirmLogoutInDialog = async (container: HTMLElement) => {
  const confirmButton = container.querySelector(
    '.confirm-dialog__button--danger',
  ) as HTMLButtonElement

  await act(async () => {
    confirmButton?.click()
  })
}

const logoutFromHeader = async (container: HTMLElement) => {
  const trigger = container.querySelector<HTMLButtonElement>(
    '.admin-account-menu__trigger',
  )
  expect(trigger).not.toBeNull()

  await act(async () => {
    trigger?.click()
  })

  const logoutItem = container.querySelector<HTMLButtonElement>(
    '.admin-account-menu__item--danger',
  )
  expect(logoutItem).not.toBeNull()

  await act(async () => {
    logoutItem?.click()
  })

  await confirmLogoutInDialog(container)
}

describe('AdminHeader — información del usuario (pruebas funcionales)', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('Prueba 1 — usuario autenticado muestra AdminHeader con nombre y rol correctos', async () => {
    const consoleSpy = collectConsole()
    const app = await mountApp(LOGIN_ROUTE_PATH)

    try {
      expect(app.container.querySelector('.admin-header')).toBeNull()

      await submitLogin(app.container)

      expect(app.container.querySelector('.admin-header')).not.toBeNull()
      expect(app.currentPath()).toBe('/admin/galeria')

      const user = readHeaderUser(app.container)

      expect(user.name).toBe('Usuario Administrador')
      expect(user.role).toBe('Administradora')
      expect(app.container.querySelector('.admin-header')?.textContent).toContain(
        'Panel administrativo',
      )
      assertNoSensitiveUserDataInHeader(app.container.innerHTML)
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 2 — el rol mostrado corresponde a la sesión, es legible y no se inventa', async () => {
    const consoleSpy = collectConsole()
    const roleCases = [
      { raw: 'ADMINISTRADORA', label: 'Administradora' },
      { raw: 'SECRETARIA_EJECUTIVA', label: 'Secretaria Ejecutiva' },
      { raw: 'FONTANERO', label: 'Fontanero' },
    ] as const

    try {
      for (const roleCase of roleCases) {
        clearAccessToken()
        setAccessToken(`token-rol-${roleCase.raw}`)
        setAuthUser({ name: 'Ana', lastName: 'López', role: roleCase.raw })

        const app = await mountApp(ADMIN_HOME_PATH)

        try {
          const user = readHeaderUser(app.container)

          expect(user.name).toBe('Ana López')
          expect(user.role).toBe(roleCase.label)
          expect(user.role).not.toMatch(/undefined|null/i)
          assertNoSensitiveUserDataInHeader(app.container.innerHTML)
        } finally {
          await app.cleanup()
        }
      }

      clearAccessToken()
      setAccessToken('token-sin-rol')
      setAuthUser({ name: 'Ana', role: 'undefined' })

      const noRoleApp = await mountApp(ADMIN_HOME_PATH)

      try {
        const user = readHeaderUser(noRoleApp.container)

        expect(user.name).toBe('Ana')
        expect(user.role).toBe('')
        expect(noRoleApp.container.querySelector('.admin-header__user-detail')).toBeNull()
        assertStableUserMarkup(noRoleApp.container.innerHTML)
      } finally {
        await noRoleApp.cleanup()
      }

      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
    }
  })

  it('Prueba 2b — datos opcionales ausentes mantienen la interfaz estable', async () => {
    const consoleSpy = collectConsole()
    const scenarios = [
      {
        label: 'sin perfil de usuario',
        setup: () => {
          setAccessToken('token-sin-perfil')
        },
        expectedName: 'Usuario',
        expectedRole: '',
      },
      {
        label: 'solo nombre',
        setup: () => {
          setAccessToken('token-nombre-solo')
          setAuthUser({ name: 'Ana' })
        },
        expectedName: 'Ana',
        expectedRole: '',
      },
      {
        label: 'nombre inválido y rol inválido',
        setup: () => {
          setAccessToken('token-parcial')
          setAuthUser({
            name: 'undefined',
            lastName: 'null',
            role: 'undefined',
            email: 'admin@sigasj.local',
            id: 'user-id-interno',
          })
        },
        expectedName: 'Usuario',
        expectedRole: '',
      },
    ] as const

    try {
      for (const scenario of scenarios) {
        clearAccessToken()
        scenario.setup()

        const app = await mountApp(ADMIN_HOME_PATH)

        try {
          expect(app.container.querySelector('.admin-header')).not.toBeNull()

          const user = readHeaderUser(app.container)

          expect(user.name).toBe(scenario.expectedName)
          expect(user.role).toBe(scenario.expectedRole)
          assertStableUserMarkup(app.container.innerHTML)
        } finally {
          await app.cleanup()
        }
      }

      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
    }
  })

  it('Prueba 3 — recuperación de sesión mantiene nombre y rol tras recargar', async () => {
    setAccessToken('token-de-prueba')
    setAuthUser({
      name: 'María',
      lastName: 'Solís',
      role: 'ADMINISTRADORA',
    })

    const consoleSpy = collectConsole()
    const firstLoad = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(readHeaderUser(firstLoad.container).name).toBe('María Solís')
      expect(readHeaderUser(firstLoad.container).role).toBe('Administradora')
    } finally {
      await firstLoad.cleanup()
    }

    const reloadedApp = await mountApp(ADMIN_HOME_PATH)

    try {
      const user = readHeaderUser(reloadedApp.container)

      expect(user.name).toBe('María Solís')
      expect(user.role).toBe('Administradora')
      expect(user.name).not.toBe('Usuario')
      assertNoSensitiveUserDataInHeader(reloadedApp.container.innerHTML)
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
      await reloadedApp.cleanup()
    }
  })

  it('Prueba 4 — cambio de usuario reemplaza nombre y rol en AdminHeader', async () => {
    const consoleSpy = collectConsole()

    const loginApp = await mountApp(LOGIN_ROUTE_PATH)

    try {
      await submitLogin(loginApp.container)

      expect(readHeaderUser(loginApp.container).name).toBe('Usuario Administrador')
      expect(readHeaderUser(loginApp.container).role).toBe('Administradora')

      await logoutFromHeader(loginApp.container)

      expect(loginApp.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(loginApp.container.querySelector('.admin-header')).toBeNull()
    } finally {
      await loginApp.cleanup()
    }

    setAccessToken('token-usuario-b')
    setAuthUser({
      name: 'Carlos',
      lastName: 'Mora',
      role: 'FONTANERO',
    })

    const secondApp = await mountApp(ADMIN_HOME_PATH)

    try {
      const user = readHeaderUser(secondApp.container)

      expect(user.name).toBe('Carlos Mora')
      expect(user.role).toBe('Fontanero')
      expect(user.sectionText).not.toContain('Usuario Administrador')
      expect(user.sectionText).not.toContain('Administradora')
      assertStableUserMarkup(secondApp.container.innerHTML)
      assertNoSensitiveUserDataInHeader(secondApp.container.innerHTML)
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
      await secondApp.cleanup()
    }
  })

  it('Prueba 5 — AdminHeader no expone datos sensibles de sesión', async () => {
    setAccessToken('secreto-access-token-no-visible')
    setAuthUser({
      id: 'user-id-interno',
      name: 'María',
      lastName: 'Solís',
      role: 'SECRETARIA_EJECUTIVA',
      email: 'maria@sigasj.local',
      avatar: 'https://cdn.example.com/avatar.jpg?accessToken=secreto',
    })

    const consoleSpy = collectConsole()
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const headerHtml = app.container.querySelector('.admin-header')?.innerHTML ?? ''

      expect(readHeaderUser(app.container).name).toBe('María Solís')
      expect(readHeaderUser(app.container).role).toBe('Secretaria Ejecutiva')
      assertNoSensitiveUserDataInHeader(headerHtml)
      expect(headerHtml).not.toContain('password')
      expect(headerHtml).not.toContain('secreto-access-token-no-visible')
      expect(headerHtml).not.toContain('user-id-interno')
      expect(consoleSpy.errors).toEqual([])
      expect(consoleSpy.warnings).toEqual([])
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })
})

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
      expect(header?.textContent).toContain('Usuario')
      expect(header?.querySelector('.admin-header__user-detail')).toBeNull()
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
