import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { clearAccessToken, setAccessToken } from '../features/auth/authStorage'
import AppRoutes from './AppRoutes'
import { ADMIN_BASE_PATH, PRIVATE_ROUTE_PATHS } from './privateRoutes'
import { PUBLIC_ROUTE_PATHS } from './publicRoutes'

const renderPath = (path: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )

describe('AppRoutes y AdminLayout', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('mantiene las rutas públicas fuera de AdminLayout', () => {
    for (const path of PUBLIC_ROUTE_PATHS) {
      expect(renderPath(path)).not.toContain('admin-layout')
    }

    expect(renderPath('/')).toContain('hero')
    expect(renderPath('/')).toContain('header__inner')
    expect(renderPath('/')).not.toContain('admin-header')
    expect(renderPath('/')).not.toContain('admin-sidebar')
    expect(renderPath('/login')).toContain('auth-page')
    expect(renderPath('/login')).not.toContain('admin-layout')
    expect(renderPath('/login')).not.toContain('admin-sidebar')
  })

  it('no muestra el panel administrativo sin el guard actual', () => {
    expect(renderPath('/admin/dashboard')).not.toContain('admin-layout')
    expect(renderPath('/admin/abonados')).not.toContain('admin-layout')
  })

  it('reutiliza AdminLayout en todas las rutas privadas existentes', () => {
    setAccessToken('token-de-prueba')

    for (const path of PRIVATE_ROUTE_PATHS) {
      const markup = renderPath(path)
      expect(markup).toContain('admin-layout')
      expect(markup).toContain('admin-sidebar')
      expect(markup).toContain('admin-header')
      expect(markup).toContain('admin-main__content')
    }
  })

  it('anida los módulos existentes bajo un solo AdminLayout en /admin', () => {
    setAccessToken('token-de-prueba')

    const dashboard = renderPath('/admin/dashboard')
    const abonados = renderPath('/admin/abonados')
    const averias = renderPath('/admin/averias')

    expect(dashboard).toContain('admin-layout')
    expect(dashboard).toContain('Dashboard administrativo')
    expect(abonados).toContain('admin-layout')
    expect(abonados).toContain('Gestión de abonados')
    expect(averias).toContain('admin-layout')
    expect(averias).toContain('Gestión de averías')
    expect(renderPath('/')).not.toContain('admin-layout')
    expect(renderPath('/login')).not.toContain('admin-layout')
  })

  it('enlaza las rutas administrativas reales desde AdminSidebar', () => {
    setAccessToken('token-de-prueba')

    const markup = renderPath('/admin/dashboard')

    for (const path of PRIVATE_ROUTE_PATHS) {
      expect(markup).toContain(`href="${path}"`)
    }

    expect(markup).toContain('admin-sidebar__link')
    expect(markup).not.toContain('href="/admin/comunicados"')
  })

  it('muestra el dashboard existente al entrar a /admin', async () => {
    setAccessToken('token-de-prueba')

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    try {
      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={[ADMIN_BASE_PATH]}>
            <AppRoutes />
          </MemoryRouter>,
        )
      })

      expect(container.innerHTML).toContain('admin-layout')
      expect(container.innerHTML).toContain('Dashboard administrativo')
    } finally {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    }
  })

  it('no entra al panel desde /admin sin autenticación', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    try {
      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={[ADMIN_BASE_PATH]}>
            <AppRoutes />
          </MemoryRouter>,
        )
      })

      expect(container.innerHTML).not.toContain('admin-layout')
      expect(container.innerHTML).not.toContain('Dashboard administrativo')
      expect(container.innerHTML).toContain('auth-page')
    } finally {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    }
  })
})
