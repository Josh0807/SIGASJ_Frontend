import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_HOME_PATH, ADMIN_PROFILE_PATH } from './privateRoutes'
import { clearAccessToken, isAuthenticated } from '../../modules/auth/utils/authStorage'
import { loginWithAdminSession } from '../../test/authTestHelpers'
import {
  ACCOUNT_MENU_PROFILE,
  CONFIRM_CANCEL,
  CONFIRM_DIALOG,
  assertBlockedAdminAccess,
  confirmLogout,
  hasAdminChrome,
  mountInteractiveApp,
  openLogoutDialog,
} from '../../test/adminPanelTestHelpers'
import { LOGIN_ROUTE_PATH } from './publicRoutes'
import { setViewportWidth } from '../../test/viewportHelpers'

describe('Tarea #791 — perfil y cierre de sesión', () => {
  beforeEach(() => {
    clearAccessToken()
    loginWithAdminSession()
    setViewportWidth(1280)
  })

  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('abre Mi perfil desde el menú de cuenta con sesión activa', async () => {
    const app = await mountInteractiveApp([ADMIN_HOME_PATH])

    try {
      const trigger = app.container.querySelector('.admin-account-menu__trigger')
      expect(trigger).not.toBeNull()

      await act(async () => {
        ;(trigger as HTMLButtonElement).click()
      })

      const profileLink = app.container.querySelector(ACCOUNT_MENU_PROFILE)
      expect(profileLink).not.toBeNull()

      await act(async () => {
        ;(profileLink as HTMLAnchorElement).click()
      })

      expect(app.currentPath()).toBe(ADMIN_PROFILE_PATH)
      expect(hasAdminChrome(app.container.innerHTML)).toBe(true)
      expect(app.container.innerHTML).toContain('Mi perfil')
    } finally {
      await app.cleanup()
    }
  })

  it('cancelar el diálogo mantiene la sesión y la ruta administrativa', async () => {
    const app = await mountInteractiveApp([ADMIN_HOME_PATH])

    try {
      await openLogoutDialog(app.container)

      const cancelButton = app.container.querySelector(CONFIRM_CANCEL)
      expect(cancelButton).not.toBeNull()

      await act(async () => {
        ;(cancelButton as HTMLButtonElement).click()
      })

      expect(app.container.querySelector(CONFIRM_DIALOG)).toBeNull()
      expect(isAuthenticated()).toBe(true)
      expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
      expect(hasAdminChrome(app.container.innerHTML)).toBe(true)
    } finally {
      await app.cleanup()
    }
  })

  it('confirmar cierre invalida la sesión y bloquea rutas privadas', async () => {
    const app = await mountInteractiveApp([ADMIN_HOME_PATH])

    try {
      await openLogoutDialog(app.container)
      await confirmLogout(app.container)

      expect(isAuthenticated()).toBe(false)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      assertBlockedAdminAccess(app.container)

      await app.navigate(ADMIN_HOME_PATH)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      assertBlockedAdminAccess(app.container)
    } finally {
      await app.cleanup()
    }
  })
})
