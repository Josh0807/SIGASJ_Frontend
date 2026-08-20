import { act } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { expect } from 'vitest'
import AppRoutes from '../app/router/AppRoutes'
import { AuthProvider } from '../modules/auth/components/AuthContext'
import { ADMIN_PROFILE_PATH } from '../app/router/privateRoutes'
import { LOGIN_ROUTE_PATH } from '../app/router/routePaths'

export const ACCOUNT_MENU_TRIGGER = '.admin-account-menu__trigger'
export const ACCOUNT_MENU_LOGOUT = '.admin-account-menu__item--danger'
export const ACCOUNT_MENU_PROFILE = `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`
export const CONFIRM_DIALOG = '.confirm-dialog'
export const CONFIRM_LOGOUT = '.confirm-dialog__button--danger'
export const CONFIRM_CANCEL = '.confirm-dialog__button--secondary'

export const hasAdminChrome = (html: string) =>
  html.includes('admin-layout') &&
  html.includes('admin-sidebar') &&
  html.includes('admin-header')

export const assertBlockedAdminAccess = (container: HTMLElement) => {
  expect(container.innerHTML).toContain('auth-page')
  expect(container.innerHTML).not.toContain('admin-layout')
  expect(hasAdminChrome(container.innerHTML)).toBe(false)
}

export const mountInteractiveApp = async (
  initialEntries: string[],
  initialIndex = initialEntries.length - 1,
) => {
  const router = createMemoryRouter(
    [{ path: '/*', element: <AuthProvider><AppRoutes /></AuthProvider> }],
    { initialEntries, initialIndex },
  )

  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(<RouterProvider router={router} />)
  })

  return {
    container,
    router,
    currentPath: () => router.state.location.pathname,
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

export const submitLoginForm = async (container: HTMLElement) => {
  const form = container.querySelector('.auth-page__form') as HTMLFormElement | null
  expect(form).not.toBeNull()

  await act(async () => {
    form?.requestSubmit()
    await new Promise((resolve) => setTimeout(resolve, 50))
  })
}

export const openAccountMenu = async (container: HTMLElement) => {
  const trigger = container.querySelector(ACCOUNT_MENU_TRIGGER) as HTMLButtonElement | null
  expect(trigger).not.toBeNull()

  await act(async () => {
    trigger?.click()
  })
}

export const openLogoutDialog = async (container: HTMLElement) => {
  await openAccountMenu(container)

  const logoutItem = container.querySelector(ACCOUNT_MENU_LOGOUT) as HTMLButtonElement | null
  expect(logoutItem).not.toBeNull()

  await act(async () => {
    logoutItem?.click()
  })

  expect(container.querySelector(CONFIRM_DIALOG)).not.toBeNull()
}

export const confirmLogout = async (container: HTMLElement) => {
  const confirmButton = container.querySelector(CONFIRM_LOGOUT) as HTMLButtonElement | null
  expect(confirmButton).not.toBeNull()

  await act(async () => {
    confirmButton?.click()
  })
}

export const logoutFromPanel = async (container: HTMLElement) => {
  await openLogoutDialog(container)
  await confirmLogout(container)
  expect(container.querySelector(CONFIRM_DIALOG)).toBeNull()
}

export const readHeaderUser = (container: HTMLElement) => ({
  name: container.querySelector('.admin-header__user-name')?.textContent ?? '',
  role: container.querySelector('.admin-header__user-detail')?.textContent ?? '',
})

export { LOGIN_ROUTE_PATH }
