import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from '../../../app/router/AppRoutes'
import {
  ADMIN_HOME_PATH,
  ADMIN_PROFILE_PATH,
  ADMIN_PROFILE_TITLE,
} from '../../../app/router/privateRoutes'
import {
  clearAccessToken,
  setAccessToken,
  setAuthUser,
} from '../../auth/utils/authStorage'

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

const formatConsoleEntries = (entries: unknown[]) =>
  entries
    .map((entry) => {
      if (Array.isArray(entry)) {
        return entry.map((part) => String(part)).join(' ')
      }

      return String(entry)
    })
    .join('\n')

const assertCleanConsole = (
  consoleSpy: ReturnType<typeof collectConsole>,
  container?: HTMLElement,
) => {
  expect(consoleSpy.errors, formatConsoleEntries(consoleSpy.errors)).toEqual([])
  expect(consoleSpy.warnings, formatConsoleEntries(consoleSpy.warnings)).toEqual([])
  expect(consoleSpy.rejections, formatConsoleEntries(consoleSpy.rejections)).toEqual([])

  const serialized = JSON.stringify([
    ...consoleSpy.errors,
    ...consoleSpy.warnings,
    ...consoleSpy.rejections,
    container?.innerHTML ?? '',
  ])

  expect(serialized).not.toContain('sigasj_access_token')
  expect(serialized).not.toMatch(/Bearer\s+/i)
}

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

