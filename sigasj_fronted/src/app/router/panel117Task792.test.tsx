import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_HOME_PATH } from './privateRoutes'
import { clearAccessToken } from '../../modules/auth/utils/authStorage'
import { loginWithAdminSession } from '../../test/authTestHelpers'
import { mountInteractiveApp } from '../../test/adminPanelTestHelpers'
import { setViewportWidth } from '../../test/viewportHelpers'

describe('Tarea #792 — panel en computadora, tableta y celular', () => {
  beforeEach(() => {
    clearAccessToken()
    loginWithAdminSession()
  })

  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  const mountDashboard = async (width: number) => {
    setViewportWidth(width)
    return mountInteractiveApp([ADMIN_HOME_PATH])
  }

  it('computadora (1280px): sidebar accesible sin drawer y dashboard legible', async () => {
    const app = await mountDashboard(1280)

    try {
      const sidebar = app.container.querySelector('.admin-sidebar')
      expect(sidebar).not.toBeNull()
      expect(sidebar?.hasAttribute('inert')).toBe(false)
      expect(app.container.innerHTML).toContain('Dashboard administrativo')
      expect(app.container.innerHTML).toContain('admin-dashboard__indicators-grid')
      expect(app.container.querySelector('.admin-layout')?.className).not.toContain(
        'admin-layout--nav-open',
      )
      expect(app.container.querySelector('.admin-sidebar__link')).not.toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('tableta (900px): mantiene sidebar accesible y contenido legible', async () => {
    const app = await mountDashboard(900)

    try {
      const sidebar = app.container.querySelector('.admin-sidebar')
      expect(sidebar).not.toBeNull()
      expect(sidebar?.hasAttribute('inert')).toBe(false)
      expect(app.container.innerHTML).toContain('admin-header')
      expect(app.container.innerHTML).toContain('Dashboard administrativo')
    } finally {
      await app.cleanup()
    }
  })

  it('celular (390px): sidebar en drawer, abre con hamburguesa y cierra con backdrop', async () => {
    const app = await mountDashboard(390)

    try {
      const sidebar = app.container.querySelector('.admin-sidebar')
      expect(sidebar?.hasAttribute('inert')).toBe(true)

      const toggle = app.container.querySelector('.admin-menu-toggle')
      expect(toggle).not.toBeNull()

      await act(async () => {
        ;(toggle as HTMLButtonElement).click()
      })

      expect(sidebar?.hasAttribute('inert')).toBe(false)

      const layout = app.container.querySelector('.admin-layout')
      expect(layout?.classList.contains('admin-layout--nav-open')).toBe(true)

      const backdrop = app.container.querySelector('.admin-nav-backdrop')
      expect(backdrop).not.toBeNull()

      await act(async () => {
        ;(backdrop as HTMLButtonElement).click()
      })

      expect(layout?.classList.contains('admin-layout--nav-open')).toBe(false)
      expect(sidebar?.hasAttribute('inert')).toBe(true)
      expect(document.body.style.overflow).toBe('')
    } finally {
      await app.cleanup()
    }
  })

  it('cambio de orientación simula transición móvil ↔ escritorio sin errores de consola', async () => {
    const errors: unknown[] = []
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args)
    }

    try {
      setViewportWidth(390)
      const mobileApp = await mountInteractiveApp([ADMIN_HOME_PATH])

      try {
        expect(mobileApp.container.querySelector('.admin-menu-toggle')).not.toBeNull()
      } finally {
        await mobileApp.cleanup()
      }

      setViewportWidth(1024)
      const desktopApp = await mountInteractiveApp([ADMIN_HOME_PATH])

      try {
        expect(
          desktopApp.container.querySelector('.admin-sidebar')?.hasAttribute('inert'),
        ).toBe(false)
        expect(desktopApp.container.querySelector('.admin-sidebar')).not.toBeNull()
      } finally {
        await desktopApp.cleanup()
      }

      expect(errors).toEqual([])
    } finally {
      console.error = originalError
    }
  })
})
