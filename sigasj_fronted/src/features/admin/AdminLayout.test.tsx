import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from './AdminLayout'

const renderAdminRoute = (path: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/admin/a" element={<p>Pantalla A</p>} />
          <Route path="/admin/b" element={<p>Pantalla B</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )

describe('AdminLayout', () => {
  it('organiza sidebar, encabezado y área de contenido de la ruta', () => {
    const markup = renderAdminRoute('/admin/a')

    expect(markup).toContain('admin-layout')
    expect(markup).toContain('admin-sidebar')
    expect(markup).toContain('admin-main')
    expect(markup).toContain('admin-header')
    expect(markup).toContain('admin-header__actions')
    expect(markup).toContain('admin-main__content')
    expect(markup).toContain('Pantalla A')
  })

  it('reutiliza el mismo layout y deja que el router elija la pantalla', () => {
    const first = renderAdminRoute('/admin/a')
    const second = renderAdminRoute('/admin/b')

    expect(first).toContain('admin-layout')
    expect(first).toContain('Pantalla A')
    expect(first).not.toContain('Pantalla B')

    expect(second).toContain('admin-layout')
    expect(second).toContain('Pantalla B')
    expect(second).not.toContain('Pantalla A')
  })

  it('renderiza las rutas hijas solo en el area de contenido', () => {
    const markup = renderAdminRoute('/admin/a')
    const contentStart = markup.indexOf('admin-main__content')
    const beforeContent = markup.slice(0, contentStart)
    const content = markup.slice(contentStart)

    expect(beforeContent).toContain('admin-sidebar')
    expect(beforeContent).toContain('admin-header')
    expect(beforeContent).not.toContain('Pantalla A')
    expect(content).toContain('Pantalla A')
  })

  it('mantiene los enlaces del sidebar al cambiar la ruta hija', () => {
    const first = renderAdminRoute('/admin/a')
    const second = renderAdminRoute('/admin/b')

    expect(first).toContain('admin-sidebar__link')
    expect(second).toContain('admin-sidebar__link')
    expect(first).toContain('href="/admin/dashboard"')
    expect(second).toContain('href="/admin/dashboard"')
    expect(first).toContain('Pantalla A')
    expect(second).toContain('Pantalla B')
  })

  it('mantiene el orden estructural sidebar, encabezado y contenido', () => {
    const markup = renderAdminRoute('/admin/a')
    const sidebar = markup.indexOf('admin-sidebar')
    const header = markup.indexOf('admin-header')
    const content = markup.indexOf('admin-main__content')

    expect(sidebar).toBeGreaterThan(-1)
    expect(sidebar).toBeLessThan(header)
    expect(header).toBeLessThan(content)
  })

  it('no emite errores de consola al renderizar el layout', () => {
    const errors: unknown[] = []
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args)
    }

    try {
      renderAdminRoute('/admin/a')
      renderAdminRoute('/admin/b')
    } finally {
      console.error = originalError
    }

    expect(errors).toEqual([])
  })
})
