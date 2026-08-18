import { act, type ComponentProps } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminHeader from './AdminHeader'
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

    expect(markup).toContain('Sesión administrativa')
    expect(markup).toContain('SIGASJ')
    expect(markup).toContain('visually-hidden')
    expect(markup).toContain('>SA<')
  })

  it('oculta el detalle visual cuando hay nombre pero no rol', () => {
    setAuthUser({ name: 'Ana' })

    const markup = renderHeader()

    expect(markup).toContain('Ana')
    expect(markup).not.toContain('admin-header__user-detail')
    expect(markup).toContain('visually-hidden">Ana<')
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
