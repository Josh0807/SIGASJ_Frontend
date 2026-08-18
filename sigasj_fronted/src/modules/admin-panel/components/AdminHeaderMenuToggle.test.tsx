import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import AdminHeaderMenuToggle from './AdminHeaderMenuToggle'

describe('AdminHeaderMenuToggle', () => {
  it('renderiza el botón con accesibilidad y icono de menú', () => {
    const markup = renderToStaticMarkup(
      <AdminHeaderMenuToggle menuOpen={false} onToggleMenu={() => {}} />,
    )

    expect(markup).toContain('type="button"')
    expect(markup).toContain('admin-menu-toggle')
    expect(markup).toContain('Abrir menú administrativo')
    expect(markup).toContain('aria-controls="admin-navigation"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('<svg')
  })

  it('cambia etiqueta e icono cuando el menú está abierto', () => {
    const markup = renderToStaticMarkup(
      <AdminHeaderMenuToggle menuOpen onToggleMenu={() => {}} />,
    )

    expect(markup).toContain('Cerrar menú administrativo')
    expect(markup).toContain('aria-expanded="true"')
  })

  it('notifica al layout cuando se activa', () => {
    const onToggleMenu = vi.fn()
    const button = document.createElement('button')
    button.type = 'button'
    button.onclick = onToggleMenu

    button.click()

    expect(onToggleMenu).toHaveBeenCalledTimes(1)
  })
})
