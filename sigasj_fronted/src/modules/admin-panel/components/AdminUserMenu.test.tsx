import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminUserMenu from './AdminUserMenu'
import {
  getAccessToken,
  isAuthenticated,
  setAccessToken,
} from '../../auth/utils/authStorage'
import { LOGIN_ROUTE_PATH } from '../../../app/router/publicRoutes'

describe('AdminUserMenu', () => {
  beforeEach(() => {
    setAccessToken('token-demo-test')
  })

  const renderMenu = () =>
    renderToStaticMarkup(
      <MemoryRouter>
        <AdminUserMenu userName="Administrador" userRole="ASADA San Juan" />
      </MemoryRouter>,
    )

  it('renderiza la información del usuario y las iniciales del avatar', () => {
    const markup = renderMenu()

    expect(markup).toContain('admin-user-menu')
    expect(markup).toContain('Administrador')
    expect(markup).toContain('ASADA San Juan')
    expect(markup).toContain('AD')
  })

  it('reutiliza el logout existente y deja de estar autenticado', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/abonados']}>
          <Routes>
            <Route path="/admin/abonados" element={<AdminUserMenu />} />
            <Route path={LOGIN_ROUTE_PATH} element={<p>Iniciar sesión</p>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector<HTMLButtonElement>('.admin-user-menu__trigger')
    expect(trigger).not.toBeNull()

    await act(async () => {
      trigger?.click()
    })

    const logoutBtn = container.querySelector<HTMLButtonElement>('.admin-user-menu__logout-btn')
    expect(logoutBtn).not.toBeNull()
    expect(container.innerHTML).toContain('Cerrar sesión')

    await act(async () => {
      logoutBtn?.click()
    })

    expect(getAccessToken()).toBeNull()
    expect(isAuthenticated()).toBe(false)
    expect(container.textContent).toContain('Iniciar sesión')

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('no implementa un logout propio: delega en useAdminLogout', () => {
    const source = AdminUserMenu.toString()

    expect(source).toContain('useAdminLogout')
    expect(source).not.toContain('clearAccessToken')
    expect(source).not.toContain('localStorage')
  })
})
