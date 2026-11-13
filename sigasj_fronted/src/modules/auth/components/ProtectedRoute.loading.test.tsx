import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './ProtectedRoute'
import {
  clearAccessToken,
  setAccessToken,
  setAuthUser,
} from '../utils/authStorage'

describe('ProtectedRoute - validacion inicial', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('no muestra contenido privado antes de validar la sesion', async () => {
    setAccessToken('token-pendiente')
    setAuthUser({ id: '1', name: 'Ana', role: 'Administradora' })

    let resolveValidation: ((response: Response) => void) | undefined
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveValidation = resolve
          }),
      ),
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

    expect(container.textContent).not.toContain('Contenido privado sensible')
    expect(container.textContent).not.toContain('Iniciar sesion')

    await act(async () => {
      resolveValidation?.({
        ok: true,
        status: 200,
        json: async () => ({
          id: '1',
          email: 'ana@asadasanjuan.cr',
          role: 'ADMINISTRADORA',
          name: 'Ana',
        }),
      } as Response)
      await Promise.resolve()
    })

    expect(container.textContent).toContain('Contenido privado sensible')
    expect(container.textContent).not.toContain('Iniciar sesion')

    await act(async () => {
      root.unmount()
    })
  })
})
