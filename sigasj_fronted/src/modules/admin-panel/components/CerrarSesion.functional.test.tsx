import { act, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, MemoryRouter, RouterProvider, useLocation } from 'react-router-dom'
import AppRoutes from '../../../app/router/AppRoutes'
import { AuthProvider } from '../../auth/components/AuthContext'
import {
  ADMIN_BASE_PATH,
  ADMIN_HOME_PATH,
  ADMIN_PROFILE_PATH,
} from '../../../app/router/privateRoutes'
import { LOGIN_ROUTE_PATH } from '../../../app/router/publicRoutes'
import * as authStorage from '../../auth/utils/authStorage'
import {
  clearAccessToken,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
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

const hasAdminChrome = (html: string) =>
  html.includes('admin-layout') &&
  html.includes('admin-sidebar') &&
  html.includes('admin-header')

const assertBlockedAdminAccess = (container: HTMLElement) => {
  expect(container.innerHTML).toContain('auth-page')
  expect(container.innerHTML).not.toContain('admin-layout')
  expect(container.innerHTML).not.toContain('admin-sidebar')
  expect(container.innerHTML).not.toContain('admin-header')
  expect(container.innerHTML).not.toContain('Panel administrativo')
  expect(hasAdminChrome(container.innerHTML)).toBe(false)
}

const readHeaderUser = (container: HTMLElement) => ({
  name: container.querySelector('.admin-header__user-name')?.textContent ?? '',
  role: container.querySelector('.admin-header__user-detail')?.textContent ?? '',
})

const collectConsole = () => {
  const errors: unknown[] = []
  const warnings: unknown[] = []
  const rejections: unknown[] = []
  const originalError = console.error
  const originalWarn = console.warn

  const onRejection = (event: PromiseRejectionEvent) => {
    rejections.push(event.reason)
  }

  console.error = (...args: unknown[]) => {
    errors.push(args)
  }
  console.warn = (...args: unknown[]) => {
    warnings.push(args)
  }
  window.addEventListener('unhandledrejection', onRejection)

  return {
    errors,
    warnings,
    rejections,
    restore: () => {
      console.error = originalError
      console.warn = originalWarn
      window.removeEventListener('unhandledrejection', onRejection)
    },
  }
}

const assertCleanConsole = (
  consoleSpy: ReturnType<typeof collectConsole>,
  container?: HTMLElement,
) => {
  expect(consoleSpy.errors).toEqual([])
  expect(consoleSpy.warnings).toEqual([])
  expect(consoleSpy.rejections).toEqual([])

  const serialized = JSON.stringify([
    ...consoleSpy.errors,
    ...consoleSpy.warnings,
    ...consoleSpy.rejections,
    container?.innerHTML ?? '',
  ])

  expect(serialized).not.toContain('local-admin-session')
  expect(serialized).not.toContain('token-funcional')
  expect(serialized).not.toContain('token-usuario-a')
  expect(serialized).not.toContain('token-usuario-b')
  expect(serialized).not.toContain('sigasj_access_token')
  expect(serialized).not.toContain('demo-user-id')
  expect(serialized).not.toMatch(/Bearer\s+/i)
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

const confirmLogoutInDialog = async (container: HTMLElement) => {
  expect(container.querySelector('.confirm-dialog')).not.toBeNull()

  const confirmButton = container.querySelector(
    '.confirm-dialog__button--danger',
  ) as HTMLButtonElement

  expect(confirmButton).not.toBeNull()

  await act(async () => {
    confirmButton.click()
  })
}

const openLogoutDialog = async (container: HTMLElement) => {
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

  expect(container.querySelector('.confirm-dialog')).not.toBeNull()
}

const cancelLogoutInDialog = async (container: HTMLElement) => {
  const cancelButton = container.querySelector(
    '.confirm-dialog__button--secondary',
  ) as HTMLButtonElement

  expect(cancelButton).not.toBeNull()
  expect(cancelButton.type).toBe('button')

  await act(async () => {
    cancelButton.click()
  })
}

type MountedApp = {
  container: HTMLDivElement
  root: Root
  currentPath: () => string
  openAccountMenu: () => Promise<void>
  logoutFromMenu: () => Promise<void>
  cancelLogoutDialog: () => Promise<void>
  submitLogin: () => Promise<void>
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
        <AuthProvider>
          <LocationProbe
            onPath={(nextPath) => {
              pathname = nextPath
            }}
          />
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )
  })

  return {
    container,
    root,
    currentPath: () => pathname,
    submitLogin: async () => {
      const submit = container.querySelector<HTMLButtonElement>('.auth-page__submit')
      expect(submit).not.toBeNull()

      await act(async () => {
        submit?.click()
      })
    },
    openAccountMenu: async () => {
      const trigger = container.querySelector<HTMLButtonElement>(
        '.admin-account-menu__trigger',
      )
      expect(trigger).not.toBeNull()

      await act(async () => {
        trigger?.click()
      })
    },
    logoutFromMenu: async () => {
      const logoutItem = container.querySelector<HTMLButtonElement>(
        '.admin-account-menu__item--danger',
      )
      expect(logoutItem).not.toBeNull()

      await act(async () => {
        logoutItem?.click()
      })

      await confirmLogoutInDialog(container)
    },
    cancelLogoutDialog: async () => {
      await openLogoutDialog(container)
      await cancelLogoutInDialog(container)
    },
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

const mountInteractiveApp = async (
  initialEntries: string[],
  initialIndex = initialEntries.length - 1,
) => {
  const router = createMemoryRouter(
    [{ path: '/*', element: <AuthProvider><AppRoutes /></AuthProvider> }],
    {
    initialEntries,
    initialIndex,
    },
  )

  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(<RouterProvider router={router} />)
  })

  const submitLogin = async () => {
    const form = container.querySelector('.auth-page__form') as HTMLFormElement | null
    expect(form).not.toBeNull()

    await act(async () => {
      form?.requestSubmit()
    })
  }

  const logoutFromMenu = async () => {
    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement | null
    expect(trigger).not.toBeNull()

    await act(async () => {
      trigger?.click()
    })

    const logoutItem = container.querySelector(
      '.admin-account-menu__item--danger',
    ) as HTMLButtonElement | null
    expect(logoutItem).not.toBeNull()

    await act(async () => {
      logoutItem?.click()
    })

    await confirmLogoutInDialog(container)
  }

  return {
    container,
    router,
    currentPath: () => router.state.location.pathname,
    submitLogin,
    logoutFromMenu,
    navigate: async (to: string) => {
      await act(async () => {
        await router.navigate(to)
      })
    },
    goBack: async () => {
      await act(async () => {
        await router.navigate(-1)
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

describe('Cerrar sesión — pruebas funcionales', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('Prueba 1 — visualización del menú de usuario con opción Cerrar sesión', async () => {
    const consoleSpy = collectConsole()
    const app = await mountApp(LOGIN_ROUTE_PATH)

    try {
      expect(app.container.querySelector('.admin-header')).toBeNull()

      await app.submitLogin()

      expect(isAuthenticated()).toBe(true)
      expect(app.container.querySelector('.admin-header')).not.toBeNull()
      expect(app.container.querySelector('.admin-account-menu')).not.toBeNull()
      expect(
        app.container.querySelector('.admin-account-menu__trigger'),
      ).not.toBeNull()

      await app.openAccountMenu()

      const logoutItem = app.container.querySelector('.admin-account-menu__item--danger')

      expect(logoutItem).not.toBeNull()
      expect(logoutItem?.textContent).toContain('Cerrar sesión')
      expect(logoutItem?.tagName).toBe('BUTTON')
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 2 — abrir confirmación sin ejecutar logout inmediatamente', async () => {
    const consoleSpy = collectConsole()
    const clearSpy = vi.spyOn(authStorage, 'clearAccessToken')

    setAccessToken('token-funcional')
    setAuthUser({
      name: 'María',
      lastName: 'Solís',
      role: 'ADMINISTRADORA',
    })

    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(readHeaderUser(app.container).name).toBe('María Solís')
      expect(readHeaderUser(app.container).role).toBe('Administradora')

      await app.openAccountMenu()

      const logoutItem = app.container.querySelector(
        '.admin-account-menu__item--danger',
      ) as HTMLButtonElement

      await act(async () => {
        logoutItem.click()
      })

      expect(clearSpy).not.toHaveBeenCalled()
      expect(isAuthenticated()).toBe(true)
      expect(getAccessToken()).toBe('token-funcional')
      expect(getAuthUser()?.name).toBe('María')
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(app.container.querySelector('.confirm-dialog')).not.toBeNull()
      expect(
        app.container.querySelector('.confirm-dialog__title')?.textContent,
      ).toBe('Cerrar sesión')
      expect(
        app.container.querySelector('.confirm-dialog__message')?.textContent,
      ).toContain('Confirme si desea cerrar sesión')
      expect(
        app.container.querySelector('.confirm-dialog__message')?.textContent,
      ).toContain('iniciar sesión nuevamente')
      expect(app.container.textContent).toContain('Cancelar')
      expect(app.container.textContent).toContain('Cerrar sesión')
      expect(
        app.container.querySelector('.confirm-dialog__button--secondary')?.textContent,
      ).toBe('Cancelar')
      expect(
        app.container.querySelector('.confirm-dialog__button--danger')?.textContent,
      ).toBe('Cerrar sesión')
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 3 — confirmar cierre ejecuta logout, invalida sesión y redirige al login', async () => {
    const consoleSpy = collectConsole()
    const clearSpy = vi.spyOn(authStorage, 'clearAccessToken')

    setAccessToken('token-usuario-a')
    setAuthUser({
      name: 'María',
      lastName: 'Solís',
      role: 'ADMINISTRADORA',
    })

    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(app.container.querySelector('.admin-header')).not.toBeNull()

      await app.openAccountMenu()
      await app.logoutFromMenu()

      expect(clearSpy).toHaveBeenCalledTimes(1)
      expect(getAccessToken()).toBeNull()
      expect(getAuthUser()).toBeNull()
      expect(isAuthenticated()).toBe(false)
      expect(localStorage.getItem('sigasj_access_token')).toBeNull()
      expect(localStorage.getItem('sigasj_auth_user')).toBeNull()
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('auth-page')
      expect(app.container.innerHTML).toContain('Iniciar sesión')
      assertBlockedAdminAccess(app.container)
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 4 — AdminHeader no conserva nombre, rol ni sesión anterior tras logout', async () => {
    const consoleSpy = collectConsole()
    const clearSpy = vi.spyOn(authStorage, 'clearAccessToken')

    setAccessToken('token-usuario-a')
    setAuthUser({
      name: 'María',
      lastName: 'Solís',
      role: 'ADMINISTRADORA',
    })

    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(readHeaderUser(app.container).name).toBe('María Solís')
      expect(readHeaderUser(app.container).role).toBe('Administradora')

      await app.openAccountMenu()
      await app.logoutFromMenu()

      expect(clearSpy).toHaveBeenCalledTimes(1)
      expect(app.container.querySelector('.admin-header')).toBeNull()
      expect(app.container.querySelector('.admin-header__user-name')).toBeNull()
      expect(app.container.querySelector('.admin-header__user-detail')).toBeNull()
      expect(getAccessToken()).toBeNull()
      expect(getAuthUser()).toBeNull()
      expect(isAuthenticated()).toBe(false)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).not.toContain('María Solís')
      expect(app.container.innerHTML).not.toContain('Administradora')
      assertBlockedAdminAccess(app.container)
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 5 — rutas privadas bloqueadas después del logout', async () => {
    const consoleSpy = collectConsole()
    const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

    try {
      await app.submitLogin()
      await app.logoutFromMenu()

      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)

      for (const path of [ADMIN_BASE_PATH, '/admin/abonados'] as const) {
        await app.navigate(path)

        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        assertBlockedAdminAccess(app.container)
      }

      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 6 — botón Atrás no recupera acceso al contenido privado', async () => {
    const consoleSpy = collectConsole()
    const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

    try {
      await app.submitLogin()
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(hasAdminChrome(app.container.innerHTML)).toBe(true)

      await app.logoutFromMenu()
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)

      await app.goBack()

      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      assertBlockedAdminAccess(app.container)
      expect(app.container.innerHTML).not.toContain('Galería administrativa')
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 7 — recargar o escribir URL administrativa permanece bloqueada', async () => {
    const consoleSpy = collectConsole()
    const app = await mountInteractiveApp([LOGIN_ROUTE_PATH])

    try {
      await app.submitLogin()
      await app.logoutFromMenu()

      expect(isAuthenticated()).toBe(false)

      await app.cleanup()

      for (const path of [ADMIN_HOME_PATH, ADMIN_PROFILE_PATH] as const) {
        const reloaded = await mountApp(path)

        try {
          expect(reloaded.currentPath()).toBe(LOGIN_ROUTE_PATH)
          assertBlockedAdminAccess(reloaded.container)
        } finally {
          await reloaded.cleanup()
        }
      }

      assertCleanConsole(consoleSpy)
    } finally {
      consoleSpy.restore()
    }
  })

  it('Prueba 8 — nueva sesión reemplaza datos del usuario anterior', async () => {
    const consoleSpy = collectConsole()
    setAccessToken('token-usuario-a')
    setAuthUser({
      name: 'María',
      lastName: 'Solís',
      role: 'ADMINISTRADORA',
    })

    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(readHeaderUser(app.container).name).toBe('María Solís')
      expect(readHeaderUser(app.container).role).toBe('Administradora')

      await app.openAccountMenu()
      await app.logoutFromMenu()

      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(getAuthUser()).toBeNull()

      await app.submitLogin()

      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)

      const user = readHeaderUser(app.container)

      expect(user.name).toBe('Usuario Administradora')
      expect(user.role).toBe('Administradora')
      expect(user.name).not.toBe('María Solís')
      expect(app.container.innerHTML).not.toContain('María Solís')
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Prueba 9 — logout completo utilizando solamente el teclado', async () => {
    const consoleSpy = collectConsole()
    setAccessToken('token-funcional')
    setAuthUser({ name: 'Ana', role: 'ADMINISTRADORA' })

    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const trigger = app.container.querySelector(
        '.admin-account-menu__trigger',
      ) as HTMLButtonElement
      const publicLink = app.container.querySelector(
        '.admin-header__action--public',
      ) as HTMLAnchorElement

      expect(publicLink).not.toBeNull()

      await act(async () => {
        publicLink.focus()
        trigger.focus()
        pressKey(trigger, 'Enter', { activate: true })
      })

      expect(trigger.getAttribute('aria-expanded')).toBe('true')

      const profileLink = app.container.querySelector(
        `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
      ) as HTMLAnchorElement
      const logoutItem = app.container.querySelector(
        '.admin-account-menu__item--danger',
      ) as HTMLButtonElement

      expect(document.activeElement).toBe(profileLink)

      await act(async () => {
        pressKey(profileLink, 'ArrowDown')
      })

      expect(document.activeElement).toBe(logoutItem)

      await act(async () => {
        pressKey(logoutItem, 'Enter', { activate: true })
      })

      expect(app.container.querySelector('.confirm-dialog')).not.toBeNull()

      const cancelButton = app.container.querySelector(
        '.confirm-dialog__button--secondary',
      ) as HTMLButtonElement
      const confirmButton = app.container.querySelector(
        '.confirm-dialog__button--danger',
      ) as HTMLButtonElement

      expect(document.activeElement).toBe(cancelButton)

      await act(async () => {
        pressKey(cancelButton, 'Tab')
      })

      expect(document.activeElement).toBe(confirmButton)

      await act(async () => {
        pressKey(confirmButton, 'Enter', { activate: true })
      })

      expect(getAccessToken()).toBeNull()
      expect(getAuthUser()).toBeNull()
      expect(isAuthenticated()).toBe(false)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      assertBlockedAdminAccess(app.container)
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Cancelar cierra el diálogo sin afectar sesión, layout ni ruta actual', async () => {
    const consoleSpy = collectConsole()
    const clearSpy = vi.spyOn(authStorage, 'clearAccessToken')

    const app = await mountApp(LOGIN_ROUTE_PATH)

    try {
      await app.submitLogin()

      expect(app.currentPath()).toBe('/admin/galeria')
      expect(isAuthenticated()).toBe(true)

      const userBefore = readHeaderUser(app.container)
      const tokenBefore = getAccessToken()
      const authUserBefore = getAuthUser()
      const pathBefore = app.currentPath()

      expect(userBefore.name).toBe('Usuario Administrador')
      expect(userBefore.role).toBe('Administradora')
      expect(tokenBefore).toBe('local-admin-session')
      expect(authUserBefore).toEqual({
        id: 'demo-user-id',
        name: 'Usuario',
        lastName: 'Administrador',
        email: 'admin@sigasj.local',
        role: 'ADMINISTRADORA',
      })

      await openLogoutDialog(app.container)
      await cancelLogoutInDialog(app.container)

      expect(clearSpy).not.toHaveBeenCalled()
      expect(app.container.querySelector('.confirm-dialog')).toBeNull()
      expect(isAuthenticated()).toBe(true)
      expect(getAccessToken()).toBe(tokenBefore)
      expect(getAuthUser()).toEqual(authUserBefore)
      expect(app.currentPath()).toBe(pathBefore)
      expect(readHeaderUser(app.container)).toEqual(userBefore)
      expect(app.container.querySelector('.admin-header')).not.toBeNull()
      expect(app.container.innerHTML).toContain('admin-layout')
      expect(app.container.innerHTML).toContain('admin-sidebar')
      expect(app.container.innerHTML).toContain('admin-header')
      expect(app.container.innerHTML).not.toContain('auth-page')
      expect(app.container.innerHTML).not.toContain('Iniciar sesión')
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Escape en el diálogo se comporta como Cancelar', async () => {
    const consoleSpy = collectConsole()
    const clearSpy = vi.spyOn(authStorage, 'clearAccessToken')

    const app = await mountApp(LOGIN_ROUTE_PATH)

    try {
      await app.submitLogin()

      expect(app.currentPath()).toBe('/admin/galeria')

      const userBefore = readHeaderUser(app.container)
      const tokenBefore = getAccessToken()
      const authUserBefore = getAuthUser()
      const pathBefore = app.currentPath()

      await openLogoutDialog(app.container)

      const cancelButton = app.container.querySelector(
        '.confirm-dialog__button--secondary',
      ) as HTMLButtonElement

      expect(document.activeElement).toBe(cancelButton)

      await act(async () => {
        pressKey(cancelButton, 'Escape')
      })

      expect(clearSpy).not.toHaveBeenCalled()
      expect(app.container.querySelector('.confirm-dialog')).toBeNull()
      expect(isAuthenticated()).toBe(true)
      expect(getAccessToken()).toBe(tokenBefore)
      expect(getAuthUser()).toEqual(authUserBefore)
      expect(app.currentPath()).toBe(pathBefore)
      expect(readHeaderUser(app.container)).toEqual(userBefore)
      expect(app.container.innerHTML).toContain('admin-layout')
      expect(app.container.innerHTML).toContain('admin-header')
      expect(app.container.innerHTML).not.toContain('auth-page')
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('Cancelar en el diálogo mantiene la sesión activa y la ruta administrativa', async () => {
    const consoleSpy = collectConsole()
    setAccessToken('token-funcional')
    setAuthUser({ name: 'María', lastName: 'Solís', role: 'ADMINISTRADORA' })

    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(isAuthenticated()).toBe(true)
      expect(getAuthUser()?.name).toBe('María')

      await app.cancelLogoutDialog()

      expect(getAccessToken()).toBe('token-funcional')
      expect(getAuthUser()).toEqual({
        name: 'María',
        lastName: 'Solís',
        role: 'Administradora',
      })
      expect(isAuthenticated()).toBe(true)
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(readHeaderUser(app.container).name).toBe('María Solís')
      expect(readHeaderUser(app.container).role).toBe('Administradora')
      expect(app.container.querySelector('.confirm-dialog')).toBeNull()
      expect(app.container.innerHTML).toContain('admin-layout')
      expect(app.container.innerHTML).toContain('admin-sidebar')
      expect(app.container.innerHTML).toContain('admin-header')
      expect(app.container.innerHTML).not.toContain('auth-page')
      expect(app.container.innerHTML).not.toContain('hero')
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })
})
