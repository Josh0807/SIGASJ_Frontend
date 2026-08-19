import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes, createMemoryRouter, RouterProvider } from 'react-router-dom'
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

  it('sin sesión no muestra Gestión de Abonados y redirige a /login', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/abonados']}>
          <Routes>
            <Route
              path="/admin/abonados"
              element={
                <ProtectedRoute>
                  <p>Gestión de abonados</p>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<p>Iniciar sesión</p>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Iniciar sesión')
    expect(container.textContent).not.toContain('Gestión de abonados')
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
          <Routes>
            <Route
              path="/admin/abonados"
              element={
                <ProtectedRoute>
                  <p>Gestión de abonados</p>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<p>Iniciar sesión</p>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Gestión de abonados')
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

  it('invalida Gestión de Abonados al cerrar sesión sin desmontar ProtectedRoute', async () => {
    setAccessToken('token-demo')
    setAuthUser({ name: 'Ana', role: 'Administradora' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/abonados']}>
          <Routes>
            <Route
              path="/admin/abonados"
              element={
                <ProtectedRoute>
                  <p>Gestión de abonados</p>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<p>Iniciar sesión</p>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Gestión de abonados')

    await act(async () => {
      clearAccessToken()
    })

    expect(container.textContent).toContain('Iniciar sesión')
    expect(container.textContent).not.toContain('Gestión de abonados')
  })

  it('al usar Atrás hacia Gestión de Abonados sin sesión no muestra contenido privado', async () => {
    clearAccessToken()

    const router = createMemoryRouter(
      [
        {
          path: '/admin/abonados',
          element: (
            <ProtectedRoute>
              <p>Gestión de abonados</p>
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
      root.render(<RouterProvider router={router} />)
    })

    expect(router.state.location.pathname).toBe('/login')

    await act(async () => {
      await router.navigate(-1)
    })

    expect(router.state.location.pathname).toBe('/login')
    expect(container.textContent).toContain('Iniciar sesión')
    expect(container.textContent).not.toContain('Gestión de abonados')
  })
})
