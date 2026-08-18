import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AppRoutes from '../../../app/router/AppRoutes'
import {
  ADMIN_HOME_PATH,
  ADMIN_PROFILE_PATH,
  ADMIN_PROFILE_TITLE,
} from '../../../app/router/privateRoutes'
import AdminAccountMenu from './AdminAccountMenu'
import {
  clearAccessToken,
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

describe('AdminAccountMenu', () => {
  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
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
            <Route path="/login" element={<p>Pantalla login</p>} />
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

    expect(localStorage.getItem('sigasj_access_token')).toBeNull()
    expect(container.textContent).toContain('Pantalla login')
  })
})
