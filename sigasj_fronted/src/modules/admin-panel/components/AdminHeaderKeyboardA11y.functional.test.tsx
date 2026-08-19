import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
  setAuthSession,
} from '../../auth/utils/authStorage'
import { AuthProvider } from '../../auth/components/AuthContext'

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

const getHeaderFocusables = (container: HTMLElement): HTMLElement[] =>
  Array.from(
    container.querySelectorAll(
      '.admin-header a[href], .admin-header button:not([disabled])',
    ),
  ).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && element.tabIndex !== -1,
  )

const tabForward = async (focusables: HTMLElement[], fromIndex: number) => {
  const nextIndex = fromIndex < 0 || fromIndex >= focusables.length - 1 ? 0 : fromIndex + 1

  await act(async () => {
    focusables[nextIndex]?.focus()
  })

  return nextIndex
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

const openAccountMenuWithKeyboard = async (container: HTMLElement) => {
  const headerFocusables = getHeaderFocusables(container)
  const trigger = container.querySelector(
    '.admin-account-menu__trigger',
  ) as HTMLButtonElement

  expect(trigger).not.toBeNull()
  expect(headerFocusables).toContain(trigger)

  let triggerIndex = -1

  await act(async () => {
    document.body.focus()
  })

  for (let step = 0; step < headerFocusables.length; step += 1) {
    triggerIndex = await tabForward(headerFocusables, triggerIndex)

    if (document.activeElement === trigger) {
      break
    }
  }

  expect(document.activeElement).toBe(trigger)

  await act(async () => {
    pressKey(trigger, 'Enter', { activate: true })
  })

  expect(trigger.getAttribute('aria-expanded')).toBe('true')

  return trigger
}

const openLogoutDialog = async (container: HTMLElement) => {
  const profileLink = container.querySelector(
    `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
  ) as HTMLAnchorElement
  const logoutItem = container.querySelector(
    '.admin-account-menu__item--danger',
  ) as HTMLButtonElement

  await act(async () => {
    pressKey(profileLink, 'End')
    pressKey(logoutItem, 'Enter', { activate: true })
  })

  return {
    panel: container.querySelector('.confirm-dialog__panel') as HTMLDivElement,
    cancelButton: container.querySelector(
      '.confirm-dialog__button--secondary',
    ) as HTMLButtonElement,
    confirmButton: container.querySelector(
      '.confirm-dialog__button--danger',
    ) as HTMLButtonElement,
  }
}

describe('AdminHeader — accesibilidad por teclado (pruebas funcionales)', () => {
  let restoreMatchMedia: (() => void) | undefined

  beforeEach(() => {
    clearAccessToken()
    setAuthSession({
      accessToken: 'token-keyboard-a11y',
      user: { name: 'Ana', role: 'Secretaria' },
    })
  })

  afterEach(() => {
    restoreMatchMedia?.()
    restoreMatchMedia = undefined
    document.body.style.overflow = ''
    document.body.innerHTML = ''
  })

  it('Prueba 1 — menú de usuario accesible mediante Tab y apertura con teclado', async () => {
    restoreMatchMedia = mockMobileNav(false)
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const trigger = await openAccountMenuWithKeyboard(app.container)
      const menu = app.container.querySelector('.admin-account-menu__panel')

      expect(menu).not.toBeNull()
      expect(menu?.hasAttribute('hidden')).toBe(false)
      expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 2 — Mi perfil enfocable, activable con Enter y navega a la ruta de perfil', async () => {
    restoreMatchMedia = mockMobileNav(false)
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      await openAccountMenuWithKeyboard(app.container)

      const profileLink = app.container.querySelector(
        `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
      ) as HTMLAnchorElement

      expect(profileLink).not.toBeNull()
      expect(profileLink.getAttribute('role')).toBe('menuitem')
      expect(profileLink.tabIndex).not.toBe(-1)

      await act(async () => {
        profileLink.focus()
      })

      expect(document.activeElement).toBe(profileLink)

      await act(async () => {
        pressKey(profileLink, 'Enter', { activate: true })
      })

      expect(
        app.container.querySelector('.admin-main__content h1')?.textContent,
      ).toBe(ADMIN_PROFILE_TITLE)
      expect(app.container.querySelector('.admin-header')).not.toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 3 — Cerrar sesión enfocable, activable con teclado y abre el diálogo', async () => {
    restoreMatchMedia = mockMobileNav(false)
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      await openAccountMenuWithKeyboard(app.container)

      const profileLink = app.container.querySelector(
        `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
      ) as HTMLAnchorElement
      const logoutItem = app.container.querySelector(
        '.admin-account-menu__item--danger',
      ) as HTMLButtonElement

      expect(logoutItem.type).toBe('button')
      expect(logoutItem.getAttribute('role')).toBe('menuitem')

      await act(async () => {
        pressKey(profileLink, 'ArrowDown')
      })

      expect(document.activeElement).toBe(logoutItem)

      await act(async () => {
        pressKey(logoutItem, 'Enter', { activate: true })
      })

      expect(app.container.querySelector('.confirm-dialog')).not.toBeNull()
      expect(app.container.querySelector('[role="alertdialog"]')).not.toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 4 — diálogo navegable con Tab, Shift+Tab, acciones y Escape', async () => {
    restoreMatchMedia = mockMobileNav(false)
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const trigger = await openAccountMenuWithKeyboard(app.container)

      const { panel, cancelButton, confirmButton } = await openLogoutDialog(app.container)

      expect(document.activeElement).toBe(cancelButton)

      await act(async () => {
        pressKey(panel, 'Tab')
      })

      expect(document.activeElement).toBe(confirmButton)

      await act(async () => {
        pressKey(panel, 'Tab', { shiftKey: true })
      })

      expect(document.activeElement).toBe(cancelButton)

      await act(async () => {
        pressKey(cancelButton, 'Escape')
      })

      expect(app.container.querySelector('.confirm-dialog')).toBeNull()
      expect(document.activeElement).toBe(trigger)
      expect(localStorage.getItem('sigasj_access_token')).toBe('token-keyboard-a11y')

      await openAccountMenuWithKeyboard(app.container)

      const dialogAgain = await openLogoutDialog(app.container)

      await act(async () => {
        pressKey(dialogAgain.cancelButton, 'Enter', { activate: true })
      })

      expect(app.container.querySelector('.confirm-dialog')).toBeNull()

      await openAccountMenuWithKeyboard(app.container)

      const dialogConfirm = await openLogoutDialog(app.container)

      await act(async () => {
        pressKey(dialogConfirm.panel, 'Tab')
        pressKey(dialogConfirm.confirmButton, ' ', { activate: true })
      })

      expect(app.container.querySelector('.confirm-dialog')).toBeNull()
      expect(localStorage.getItem('sigasj_access_token')).toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 5 — foco entra al diálogo, no queda detrás del modal y se restaura al cancelar', async () => {
    const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')

    expect(css).toContain('.admin-account-menu__trigger:focus-visible')
    expect(css).toContain('.confirm-dialog__button:focus-visible')
    expect(css).toContain('.admin-header__action:focus-visible')

    restoreMatchMedia = mockMobileNav(false)
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const trigger = await openAccountMenuWithKeyboard(app.container)
      const publicLink = app.container.querySelector(
        '.admin-header__action--public',
      ) as HTMLAnchorElement

      const { panel, cancelButton, confirmButton } = await openLogoutDialog(app.container)

      expect(document.activeElement).toBe(cancelButton)
      expect(panel.contains(document.activeElement as Node)).toBe(true)
      expect(document.activeElement).not.toBe(publicLink)
      expect(document.activeElement).not.toBe(trigger)

      await act(async () => {
        pressKey(panel, 'Tab')
        pressKey(panel, 'Tab')
        pressKey(panel, 'Tab')
      })

      expect([cancelButton, confirmButton]).toContain(document.activeElement)
      expect(document.activeElement).not.toBe(publicLink)

      await act(async () => {
        cancelButton.focus()
        pressKey(cancelButton, 'Enter', { activate: true })
      })

      expect(app.container.querySelector('.confirm-dialog')).toBeNull()
      expect(document.activeElement).toBe(trigger)
      expect(trigger.matches(':focus-visible, :focus')).toBe(true)
    } finally {
      await app.cleanup()
    }
  })

  it('Prueba 6 — botón de menú móvil activable mediante teclado', async () => {
    restoreMatchMedia = mockMobileNav(true)
    const app = await mountApp(ADMIN_HOME_PATH)

    try {
      const toggle = app.container.querySelector('.admin-menu-toggle') as HTMLButtonElement

      expect(toggle.type).toBe('button')

      await act(async () => {
        toggle.focus()
      })

      expect(document.activeElement).toBe(toggle)
      expect(toggle.getAttribute('aria-expanded')).toBe('false')

      await act(async () => {
        pressKey(toggle, 'Enter', { activate: true })
      })

      expect(toggle.getAttribute('aria-expanded')).toBe('true')
      expect(app.container.querySelector('.admin-layout--nav-open')).not.toBeNull()

      await act(async () => {
        pressKey(toggle, ' ', { activate: true })
      })

      expect(toggle.getAttribute('aria-expanded')).toBe('false')
      expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()
    } finally {
      await app.cleanup()
    }
  })
})
