import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../auth/components/AuthContext'
import AdminLayout from '../../../shared/layouts/AdminLayout'
import AdminDashboard from '../../dashboard/AdminDashboard'
import { loginWithAdminSession } from '../../../test/authTestHelpers'

describe('AdminLayout Responsive Corrections & Modal Utilities', () => {
  const renderDashboardLayout = () => {
    loginWithAdminSession()
    return renderToStaticMarkup(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )
  }

  it('1. Renderiza los modales responsivos con las clases modal-backdrop y modal-dialog', () => {
    const markup = renderToStaticMarkup(
      <div className="modal-backdrop">
        <div className="modal-dialog" role="dialog" aria-modal="true">
          <div className="modal-dialog__header">
            <h2>Confirmar Acción</h2>
          </div>
          <div className="modal-dialog__body">
            <p>¿Está seguro de que desea guardar los cambios en la ASADA?</p>
          </div>
          <div className="modal-dialog__footer">
            <button type="button">Cancelar</button>
            <button type="button">Guardar</button>
          </div>
        </div>
      </div>,
    )

    expect(markup).toContain('modal-backdrop')
    expect(markup).toContain('modal-dialog')
    expect(markup).toContain('modal-dialog__header')
    expect(markup).toContain('modal-dialog__body')
    expect(markup).toContain('modal-dialog__footer')
  })

  it('2. El menú de usuario y los botones no desbordan la cabecera en pantallas ajustadas', () => {
    const markup = renderDashboardLayout()

    expect(markup).toContain('admin-header')
    expect(markup).toContain('admin-user-menu')
    expect(markup).toContain('admin-account-menu')
    expect(markup).toContain('admin-header__actions')
  })

  it('3. Audita la consola para asegurar que no se produzcan advertencias ni errores durante las correcciones', () => {
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
