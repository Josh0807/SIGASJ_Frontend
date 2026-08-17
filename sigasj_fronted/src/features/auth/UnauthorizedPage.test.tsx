import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { clearAccessToken, setAuthSession } from './authStorage'
import UnauthorizedPage from './UnauthorizedPage'

const renderUnauthorized = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <AuthProvider>
        <UnauthorizedPage />
      </AuthProvider>
    </MemoryRouter>,
  )

describe('UnauthorizedPage', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
  })

  it('muestra marca SIGASJ, mensaje accesible y enlace al login sin sesión', () => {
    const markup = renderUnauthorized()

    expect(markup).toContain('auth-page__brand')
    expect(markup).toContain('SIGASJ')
    expect(markup).toContain('role="alert"')
    expect(markup).toContain('Acceso no autorizado')
    expect(markup).toContain('Debes iniciar sesión')
    expect(markup).toContain('href="/login"')
    expect(markup).toContain('Ir a iniciar sesión')
    expect(markup).not.toContain('users.manage')
    expect(markup).not.toContain('/admin/usuarios')
  })

  it('muestra botón para volver al panel del rol autenticado', () => {
    setAuthSession({
      accessToken: 'token-secretaria',
      user: { rol: 'Secretaria', idUsuario: 2 },
    })

    const markup = renderUnauthorized()

    expect(markup).toContain('Tu cuenta no tiene permiso')
    expect(markup).toContain('Volver al panel')
    expect(markup).toContain('href="/admin/dashboard"')
    expect(markup).not.toContain('Secretaria')
  })

  it('usa layout responsive compartido con login', () => {
    const markup = renderUnauthorized()

    expect(markup).toContain('auth-page')
    expect(markup).toContain('auth-page__card')
    expect(markup).toContain('href="/"')
  })
})
