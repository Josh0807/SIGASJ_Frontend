import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import {
  clearAccessToken,
  setAccessToken,
  setAuthUser,
} from '../utils/authStorage'

describe('ProtectedRoute', () => {
  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('redirige al login cuando la sesión se invalida sin remontar la ruta', async () => {
    setAccessToken('token-demo')
    setAuthUser({ name: 'Ana', role: 'ADMINISTRADORA' })

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
                <ProtectedRoute>
                  <p>Panel protegido</p>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<p>Pantalla login</p>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Panel protegido')

    await act(async () => {
      clearAccessToken()
    })

    expect(container.textContent).toContain('Pantalla login')
    expect(container.textContent).not.toContain('Panel protegido')
  })
})
