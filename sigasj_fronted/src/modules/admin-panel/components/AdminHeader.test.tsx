import { act, type ComponentProps } from 'react'
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
import AdminHeader from './AdminHeader'
import { AuthProvider } from '../../auth/components/AuthContext'
import {
  clearAccessToken,
  setAccessToken,
  setAuthUser,
} from '../../auth/utils/authStorage'

const renderHeader = (props: ComponentProps<typeof AdminHeader> = {}) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <AdminHeader {...props} />
    </MemoryRouter>,
  )

describe('AdminHeader', () => {
  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('muestra nombre y rol del usuario autenticado', () => {
    setAuthUser({
      name: 'María',
      lastName: 'Solís',
      role: 'ADMINISTRADORA',
    })

    const markup = renderHeader()

    expect(markup).toContain('María Solís')
    expect(markup).toContain('Administradora')
    expect(markup).toContain('>MS<')
  })

  it('renderiza la estructura general del encabezado administrativo', () => {
    const markup = renderHeader()

    expect(markup).toContain('admin-header__start')
    expect(markup).toContain('admin-header__account')
    expect(markup).toContain('Panel administrativo')
    expect(markup).toContain('href="/"')
    expect(markup).toContain('aria-label="Ver sitio público"')
    expect(markup).toContain('Ver sitio público')
    expect(markup).toContain('Opciones de cuenta')
    expect(markup).toContain('admin-account-menu')
  })

  it('usa valores por defecto cuando no hay datos de usuario', () => {
    const markup = renderHeader()

    expect(markup).toContain('Usuario')
    expect(markup).not.toContain('admin-header__user-detail')
    expect(markup).toContain('visually-hidden')
    expect(markup).toContain('>US<')
  })

  it('muestra el rol formateado cuando está disponible', () => {
    setAuthUser({
      name: 'Carlos',
      role: 'SECRETARIA_EJECUTIVA',
    })

    const markup = renderHeader()

    expect(markup).toContain('Carlos')
    expect(markup).toContain('Secretaria Ejecutiva')
    expect(markup).toContain('visually-hidden">Carlos, Secretaria Ejecutiva<')
  })

  it('oculta el detalle visual cuando hay nombre pero no rol', () => {
    setAuthUser({ name: 'Ana' })

    const markup = renderHeader()

    expect(markup).toContain('Ana')
    expect(markup).not.toContain('admin-header__user-detail')
    expect(markup).toContain('visually-hidden">Ana<')
  })

  it('permanece estable cuando la sesión no tiene perfil de usuario', () => {
    setAccessToken('token-sin-perfil')

    const markup = renderHeader()

    expect(markup).toContain('Usuario')
    expect(markup).not.toContain('admin-header__user-detail')
    expect(markup).not.toMatch(/\bundefined\b/i)
    expect(markup).not.toMatch(/\bnull\b/i)
    expect(markup).not.toContain('[object Object]')
  })

  it('muestra rol sin inventar nombre cuando falta el nombre', () => {
    setAuthUser({ role: 'FONTANERO' })

    const markup = renderHeader()

    expect(markup).toContain('Usuario')
    expect(markup).toContain('Fontanero')
    expect(markup).not.toMatch(/\bundefined\b/i)
    expect(markup).not.toMatch(/\bnull\b/i)
  })

  it('ignora valores técnicos inválidos en nombre y rol', () => {
    setAuthUser({
      name: 'undefined',
      lastName: 'null',
      role: 'undefined',
    })

    const markup = renderHeader()

    expect(markup).toContain('Usuario')
    expect(markup).not.toContain('admin-header__user-detail')
    expect(markup).not.toMatch(/\bundefined\b/i)
    expect(markup).not.toMatch(/\bnull\b/i)
  })

  it('no expone email, id, token ni datos internos de sesión', () => {
    setAccessToken('secreto-no-debe-aparecer')
    setAuthUser({
      id: 'user-id-interno',
      email: 'admin@sigasj.local',
      role: 'ADMINISTRADORA',
    })

    const markup = renderHeader()

    expect(markup).toContain('Usuario')
    expect(markup).toContain('Administradora')
    expect(markup).not.toContain('secreto-no-debe-aparecer')
    expect(markup).not.toContain('user-id-interno')
    expect(markup).not.toContain('admin@sigasj.local')
    expect(markup).not.toContain('sigasj_access_token')
  })

  it('muestra avatar cuando está disponible', () => {
    setAuthUser({
      name: 'Ana',
      role: 'SECRETARIA',
      avatar: '/avatar.png',
    })

    const markup = renderHeader()

    expect(markup).toContain('admin-header__avatar--image')
    expect(markup).toContain('src="/avatar.png"')
  })

  it('expone el toggle del menú móvil con atributos de accesibilidad', () => {
    const markup = renderHeader({ menuOpen: true })

    expect(markup).toContain('admin-menu-toggle')
    expect(markup).toContain('aria-controls="admin-navigation"')
    expect(markup).toContain('aria-expanded="true"')
    expect(markup).toContain('Cerrar menú administrativo')
    expect(markup).toContain('<svg')
  })

  it('propaga el toggle del menú al layout administrativo', async () => {
    const onToggleMenu = vi.fn()

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminHeader menuOpen={false} onToggleMenu={onToggleMenu} />
        </MemoryRouter>,
      )
    })

    const toggle = container.querySelector(
      '.admin-menu-toggle',
    ) as HTMLButtonElement

    await act(async () => {
      toggle.click()
    })

    expect(onToggleMenu).toHaveBeenCalledTimes(1)
  })

  it('actualiza nombre y rol cuando cambia la sesión autenticada', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    const readUserSection = () =>
      container.querySelector('.admin-header__user')?.textContent ?? ''

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminHeader />
        </MemoryRouter>,
      )
    })

    expect(readUserSection()).toContain('Usuario')

    await act(async () => {
      setAccessToken('token-usuario-a')
      setAuthUser({
        name: 'María',
        lastName: 'Solís',
        role: 'ADMINISTRADORA',
      })
    })

    expect(readUserSection()).toContain('María Solís')
    expect(readUserSection()).toContain('Administradora')
    expect(readUserSection()).not.toContain('Carlos')

    await act(async () => {
      clearAccessToken()
      setAccessToken('token-usuario-b')
      setAuthUser({
        name: 'Carlos',
        lastName: 'Mora',
        role: 'FONTANERO',
      })
    })

    expect(readUserSection()).toContain('Carlos Mora')
    expect(readUserSection()).toContain('Fontanero')
    expect(readUserSection()).not.toContain('María Solís')
    expect(readUserSection()).not.toContain('Administradora')

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('abre el menú de cuenta, navega a Mi perfil y conserva la información del usuario', async () => {
    setAccessToken('local-admin-session')
    setAuthUser({
      name: 'María',
      lastName: 'Solís',
      role: 'ADMINISTRADORA',
    })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    const readUserSection = () =>
      container.querySelector('.admin-header__user')?.textContent ?? ''

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[ADMIN_HOME_PATH]}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector(
      '.admin-account-menu__trigger',
    ) as HTMLButtonElement
    const panel = container.querySelector(
      '.admin-account-menu__panel',
    ) as HTMLDivElement

    expect(readUserSection()).toContain('María Solís')
    expect(readUserSection()).toContain('Administradora')

    await act(async () => {
      trigger.click()
    })

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(panel.hasAttribute('hidden')).toBe(false)

    await act(async () => {
      trigger.click()
    })

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hasAttribute('hidden')).toBe(true)

    await act(async () => {
      trigger.click()
    })

    const profileLink = container.querySelector(
      `.admin-account-menu__item--link[href="${ADMIN_PROFILE_PATH}"]`,
    ) as HTMLAnchorElement
    const configItem = container.querySelector(
      '.admin-account-menu__item--disabled',
    ) as HTMLButtonElement

    expect(profileLink).not.toBeNull()
    expect(configItem?.textContent).toContain('Configuración')
    expect(configItem?.textContent).toContain('Próximamente')
    expect(configItem?.disabled).toBe(true)

    await act(async () => {
      profileLink.click()
    })

    expect(
      container.querySelector('.admin-main__content h1')?.textContent,
    ).toBe(ADMIN_PROFILE_TITLE)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hasAttribute('hidden')).toBe(true)
    expect(readUserSection()).toContain('María Solís')
    expect(readUserSection()).toContain('Administradora')
    expect(container.querySelector('.admin-header')).not.toBeNull()
  })

  it('cierra sesión desde el menú de cuenta', async () => {
    setAccessToken('local-admin-session')
    setAuthUser({ name: 'Ana' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/galeria']}>
          <Routes>
            <Route path="/admin/galeria" element={<AdminHeader />} />
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
    expect(localStorage.getItem('sigasj_auth_user')).toBeNull()
    expect(container.textContent).toContain('Pantalla login')
  })
})
