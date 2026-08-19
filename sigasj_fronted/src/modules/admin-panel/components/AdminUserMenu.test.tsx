import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import AdminUserMenu from './AdminUserMenu'
import { setAccessToken } from '../../auth/utils/authStorage'

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

  it('permite alternar el menú desplegable y realizar el cierre de sesión al hacer clic', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminUserMenu />
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector<HTMLButtonElement>('.admin-user-menu__trigger')
    expect(trigger).not.toBeNull()

    // Abrir menú desplegable
    await act(async () => {
      trigger?.click()
    })

    const logoutBtn = container.querySelector<HTMLButtonElement>('.admin-user-menu__logout-btn')
    expect(logoutBtn).not.toBeNull()
    expect(container.innerHTML).toContain('Cerrar sesión')

    // Ejecutar logout
    await act(async () => {
      logoutBtn?.click()
    })

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })
})
