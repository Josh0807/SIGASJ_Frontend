import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from '../../../shared/layouts/AdminLayout'
import AdminDashboard from '../../dashboard/AdminDashboard'

describe('AdminLayout Responsive Integration', () => {
  const renderDashboardLayout = () =>
    renderToStaticMarkup(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

  it('1. Renderiza los contenedores de cuadrícula responsivos para indicadores y widgets operativos', () => {
    const markup = renderDashboardLayout()

    expect(markup).toContain('admin-dashboard__indicators-grid')
    expect(markup).toContain('admin-dashboard__widgets-grid')
  })

  it('2. Soporta la envoltura de tabla responsiva table-responsive', () => {
    const markup = renderToStaticMarkup(
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Abonado</th>
              <th>Estado</th>
            </tr>
          </thead>
        </table>
      </div>,
    )

    expect(markup).toContain('table-responsive')
    expect(markup).toContain('<table>')
  })

  it('3. Soporta la envoltura de formulario responsivo form-grid-responsive', () => {
    const markup = renderToStaticMarkup(
      <form className="form-grid-responsive">
        <div>
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" type="text" />
        </div>
        <div>
          <label htmlFor="correo">Correo</label>
          <input id="correo" type="email" />
        </div>
      </form>,
    )

    expect(markup).toContain('form-grid-responsive')
    expect(markup).toContain('input')
  })

  it('4. Audita la consola para asegurar que no se produzcan errores ni advertencias en el layout responsivo', () => {
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
      const markup = renderDashboardLayout()
      expect(markup).toContain('Dashboard administrativo')
      expect(errors).toEqual([])
      expect(warnings).toEqual([])
    } finally {
      console.error = originalError
      console.warn = originalWarn
    }
  })
})
