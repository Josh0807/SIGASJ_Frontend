import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import AuthorizedRoute from './AuthorizedRoute'
import AdminSidebar from '../../admin-panel/components/AdminSidebar'
import { ADMIN_NAV_ITEMS } from '../../../app/router/privateRoutes'
import {
  clearAccessToken,
  setAccessToken,
  setAuthUser,
} from '../utils/authStorage'
import { ABONADOS_ALLOWED_ROLES } from '../config/adminNavigation.config'

const renderAbonadosGuard = async (path = '/admin/abonados') => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route
              path="/admin/abonados/*"
              element={
                <AuthorizedRoute
                  requiredPath="/admin/abonados"
                  allowedRoles={ABONADOS_ALLOWED_ROLES}
                >
                  <Outlet />
                </AuthorizedRoute>
              }
            >
              <Route index element={<p>Gestión de asociados</p>} />
              <Route path="*" element={<p>Gestión de asociados</p>} />
            </Route>
            <Route path="/login" element={<p>Iniciar sesión</p>} />
            <Route path="/unauthorized" element={<p>Acceso denegado</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )
  })

  return { container }
}

describe('AuthorizedRoute — Gestión de asociados', () => {
  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('sin sesión redirige al login y no muestra el módulo', async () => {
    const { container } = await renderAbonadosGuard()

    expect(container.textContent).toContain('Iniciar sesión')
    expect(container.textContent).not.toContain('Gestión de asociados')
  })

  it('sin sesión también redirige al login desde un sufijo administrativo', async () => {
    const { container } = await renderAbonadosGuard('/admin/abonados/11')

    expect(container.textContent).toContain('Iniciar sesión')
    expect(container.textContent).not.toContain('Gestión de asociados')
    expect(container.textContent).not.toContain('Acceso denegado')
  })

  it('con sesión y rol permitido muestra la ruta', async () => {
    setAccessToken('token-demo')
    setAuthUser({ id: '1', role: 'Administradora' })
    const { container } = await renderAbonadosGuard()

    expect(container.textContent).toContain('Gestión de asociados')
    expect(container.textContent).not.toContain('Iniciar sesión')
    expect(container.textContent).not.toContain('Acceso denegado')
  })

  it('con sesión y rol no permitido muestra acceso denegado', async () => {
    setAccessToken('token-demo')
    setAuthUser({ id: '4', role: 'Abonado' })
    const { container } = await renderAbonadosGuard()

    expect(container.textContent).toContain('Acceso denegado')
    expect(container.textContent).not.toContain('Gestión de asociados')
    expect(container.textContent).not.toContain('Iniciar sesión')
  })

  it('Administradora entra por URL directa a un sufijo administrativo', async () => {
    setAccessToken('token-demo')
    setAuthUser({ id: '1', role: 'Administradora' })
    const { container } = await renderAbonadosGuard('/admin/abonados/11')

    expect(container.textContent).toContain('Gestión de asociados')
    expect(container.textContent).not.toContain('Acceso denegado')
    expect(container.textContent).not.toContain('Iniciar sesión')
  })

  it('Abonado autenticado no evade el guard con /admin/abonados/11', async () => {
    setAccessToken('token-demo')
    setAuthUser({ id: '4', role: 'Abonado' })
    const { container } = await renderAbonadosGuard('/admin/abonados/11')

    expect(container.textContent).toContain('Acceso denegado')
    expect(container.textContent).not.toContain('Gestión de asociados')
    expect(container.textContent).not.toContain('Iniciar sesión')
  })

  it('Fontanero autenticado no entra a Gestión de asociados', async () => {
    setAccessToken('token-demo')
    setAuthUser({ id: '3', role: 'Fontanero' })
    const { container } = await renderAbonadosGuard()

    expect(container.textContent).toContain('Acceso denegado')
    expect(container.textContent).not.toContain('Gestión de asociados')
  })

  it('mostrar Gestión de asociados en el menú no autoriza al Abonado por URL', async () => {
    setAccessToken('token-demo')
    setAuthUser({ id: '4', role: 'Abonado' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/admin/abonados']}>
            <AdminSidebar items={ADMIN_NAV_ITEMS} />
            <Routes>
              <Route
                path="/admin/abonados"
                element={
                  <AuthorizedRoute
                    requiredPath="/admin/abonados"
                    allowedRoles={ABONADOS_ALLOWED_ROLES}
                  >
                    <p>Contenido protegido de Gestión de asociados</p>
                  </AuthorizedRoute>
                }
              />
              <Route path="/unauthorized" element={<p>Acceso denegado</p>} />
              <Route path="/login" element={<p>Iniciar sesión</p>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>,
      )
    })

    expect(container.innerHTML).toContain('href="/admin/abonados"')
    expect(container.textContent).toContain('Acceso denegado')
    expect(container.textContent).not.toContain(
      'Contenido protegido de Gestión de asociados',
    )
    expect(container.textContent).not.toContain('Iniciar sesión')
  })

  it('ocultar la opción en el menú no sustituye el guard: Fontanero sigue denegado por URL', async () => {
    setAccessToken('token-demo')
    setAuthUser({ id: '3', role: 'Fontanero' })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/admin/abonados']}>
            <AdminSidebar
              items={ADMIN_NAV_ITEMS.filter((item) => item.path !== '/admin/abonados')}
            />
            <Routes>
              <Route
                path="/admin/abonados"
                element={
                  <AuthorizedRoute
                    requiredPath="/admin/abonados"
                    allowedRoles={ABONADOS_ALLOWED_ROLES}
                  >
                    <p>Contenido protegido de Gestión de asociados</p>
                  </AuthorizedRoute>
                }
              />
              <Route path="/unauthorized" element={<p>Acceso denegado</p>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>,
      )
    })

    expect(container.innerHTML).not.toContain('href="/admin/abonados"')
    expect(container.textContent).toContain('Acceso denegado')
    expect(container.textContent).not.toContain(
      'Contenido protegido de Gestión de asociados',
    )
  })
})
