import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AuthorizedRoute, { AdminAreaGate } from './AuthorizedRoute'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from './AuthContext'

vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

const pendingSession = {
  user: { id: '1', role: 'Administradora' },
  isAuthenticated: true,
  isLoading: true,
  login: vi.fn(),
  logout: vi.fn(),
}

describe('guards de autenticaciÃ³n y autorizaciÃ³n', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.clearAllMocks()
  })

  const renderRoutes = (privateElement: ReactNode) => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/admin/privado']}>
          <Routes>
            <Route path="/login" element={<p>Inicio de sesiÃ³n</p>} />
            <Route path="/unauthorized" element={<p>Acceso denegado</p>} />
            <Route path="/admin/privado" element={privateElement} />
          </Routes>
        </MemoryRouter>,
      )
    })
  }

  it('ProtectedRoute no renderiza contenido privado durante /auth/me', () => {
    mockedUseAuth.mockReturnValue(pendingSession)
    renderRoutes(<ProtectedRoute><p>Dato privado</p></ProtectedRoute>)

    expect(container.textContent).not.toContain('Dato privado')
    expect(container.textContent).not.toContain('Inicio de sesiÃ³n')
  })

  it('AuthorizedRoute no evalÃºa un rol local mientras la sesiÃ³n estÃ¡ pendiente', () => {
    mockedUseAuth.mockReturnValue(pendingSession)
    renderRoutes(
      <AuthorizedRoute allowedRoles={['Administradora']}>
        <p>OperaciÃ³n administrativa</p>
      </AuthorizedRoute>,
    )

    expect(container.textContent).not.toContain('OperaciÃ³n administrativa')
    expect(container.textContent).not.toContain('Acceso denegado')
  })

  it('AdminAreaGate mantiene desmontada el Ã¡rea privada durante la validaciÃ³n', () => {
    mockedUseAuth.mockReturnValue(pendingSession)
    renderRoutes(<AdminAreaGate><p>Panel administrativo</p></AdminAreaGate>)

    expect(container.textContent).not.toContain('Panel administrativo')
  })

  it('redirige al login cuando la validaciÃ³n termina sin sesiÃ³n', () => {
    mockedUseAuth.mockReturnValue({
      ...pendingSession,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
    renderRoutes(<ProtectedRoute><p>Dato privado</p></ProtectedRoute>)

    expect(container.textContent).toContain('Inicio de sesiÃ³n')
    expect(container.textContent).not.toContain('Dato privado')
  })

  it('muestra acceso denegado a un rol autenticado sin permiso', () => {
    mockedUseAuth.mockReturnValue({
      ...pendingSession,
      user: { id: '3', role: 'Fontanero' },
      isLoading: false,
    })
    renderRoutes(
      <AuthorizedRoute allowedRoles={['Administradora', 'Secretaria']}>
        <p>OperaciÃ³n administrativa</p>
      </AuthorizedRoute>,
    )

    expect(container.textContent).toContain('Acceso denegado')
    expect(container.textContent).not.toContain('OperaciÃ³n administrativa')
  })
})
