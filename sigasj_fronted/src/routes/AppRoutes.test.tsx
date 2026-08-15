import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { clearAccessToken, setAccessToken } from '../features/auth/authStorage'
import AppRoutes from './AppRoutes'
import { ADMIN_BASE_PATH, PRIVATE_ROUTE_PATHS } from './privateRoutes'
import { PUBLIC_ROUTE_PATHS, PUBLIC_VISITOR_FORM_ROUTES } from './publicRoutes'

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
    expect(renderPath('/reportar-averia')).not.toContain('admin-layout')
    expect(renderPath('/solicitudes/afiliacion')).not.toContain('admin-layout')
    expect(renderPath('/solicitudes/afiliacion')).not.toContain('admin-sidebar')
    expect(renderPath('/solicitudes/afiliacion')).not.toContain('admin-header')
  })

  it('mantiene los formularios públicos existentes fuera de AdminLayout', () => {
    const landing = renderPath('/')
    expect(landing).toContain('href="/reportar-averia"')
    expect(landing).toContain('href="/solicitudes/afiliacion"')

    for (const { path, label } of PUBLIC_VISITOR_FORM_ROUTES) {
      const markup = renderPath(path)
      expect(markup).not.toContain('admin-layout')
      expect(markup).not.toContain('admin-sidebar')
      expect(markup).not.toContain('admin-header')
      expect(markup).not.toContain('admin-main')
      expect(markup).not.toContain('Panel administrativo')
      expect(markup).toContain(`aria-label="${label}"`)
    }

    setAccessToken('token-de-prueba')
    for (const { path } of PUBLIC_VISITOR_FORM_ROUTES) {
      expect(renderPath(path)).not.toContain('admin-layout')
    }
  })

  it('renderiza LandingPage en / sin AdminLayout', () => {
    const markup = renderPath('/')

    expect(markup).toContain('header__inner')
    expect(markup).toContain('navbar')
    expect(markup).toContain('hero')
    expect(markup).toContain('id="comunicados"')
    expect(markup).toContain('footer')
    expect(markup).not.toContain('admin-layout')
    expect(markup).not.toContain('admin-sidebar')
    expect(markup).not.toContain('admin-sidebar__link')
    expect(markup).not.toContain('admin-header')
    expect(markup).not.toContain('admin-main')
    expect(markup).not.toContain('Panel administrativo')

    setAccessToken('token-de-prueba')
    const authenticatedLanding = renderPath('/')
    expect(authenticatedLanding).toContain('hero')
    expect(authenticatedLanding).not.toContain('admin-layout')
    expect(authenticatedLanding).not.toContain('admin-sidebar')
    expect(authenticatedLanding).not.toContain('admin-header')
  })

  it('conserva el Header público y no mezcla AdminHeader ni AdminSidebar', () => {
    const landing = renderPath('/')
    expect(landing).toContain('class="header"')
    expect(landing).toContain('header__inner')
    expect(landing).toContain('navbar')
    expect(landing).not.toContain('admin-header')
    expect(landing).not.toContain('admin-sidebar')
    expect(landing).not.toContain('Panel administrativo')

    const login = renderPath('/login')
    expect(login).toContain('auth-page')
    expect(login).not.toContain('admin-header')
    expect(login).not.toContain('admin-sidebar')

    for (const { path } of PUBLIC_VISITOR_FORM_ROUTES) {
      const markup = renderPath(path)
      expect(markup).not.toContain('admin-header')
      expect(markup).not.toContain('admin-sidebar')
    }
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

  it('reserva AdminLayout exclusivamente para las rutas administrativas', () => {
    setAccessToken('token-de-prueba')

    for (const path of PUBLIC_ROUTE_PATHS) {
      const markup = renderPath(path)
      expect(markup).not.toContain('admin-layout')
      expect(markup).not.toContain('admin-sidebar')
      expect(markup).not.toContain('admin-header')
      expect(markup).not.toContain('admin-main')
    }

    for (const path of PRIVATE_ROUTE_PATHS) {
      const markup = renderPath(path)
      expect(markup).toContain('admin-layout')
      expect(markup).toContain('admin-sidebar')
      expect(markup).toContain('admin-header')
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
