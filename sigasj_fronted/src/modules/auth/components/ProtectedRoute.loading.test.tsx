import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './ProtectedRoute'
import * as authApi from '../services/authApi'
import {
  clearAccessToken,
  setAccessToken,
  setAuthUser,
} from '../utils/authStorage'

describe('ProtectedRoute - validacion inicial', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('con sesión local muestra contenido mientras valida /auth/me (render optimista)', async () => {
    setAccessToken('token-pendiente')
    setAuthUser({ id: '1', name: 'Ana', role: 'Administradora' })

    let resolveValidation: ((value: Awaited<ReturnType<typeof authApi.fetchCurrentUser>>) => void) | undefined
    vi.spyOn(authApi, 'fetchCurrentUser').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveValidation = resolve
        }),
    )

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <p>Contenido privado sensible</p>
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<p>Iniciar sesion</p>} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Contenido privado sensible')
    expect(container.textContent).not.toContain('Iniciar sesion')

    await act(async () => {
      resolveValidation?.({
        id: '1',
        email: 'ana@asadasanjuan.cr',
        role: 'ADMINISTRADORA',
        name: 'Ana',
      })
      await Promise.resolve()
    })

    expect(container.textContent).toContain('Contenido privado sensible')
    expect(container.textContent).not.toContain('Iniciar sesion')

    await act(async () => {
      root.unmount()
    })
  })

  it('sin sesión autenticada no muestra contenido privado mientras carga', async () => {
    setAccessToken('token-pendiente')
    // Sin perfil local: isAuthenticated puede ser true por token; forzar ausencia de token+user
    clearAccessToken()

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <p>Contenido privado sensible</p>
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<p>Iniciar sesion</p>} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>,
      )
    })

    expect(container.textContent).not.toContain('Contenido privado sensible')
    expect(container.textContent).toContain('Iniciar sesion')

    await act(async () => {
      root.unmount()
    })
  })
})
