import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { clearAccessToken, setAuthSession } from '../utils/authStorage'
import UnauthorizedPage from './UnauthorizedPage'

const renderUnauthorizedMarkup = () =>
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
    document.body.innerHTML = ''
  })

  it('sin sesión redirige al login y no muestra Acceso denegado', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/unauthorized']}>
            <Routes>
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/login" element={<p>Iniciar sesión</p>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>,
      )
    })

    expect(container.textContent).toContain('Iniciar sesión')
    expect(container.textContent).not.toContain('Acceso denegado')
  })

  it('con sesión muestra Acceso denegado, explicación y enlace al panel del rol', () => {
    setAuthSession({
      accessToken: 'token-secretaria',
      user: { role: 'Secretaria', id: '2' },
    })

    const markup = renderUnauthorizedMarkup()

    expect(markup).toContain('auth-page__brand')
    expect(markup).toContain('SIGASJ')
    expect(markup).toContain('id="access-denied-title"')
    expect(markup).toContain('aria-labelledby="access-denied-title"')
    expect(markup).toContain('Acceso denegado')
    expect(markup).toContain('No tiene permisos para acceder a esta sección.')
    expect(markup).toContain('role="alert"')
    expect(markup).toContain('Volver al panel')
    expect(markup).toContain('href="/admin/dashboard"')
    expect(markup).toContain('href="/"')
    expect(markup).toContain('Volver a la página principal')
    expect(markup).not.toContain('403')
    expect(markup).not.toContain('Secretaria')
  })

  it('Abonado autenticado no inventa destino de panel; solo usa rutas reales', () => {
    setAuthSession({
      accessToken: 'token-abonado',
      user: { role: 'Abonado', id: '4' },
    })

    const markup = renderUnauthorizedMarkup()

    expect(markup).toContain('Acceso denegado')
    expect(markup).toContain('No tiene permisos para acceder a esta sección.')
    expect(markup).not.toContain('Volver al panel')
    expect(markup).not.toContain('/admin/dashboard')
    expect(markup).toContain('href="/"')
  })

  it('usa layout responsive compartido con login y enlaces reales', () => {
    setAuthSession({
      accessToken: 'token-admin',
      user: { role: 'Administradora', id: '1' },
    })

    const markup = renderUnauthorizedMarkup()

    expect(markup).toContain('auth-page')
    expect(markup).toContain('auth-page__card')
    expect(markup).toContain('auth-page__submit')
    expect(markup).toContain('auth-page__back')
    expect(markup).toContain('<a ')
  })
})
