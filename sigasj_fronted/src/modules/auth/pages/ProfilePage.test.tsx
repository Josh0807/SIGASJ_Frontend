import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProfilePage from './ProfilePage'

describe('ProfilePage — alcance de acceso', () => {
  it('expone una página de destino sin formularios ni edición', () => {
    const markup = renderToStaticMarkup(<ProfilePage />)

    expect(markup).toContain('Mi perfil')
    expect(markup).toContain('private-module-placeholder')
    expect(markup).not.toContain('<form')
    expect(markup).not.toContain('<input')
    expect(markup).not.toContain('<textarea')
    expect(markup).not.toContain('<select')
    expect(markup).not.toContain('<button')
    expect(markup).not.toMatch(/contraseña|password|avatar|permiso|guardar/i)
  })
})
