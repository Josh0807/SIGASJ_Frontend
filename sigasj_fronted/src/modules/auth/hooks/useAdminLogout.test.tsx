import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/publicRoutes'
import { useAdminLogout } from './useAdminLogout'
import {
  clearAccessToken,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
  setAccessToken,
  setAuthUser,
} from '../utils/authStorage'

const LogoutProbe = () => {
  const logout = useAdminLogout()

  return (
    <button type="button" className="logout-probe" onClick={logout}>
      Cerrar sesión
    </button>
  )
}

describe('useAdminLogout', () => {
  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('invalida la sesión del front-end y redirige al login', async () => {
    localStorage.setItem('otra-funcionalidad', 'valor-persistente')
    setAccessToken('token-demo')
    setAuthUser({ name: 'Ana', role: 'ADMINISTRADORA' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Routes>
            <Route path="/admin/dashboard" element={<LogoutProbe />} />
            <Route path={LOGIN_ROUTE_PATH} element={<p>Pantalla login</p>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    const button = container.querySelector('.logout-probe') as HTMLButtonElement

    await act(async () => {
      button.click()
    })

    expect(getAccessToken()).toBeNull()
    expect(getAuthUser()).toBeNull()
    expect(isAuthenticated()).toBe(false)
    expect(localStorage.getItem('sigasj_access_token')).toBeNull()
    expect(localStorage.getItem('sigasj_auth_user')).toBeNull()
    expect(localStorage.getItem('otra-funcionalidad')).toBe('valor-persistente')
    expect(container.textContent).toContain('Pantalla login')
  })

  it('navega a la ruta real de login con replace tras invalidar la sesión', async () => {
    expect(LOGIN_ROUTE_PATH).toBe('/login')
    setAccessToken('token-demo')

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Routes>
            <Route path="/admin/dashboard" element={<LogoutProbe />} />
            <Route path={LOGIN_ROUTE_PATH} element={<p>Pantalla login</p>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    await act(async () => {
      container.querySelector('.logout-probe')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
      )
    })

    expect(isAuthenticated()).toBe(false)
    expect(container.textContent).toContain('Pantalla login')
  })
})
