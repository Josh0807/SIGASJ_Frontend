import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './ProtectedRoute'
import {
  clearAccessToken,
  getAuthUser,
  setAccessToken,
  setAuthUser,
} from '../utils/authStorage'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          id: '1',
          email: 'ana@asadasanjuan.cr',
          role: getAuthUser()?.role ?? 'Administradora',
          name: getAuthUser()?.name ?? 'Ana',
        }),
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('sin sesión no muestra Gestión de asociados y redirige a /login', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/abonados']}>
          <AuthProvider>
            <Routes>
            <Route
              path="/admin/abonados"
              element={
                <ProtectedRoute>
                  <p>Gestión de asociados</p>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<p>Iniciar sesión</p>} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Iniciar sesión')
    expect(container.textContent).not.toContain('Gestión de asociados')
  })

  it('con sesión válida deja continuar (la autorización por rol es un paso posterior)', async () => {
    setAccessToken('token-demo')
    setAuthUser({ name: 'Ana', role: 'Abonado' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/abonados']}>
          <AuthProvider>
            <Routes>
            <Route
              path="/admin/abonados"
              element={
                <ProtectedRoute>
                  <p>Gestión de asociados</p>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<p>Iniciar sesión</p>} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Gestión de asociados')
    expect(container.textContent).not.toContain('Iniciar sesión')
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
          <AuthProvider>
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
          </AuthProvider>
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

  it('invalida Gestión de asociados al cerrar sesión sin desmontar ProtectedRoute', async () => {
    setAccessToken('token-demo')
    setAuthUser({ name: 'Ana', role: 'Administradora' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/abonados']}>
          <AuthProvider>
            <Routes>
            <Route
              path="/admin/abonados"
              element={
                <ProtectedRoute>
                  <p>Gestión de asociados</p>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<p>Iniciar sesión</p>} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Gestión de asociados')

    await act(async () => {
      clearAccessToken()
    })

    expect(container.textContent).toContain('Iniciar sesión')
    expect(container.textContent).not.toContain('Gestión de asociados')
  })

  it('al usar Atrás hacia Gestión de asociados sin sesión no muestra contenido privado', async () => {
    clearAccessToken()

    const router = createMemoryRouter(
      [
        {
          path: '/admin/abonados',
          element: (
            <ProtectedRoute>
              <p>Gestión de asociados</p>
            </ProtectedRoute>
          ),
        },
        { path: '/login', element: <p>Iniciar sesión</p> },
      ],
      {
        initialEntries: ['/admin/abonados', '/login'],
        initialIndex: 1,
      },
    )

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>,
      )
    })

    expect(router.state.location.pathname).toBe('/login')

    await act(async () => {
      await router.navigate(-1)
    })

    expect(router.state.location.pathname).toBe('/login')
    expect(container.textContent).toContain('Iniciar sesión')
    expect(container.textContent).not.toContain('Gestión de asociados')
  })
})
