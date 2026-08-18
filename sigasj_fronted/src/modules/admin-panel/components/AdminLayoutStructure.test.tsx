import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from '../../../shared/layouts/AdminLayout'

describe('AdminLayout Structure & Styling Integration', () => {
  const renderLayout = (path = '/admin/dashboard') =>
    renderToStaticMarkup(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<h1>Inicio Dashboard</h1>} />
            <Route path="/admin/usuarios" element={<h1>Gestión de Usuarios</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

  it('1. Renderiza el contenedor principal admin-layout con fondo y flexbox', () => {
    const markup = renderLayout()

    expect(markup).toContain('admin-layout')
    expect(markup).toContain('admin-sidebar')
    expect(markup).toContain('admin-main')
    expect(markup).toContain('admin-header')
  })

  it('2. Configura el área de contenido principal con la estructura admin-main__content y admin-main__inner', () => {
    const markup = renderLayout('/admin/usuarios')

    expect(markup).toContain('admin-main__content')
    expect(markup).toContain('admin-main__inner')
    expect(markup).toContain('Gestión de Usuarios')
  })

  it('3. Mantiene la marca de la ASADA, logo y navegación dentro del sidebar', () => {
    const markup = renderLayout()

    expect(markup).toContain('SIGASJ')
    expect(markup).toContain('ASADA San Juan')
    expect(markup).toContain('admin-sidebar__nav')
    expect(markup).toContain('admin-sidebar__link')
  })

  it('4. Incluye el botón de alternancia del menú responsive (hamburguesa) en el encabezado', () => {
    const markup = renderLayout()

    expect(markup).toContain('admin-menu-toggle')
    expect(markup).toContain('aria-label="Abrir menú administrativo"')
  })

  it('5. Audita que el renderizado de la estructura visual no genere advertencias ni errores', () => {
    const errors: unknown[] = []
    const warnings: unknown[] = []
    const originalError = console.error
    const originalWarn = console.warn
    console.error = (...args: unknown[]) => {
      errors.push(args)
    }
    console.warn = (...args: unknown[]) => {
      warnings.push(args)
    }

    try {
      const markup = renderLayout()
      expect(markup).toContain('Inicio Dashboard')
      expect(errors).toEqual([])
      expect(warnings).toEqual([])
    } finally {
      console.error = originalError
      console.warn = originalWarn
    }
  })
})