const pressKey = (
  element: Element,
  key: string,
  options: { activate?: boolean; shiftKey?: boolean } = {},
) => {
  const down = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    shiftKey: options.shiftKey ?? false,
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

const mountApp = async (path: string) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
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

describe('AdminHeader — auditoría de consola del navegador', () => {
  let restoreMatchMedia: (() => void) | undefined

  beforeEach(() => {
    clearAccessToken()
    setAccessToken('token-console-audit')
    setAuthUser({ name: 'Ana', role: 'SECRETARIA' })
  })

  afterEach(() => {
    restoreMatchMedia?.()
    restoreMatchMedia = undefined
    document.body.style.overflow = ''
    document.body.innerHTML = ''
  })

  it('consola limpia al renderizar AdminHeader con nombre y rol', async () => {
    const consoleSpy = collectConsole()
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      expect(app.container.querySelector('.admin-header')).not.toBeNull()
      expect(app.container.querySelector('.admin-header__user-name')?.textContent).toBe('Ana')
      expect(app.container.querySelector('.admin-header__user-detail')?.textContent).toBe(
        'Secretaria',
      )
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('consola limpia al abrir menú de usuario, ir a Mi perfil y volver', async () => {
    const consoleSpy = collectConsole()
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const trigger = app.container.querySelector(
        '.admin-account-menu__trigger',
      ) as HTMLButtonElement

      await act(async () => {
        trigger.click()
      })

      const profileLink = app.container.querySelector(
        `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
      ) as HTMLAnchorElement

      await act(async () => {
        profileLink.click()
      })

      expect(
        app.container.querySelector('.admin-main__content h1')?.textContent,
      ).toBe(ADMIN_PROFILE_TITLE)

      await act(async () => {
        app.container.querySelector<HTMLAnchorElement>('.admin-sidebar__link')?.click()
      })

      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('consola limpia al abrir, cancelar y confirmar diálogo de cerrar sesión', async () => {
    const consoleSpy = collectConsole()
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const trigger = app.container.querySelector(
        '.admin-account-menu__trigger',
      ) as HTMLButtonElement

      await act(async () => {
        trigger.click()
      })

      const logoutItem = app.container.querySelector(
        '.admin-account-menu__item--danger',
      ) as HTMLButtonElement

      await act(async () => {
        logoutItem.click()
      })

      const cancelButton = app.container.querySelector(
        '.confirm-dialog__button--secondary',
      ) as HTMLButtonElement

      await act(async () => {
        cancelButton.click()
      })

      expect(app.container.querySelector('.confirm-dialog')).toBeNull()

      await act(async () => {
        trigger.click()
        logoutItem.click()
      })

      const confirmButton = app.container.querySelector(
        '.confirm-dialog__button--danger',
      ) as HTMLButtonElement

      await act(async () => {
        confirmButton.click()
      })

      expect(app.container.textContent).toContain('Iniciar sesión')
      expect(app.container.innerHTML).not.toContain('admin-header')
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('consola limpia durante navegación por teclado del menú y diálogo', async () => {
    const consoleSpy = collectConsole()
    restoreMatchMedia = mockMobileNav(false)
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const trigger = app.container.querySelector(
        '.admin-account-menu__trigger',
      ) as HTMLButtonElement

      await act(async () => {
        trigger.focus()
        pressKey(trigger, 'Enter', { activate: true })
      })

      const profileLink = app.container.querySelector(
        `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
      ) as HTMLAnchorElement
      const logoutItem = app.container.querySelector(
        '.admin-account-menu__item--danger',
      ) as HTMLButtonElement

      await act(async () => {
        pressKey(profileLink, 'End')
        pressKey(logoutItem, 'Enter', { activate: true })
      })

      const panel = app.container.querySelector('.confirm-dialog__panel') as HTMLDivElement
      const cancelButton = app.container.querySelector(
        '.confirm-dialog__button--secondary',
      ) as HTMLButtonElement

      await act(async () => {
        pressKey(panel, 'Tab')
        pressKey(panel, 'Tab', { shiftKey: true })
        pressKey(cancelButton, 'Escape')
      })

      expect(app.container.querySelector('.confirm-dialog')).toBeNull()
      expect(document.activeElement).toBe(trigger)
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('consola limpia al operar menú móvil con teclado y backdrop', async () => {
    const consoleSpy = collectConsole()
    restoreMatchMedia = mockMobileNav(true)
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const toggle = app.container.querySelector('.admin-menu-toggle') as HTMLButtonElement

      await act(async () => {
        toggle.focus()
        pressKey(toggle, 'Enter', { activate: true })
      })

      expect(app.container.querySelector('.admin-layout--nav-open')).not.toBeNull()

      const backdrop = app.container.querySelector('.admin-nav-backdrop') as HTMLButtonElement

      await act(async () => {
        backdrop.click()
      })

      expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()

      await act(async () => {
        pressKey(toggle, 'Enter', { activate: true })
      })

      expect(app.container.querySelector('.admin-layout--nav-open')).not.toBeNull()

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      })

      expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()
      assertCleanConsole(consoleSpy, app.container)
    } finally {
      consoleSpy.restore()
      await app.cleanup()
    }
  })

  it('consola limpia tras logout y bloqueo de rutas privadas', async () => {
    const consoleSpy = collectConsole()
    const logoutApp = await mountApp(ADMIN_HOME_PATH)

    try {
      const trigger = logoutApp.container.querySelector(
        '.admin-account-menu__trigger',
      ) as HTMLButtonElement

      await act(async () => {
        trigger.click()
      })

      const logoutItem = logoutApp.container.querySelector(
        '.admin-account-menu__item--danger',
      ) as HTMLButtonElement

      await act(async () => {
        logoutItem.click()
      })

      const confirmButton = logoutApp.container.querySelector(
        '.confirm-dialog__button--danger',
      ) as HTMLButtonElement

      await act(async () => {
        confirmButton.click()
      })

      expect(localStorage.getItem('sigasj_access_token')).toBeNull()
    } finally {
      await logoutApp.cleanup()
    }

    const blockedApp = await mountApp(ADMIN_PROFILE_PATH)

    try {
      expect(blockedApp.container.innerHTML).not.toContain('admin-header')
      expect(blockedApp.container.innerHTML).toContain('auth-page')
      assertCleanConsole(consoleSpy, blockedApp.container)
    } finally {
      consoleSpy.restore()
      await blockedApp.cleanup()
    }
  })
})
