import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminAccountMenu from './AdminAccountMenu'
import {
  clearAccessToken,
  setAccessToken,
  setAuthUser,
} from '../../auth/utils/authStorage'

describe('AdminAccountMenu', () => {
  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('renderiza la estructura del menú de cuenta con opciones futuras', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <AdminAccountMenu />
      </MemoryRouter>,
    )

    expect(markup).toContain('admin-account-menu')
    expect(markup).toContain('Opciones de cuenta')
    expect(markup).toContain('Ver perfil')
    expect(markup).toContain('Configuración')
    expect(markup).toContain('Próximamente')
    expect(markup).toContain('Cerrar sesión')
    expect(markup).toContain('aria-haspopup="menu"')
    expect(markup).toContain('aria-label="Opciones de cuenta"')
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
