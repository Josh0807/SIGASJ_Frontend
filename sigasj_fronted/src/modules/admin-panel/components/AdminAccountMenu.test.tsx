import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AppRoutes from '../../../app/router/AppRoutes'
import {
  ADMIN_HOME_PATH,
  ADMIN_PROFILE_PATH,
  ADMIN_PROFILE_TITLE,
} from '../../../app/router/privateRoutes'
import { LOGIN_ROUTE_PATH } from '../../../app/router/publicRoutes'
import AdminAccountMenu from './AdminAccountMenu'
import * as authStorage from '../../auth/utils/authStorage'
import {
  clearAccessToken,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
  setAccessToken,
  setAuthUser,
} from '../../auth/utils/authStorage'

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

const cancelLogoutInDialog = async (container: HTMLElement) => {
  expect(container.querySelector('.confirm-dialog')).not.toBeNull()

  const cancelButton = container.querySelector(
    '.confirm-dialog__button--secondary',
  ) as HTMLButtonElement

  expect(cancelButton).not.toBeNull()
  expect(cancelButton.type).toBe('button')

  await act(async () => {
    cancelButton.click()
  })
}

describe('AdminAccountMenu', () => {
  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('renderiza Mi perfil y opciones futuras en el menú de cuenta', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <AdminAccountMenu />
      </MemoryRouter>,
    )

    expect(markup).toContain('admin-account-menu')
    expect(markup).toContain('Opciones de cuenta')
    expect(markup).toContain(ADMIN_PROFILE_TITLE)
    expect(markup).toContain(`href="${ADMIN_PROFILE_PATH}"`)
    expect(markup).toContain('Configuración')
    expect(markup).toContain('Próximamente')
    expect(markup).not.toContain('Ver perfil')
    expect(markup).toContain('Cerrar sesión')
    expect(markup).toContain('type="button"')
    expect(markup).toContain('admin-account-menu__item--danger')
    expect(markup).toContain('aria-haspopup="menu"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('aria-label="Opciones de cuenta"')
    expect(markup).toContain('role="menuitem"')
  })

  it('permite abrir el menú y activar Mi perfil únicamente con teclado', async () => {
    setAccessToken('local-admin-session')
    setAuthUser({ name: 'Ana' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[ADMIN_HOME_PATH]}>
          <AppRoutes />
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement
    const publicLink = container.querySelector(
      '.admin-header__action--public',
    ) as HTMLAnchorElement

    expect(publicLink).not.toBeNull()
    expect(trigger.tabIndex).not.toBe(-1)

    publicLink.focus()
    expect(document.activeElement).toBe(publicLink)

    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    await act(async () => {
      pressKey(trigger, 'Enter', { activate: true })
    })

    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    const profileLink = container.querySelector(
      `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
    ) as HTMLAnchorElement

    expect(profileLink).not.toBeNull()
    expect(document.activeElement).toBe(profileLink)

    await act(async () => {
      pressKey(profileLink, 'Enter', { activate: true })
    })

    expect(
      container.querySelector('.admin-main__content h1')?.textContent,
    ).toBe(ADMIN_PROFILE_TITLE)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('permite llegar a Mi perfil con Tab cuando el menú está abierto', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminAccountMenu />
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement

    await act(async () => {
      trigger.focus()
      pressKey(trigger, 'Enter', { activate: true })
    })

    const profileLink = container.querySelector(
      `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
    ) as HTMLAnchorElement
    const disabledItem = container.querySelector(
      '.admin-account-menu__item--disabled',
    ) as HTMLButtonElement
    const logoutItem = container.querySelector(
      '.admin-account-menu__item--danger',
    ) as HTMLButtonElement

    expect(profileLink.tabIndex).not.toBe(-1)
    expect(disabledItem.tabIndex).toBe(-1)

    profileLink.focus()
    expect(document.activeElement).toBe(profileLink)

    logoutItem.focus()
    expect(document.activeElement).toBe(logoutItem)
  })

  it('permite cerrar sesión únicamente con teclado', async () => {
    setAccessToken('local-admin-session')
    setAuthUser({ name: 'Ana' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[ADMIN_HOME_PATH]}>
          <AppRoutes />
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement
    const publicLink = container.querySelector(
      '.admin-header__action--public',
    ) as HTMLAnchorElement

    expect(trigger.type).toBe('button')
    expect(publicLink).not.toBeNull()

    publicLink.focus()
    trigger.focus()

    await act(async () => {
      pressKey(trigger, 'Enter', { activate: true })
    })

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-controls')).toBeTruthy()

    const profileLink = container.querySelector(
      `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
    ) as HTMLAnchorElement
    const logoutItem = container.querySelector(
      '.admin-account-menu__item--danger',
    ) as HTMLButtonElement

    expect(profileLink).not.toBeNull()
    expect(logoutItem).not.toBeNull()
    expect(logoutItem.type).toBe('button')
    expect(logoutItem.getAttribute('role')).toBe('menuitem')
    expect(document.activeElement).toBe(profileLink)

    await act(async () => {
      pressKey(profileLink, 'ArrowDown')
    })

    expect(document.activeElement).toBe(logoutItem)

    await act(async () => {
      pressKey(logoutItem, 'Enter', { activate: true })
    })

    expect(container.querySelector('.confirm-dialog')).not.toBeNull()

    const cancelButton = container.querySelector(
      '.confirm-dialog__button--secondary',
    ) as HTMLButtonElement
    const confirmButton = container.querySelector(
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

    expect(localStorage.getItem('sigasj_access_token')).toBeNull()
    expect(localStorage.getItem('sigasj_auth_user')).toBeNull()
    expect(container.textContent).toContain('Iniciar sesión')
    expect(container.innerHTML).not.toContain('admin-header')
  })

  it('activa Cerrar sesión con Space cuando tiene el foco', async () => {
    setAccessToken('local-admin-session')
    setAuthUser({ name: 'Ana' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Routes>
            <Route path="/admin/dashboard" element={<AdminAccountMenu />} />
            <Route path={LOGIN_ROUTE_PATH} element={<p>Pantalla login</p>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement

    await act(async () => {
      trigger.focus()
      pressKey(trigger, ' ', { activate: true })
    })

    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    const profileLink = container.querySelector(
      `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
    ) as HTMLAnchorElement
    const logoutItem = container.querySelector(
      '.admin-account-menu__item--danger',
    ) as HTMLButtonElement

    expect(document.activeElement).toBe(profileLink)

    await act(async () => {
      pressKey(profileLink, 'End')
    })

    expect(document.activeElement).toBe(logoutItem)

    await act(async () => {
      pressKey(logoutItem, ' ', { activate: true })
    })

    await confirmLogoutInDialog(container)

    expect(localStorage.getItem('sigasj_access_token')).toBeNull()
    expect(container.textContent).toContain('Pantalla login')
  })

  it('cierra el menú con Escape y devuelve el foco al trigger', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminAccountMenu />
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement

    await act(async () => {
      trigger.focus()
      pressKey(trigger, 'ArrowDown')
    })

    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    const profileLink = container.querySelector(
      `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
    ) as HTMLAnchorElement

    expect(document.activeElement).toBe(profileLink)

    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      )
    })

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })

  it('navega a Mi perfil desde el menú de cuenta', async () => {
    setAccessToken('local-admin-session')
    setAuthUser({ name: 'Ana' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Routes>
            <Route
              path="/admin/dashboard"
              element={
                <>
                  <AdminAccountMenu />
                  <p>Dashboard</p>
                </>
              }
            />
            <Route path={ADMIN_PROFILE_PATH} element={<p>Pantalla perfil</p>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement

    await act(async () => {
      trigger.click()
    })

    const profileLink = container.querySelector(
      `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
    ) as HTMLAnchorElement

    expect(profileLink).not.toBeNull()
    expect(profileLink.textContent).toContain(ADMIN_PROFILE_TITLE)

    await act(async () => {
      profileLink.click()
    })

    expect(container.textContent).toContain('Pantalla perfil')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('navega a la ruta de perfil registrada mediante AppRoutes', async () => {
    setAccessToken('local-admin-session')
    setAuthUser({ name: 'Ana' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[ADMIN_HOME_PATH]}>
          <AppRoutes />
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement

    await act(async () => {
      trigger.click()
    })

    const profileLink = container.querySelector(
      `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
    ) as HTMLAnchorElement

    expect(profileLink).not.toBeNull()

    await act(async () => {
      profileLink.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
      )
    })

    expect(
      container.querySelector('.admin-main__content h1')?.textContent,
    ).toBe(ADMIN_PROFILE_TITLE)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(
      container.querySelector('.admin-account-menu__panel')?.hasAttribute('hidden'),
    ).toBe(true)
    expect(container.querySelector('.admin-sidebar')).not.toBeNull()
    expect(container.querySelector('.admin-header')).not.toBeNull()
    expect(container.querySelector('.admin-layout')).not.toBeNull()
    expect(container.querySelector('.admin-main__content .admin-header')).toBeNull()
    expect(container.querySelector('.admin-main__content .admin-sidebar')).toBeNull()
  })

  it('cierra el menú antes de ejecutar logout', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminAccountMenu />
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement
    const panel = container.querySelector(
      '.admin-account-menu__panel',
    ) as HTMLDivElement

    await act(async () => {
      trigger.click()
    })

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(panel.hasAttribute('hidden')).toBe(false)

    const logoutItem = container.querySelector(
      '.admin-account-menu__item--danger',
    ) as HTMLButtonElement

    await act(async () => {
      logoutItem.click()
    })

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hasAttribute('hidden')).toBe(true)
    expect(container.querySelector('.confirm-dialog')).not.toBeNull()
  })

  it('expone el diálogo de cerrar sesión con semántica y textos accesibles', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminAccountMenu />
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement

    await act(async () => {
      trigger.click()
    })

    const logoutItem = container.querySelector(
      '.admin-account-menu__item--danger',
    ) as HTMLButtonElement

    await act(async () => {
      logoutItem.click()
    })

    const panel = container.querySelector('[role="alertdialog"]') as HTMLElement
    const title = container.querySelector('.confirm-dialog__title') as HTMLHeadingElement
    const message = container.querySelector('.confirm-dialog__message') as HTMLParagraphElement
    const cancelButton = container.querySelector(
      '.confirm-dialog__button--secondary',
    ) as HTMLButtonElement
    const confirmButton = container.querySelector(
      '.confirm-dialog__button--danger',
    ) as HTMLButtonElement

    expect(panel).not.toBeNull()
    expect(panel.getAttribute('aria-modal')).toBe('true')
    expect(panel.getAttribute('aria-labelledby')).toBe(title.id)
    expect(panel.getAttribute('aria-describedby')).toBe(message.id)
    expect(title.textContent).toBe('Cerrar sesión')
    expect(message.textContent).toContain('Confirme si desea cerrar sesión')
    expect(message.textContent).toContain('iniciar sesión nuevamente')
    expect(cancelButton.textContent).toBe('Cancelar')
    expect(confirmButton.textContent).toBe('Cerrar sesión')
  })

  it('no cierra sesión si el usuario cancela el diálogo', async () => {
    setAccessToken('local-admin-session')
    setAuthUser({ name: 'Ana', role: 'ADMINISTRADORA' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[ADMIN_HOME_PATH]}>
          <AppRoutes />
        </MemoryRouter>,
      )
    })

    expect(isAuthenticated()).toBe(true)
    expect(getAuthUser()?.name).toBe('Ana')

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement

    await act(async () => {
      trigger.click()
    })

    const logoutItem = container.querySelector(
      '.admin-account-menu__item--danger',
    ) as HTMLButtonElement

    await act(async () => {
      logoutItem.click()
    })

    await cancelLogoutInDialog(container)

    expect(getAccessToken()).toBe('local-admin-session')
    expect(getAuthUser()).toEqual({ name: 'Ana', role: 'ADMINISTRADORA' })
    expect(isAuthenticated()).toBe(true)
    expect(container.querySelector('.confirm-dialog')).toBeNull()
    expect(container.innerHTML).toContain('admin-layout')
    expect(container.innerHTML).toContain('admin-header')
    expect(container.innerHTML).not.toContain('auth-page')
    expect(container.textContent).not.toContain('Pantalla login')
    expect(
      container.querySelector('.admin-main__content h1')?.textContent,
    ).toBe('Dashboard administrativo')
  })

  it('no cierra sesión si el usuario cancela el diálogo con Escape', async () => {
    setAccessToken('local-admin-session')
    setAuthUser({ name: 'Ana' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[ADMIN_HOME_PATH]}>
          <AppRoutes />
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement

    await act(async () => {
      trigger.click()
    })

    const logoutItem = container.querySelector(
      '.admin-account-menu__item--danger',
    ) as HTMLButtonElement

    await act(async () => {
      logoutItem.click()
    })

    expect(container.querySelector('.confirm-dialog')).not.toBeNull()

    const cancelButton = container.querySelector(
      '.confirm-dialog__button--secondary',
    ) as HTMLButtonElement

    expect(document.activeElement).toBe(cancelButton)

    await act(async () => {
      pressKey(cancelButton, 'Escape')
    })

    expect(getAccessToken()).toBe('local-admin-session')
    expect(isAuthenticated()).toBe(true)
    expect(container.querySelector('.confirm-dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
    expect(container.innerHTML).toContain('admin-layout')
    expect(
      container.querySelector('.admin-main__content h1')?.textContent,
    ).toBe('Dashboard administrativo')
  })

  it('cierra sesión desde el menú de cuenta', async () => {
    setAccessToken('local-admin-session')
    setAuthUser({ name: 'Ana' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Routes>
            <Route path="/admin/dashboard" element={<AdminAccountMenu />} />
            <Route path={LOGIN_ROUTE_PATH} element={<p>Pantalla login</p>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement

    await act(async () => {
      trigger.click()
    })

    const logoutItem = container.querySelector(
      '.admin-account-menu__item--danger',
    ) as HTMLButtonElement

    await act(async () => {
      logoutItem.click()
    })

    await confirmLogoutInDialog(container)

    expect(localStorage.getItem('sigasj_access_token')).toBeNull()
    expect(localStorage.getItem('sigasj_auth_user')).toBeNull()
    expect(container.textContent).toContain('Pantalla login')
  })

  it('ejecuta logout únicamente al confirmar el diálogo con el botón Cerrar sesión', async () => {
    const clearSpy = vi.spyOn(authStorage, 'clearAccessToken')
    setAccessToken('local-admin-session')
    setAuthUser({ name: 'Ana', role: 'ADMINISTRADORA' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[ADMIN_HOME_PATH]}>
          <AppRoutes />
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement

    await act(async () => {
      trigger.click()
    })

    const logoutItem = container.querySelector(
      '.admin-account-menu__item--danger',
    ) as HTMLButtonElement

    await act(async () => {
      logoutItem.click()
    })

    expect(clearSpy).not.toHaveBeenCalled()
    expect(isAuthenticated()).toBe(true)

    const confirmButton = container.querySelector(
      '.confirm-dialog__button--danger',
    ) as HTMLButtonElement

    expect(confirmButton.textContent).toBe('Cerrar sesión')
    expect(confirmButton.type).toBe('button')

    await act(async () => {
      confirmButton.click()
      confirmButton.click()
    })

    expect(clearSpy).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBeNull()
    expect(getAuthUser()).toBeNull()
    expect(isAuthenticated()).toBe(false)
    expect(container.innerHTML).toContain('auth-page')
  })

  it('no manipula la sesión directamente y delega en useAdminLogout', () => {
    const source = AdminAccountMenu.toString()

    expect(source).toContain('useAdminLogout')
    expect(source).not.toContain('localStorage')
    expect(source).not.toContain('clearAccessToken')
    expect(source).not.toContain('removeItem')
  })
})
