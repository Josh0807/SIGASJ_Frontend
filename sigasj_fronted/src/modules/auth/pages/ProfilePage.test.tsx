import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProfilePage from './ProfilePage'

vi.mock('../components/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '42',
      name: 'Ana',
      lastName: 'Ruiz',
      email: 'admin@asadasanjuan.cr',
      role: 'Administradora',
    },
  }),
}))

describe('ProfilePage — alcance de acceso', () => {
  it('muestra los datos de sesión sin formularios ni edición', () => {
    const markup = renderToStaticMarkup(<ProfilePage />)

    expect(markup).toContain('Mi perfil')
    expect(markup).toContain('Ana Ruiz')
    expect(markup).toContain('admin@asadasanjuan.cr')
    expect(markup).toContain('Administradora')
    expect(markup).toContain('42')
    expect(markup).not.toContain('<form')
    expect(markup).not.toContain('<input')
    expect(markup).not.toContain('<textarea')
    expect(markup).not.toContain('<select')
    expect(markup).not.toContain('<button')
    expect(markup).not.toMatch(/contraseña|password|guardar/i)
  })
})
