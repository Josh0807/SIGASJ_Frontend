import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from '../../modules/auth/components/AuthContext'
import { clearAccessToken } from '../../modules/auth/utils/authStorage'
import { loginWithAdminSession } from '../../test/authTestHelpers'
import AppRoutes from './AppRoutes'
import {
  ADMIN_BASE_PATH,
  ADMIN_HOME_PATH,
  ADMIN_NAV_ITEMS,
  PRIVATE_ROUTE_PATHS,
} from './privateRoutes'
import {
  LOGIN_ROUTE_PATH,
  PUBLIC_ROUTE_PATHS,
  PUBLIC_VISITOR_FORM_ROUTES,
} from './publicRoutes'

type RouteLocation = {
  pathname: string
  state: unknown
}

const LocationProbe = ({
  onLocation,
}: {
  onLocation: (location: RouteLocation) => void
}) => {
  const location = useLocation()

  useEffect(() => {
    onLocation({ pathname: location.pathname, state: location.state })
  }, [location, onLocation])

  return null
}

const mountApp = async (path: string) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  let current: RouteLocation = { pathname: path, state: null }

  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <LocationProbe
          onLocation={(next) => {
            current = next
          }}
        />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )
  })

  return {
    container,
    location: () => current,
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

const renderPath = (path: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
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

    loginWithAdminSession()
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

    loginWithAdminSession()
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

  it('muestra AdminLayout con sesión válida y redirige a /login sin ella', async () => {
    for (const path of PRIVATE_ROUTE_PATHS) {
      const markup = renderPath(path)
      expect(markup).not.toContain('admin-layout')
      expect(markup).not.toContain('admin-sidebar')
      expect(markup).not.toContain('admin-header')
      expect(markup).not.toContain('admin-main__content')
    }

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    try {
      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={['/admin/dashboard']}>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </MemoryRouter>,
        )
      })

      expect(container.innerHTML).toContain('auth-page')
      expect(container.innerHTML).not.toContain('admin-layout')
      expect(container.innerHTML).not.toContain('admin-sidebar')
      expect(container.innerHTML).not.toContain('admin-header')
    } finally {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    }

    loginWithAdminSession()

    const dashboard = renderPath('/admin/dashboard')
    expect(dashboard).toContain('admin-layout')
    expect(dashboard).toContain('admin-sidebar')
    expect(dashboard).toContain('admin-header')
    expect(dashboard).toContain('admin-main__content')
    expect(dashboard).toContain('Dashboard administrativo')
  })

  it('reutiliza AdminLayout en todas las rutas privadas existentes', () => {
    loginWithAdminSession()

    for (const path of PRIVATE_ROUTE_PATHS) {
      const markup = renderPath(path)
      expect(markup).toContain('admin-layout')
      expect(markup).toContain('admin-sidebar')
      expect(markup).toContain('admin-header')
      expect(markup).toContain('admin-main__content')
    }
  })

  it('reserva AdminLayout exclusivamente para las rutas administrativas', () => {
    loginWithAdminSession()

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
    loginWithAdminSession()

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
    loginWithAdminSession()

    const markup = renderPath('/admin/dashboard')

    for (const { path } of ADMIN_NAV_ITEMS) {
      expect(markup).toContain(`href="${path}"`)
    }

    expect(markup).toContain('admin-sidebar__link')
    expect(markup).not.toContain('href="/admin/comunicados"')
  })

  it('muestra el dashboard existente al entrar a /admin', async () => {
    loginWithAdminSession()

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    try {
      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={[ADMIN_BASE_PATH]}>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
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
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
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

  it('redirige a /login al escribir una URL administrativa sin sesión', async () => {
    const adminUrls = [
      ADMIN_BASE_PATH,
      ADMIN_HOME_PATH,
      '/admin/galeria',
      '/admin/abonados',
    ]

    for (const path of adminUrls) {
      const app = await mountApp(path)

      try {
        expect(app.location().pathname).toBe(LOGIN_ROUTE_PATH)
        expect(app.location().state).toEqual({ from: path })
        expect(app.container.innerHTML).toContain('auth-page')
        expect(app.container.innerHTML).not.toContain('admin-layout')
        expect(app.container.innerHTML).not.toContain('admin-sidebar')
        expect(app.container.innerHTML).not.toContain('admin-header')
      } finally {
        await app.cleanup()
      }
    }
  })

  it('mantiene /login pública y no entra en un bucle de redirección', async () => {
    const app = await mountApp(LOGIN_ROUTE_PATH)

    try {
      expect(app.location().pathname).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('auth-page')
      expect(app.container.innerHTML).not.toContain('admin-layout')
    } finally {
      await app.cleanup()
    }
  })

  it('deja las rutas públicas accesibles sin sesión', async () => {
    for (const path of PUBLIC_ROUTE_PATHS) {
      const app = await mountApp(path)

      try {
        expect(app.location().pathname).toBe(path)
        expect(app.container.innerHTML).not.toContain('admin-layout')
        expect(app.container.innerHTML).not.toContain('admin-sidebar')
        expect(app.container.innerHTML).not.toContain('admin-header')
        expect(app.container.innerHTML).not.toContain('Panel administrativo')
      } finally {
        await app.cleanup()
      }
    }
  })

  it('carga la Landing en / sin autenticación ni redirección a login', async () => {
    const app = await mountApp('/')

    try {
      expect(app.location().pathname).toBe('/')
      expect(app.container.innerHTML).toContain('hero')
      expect(app.container.innerHTML).toContain('header__inner')
      expect(app.container.innerHTML).toContain('navbar')
      expect(app.container.innerHTML).toContain('id="comunicados"')
      expect(app.container.innerHTML).toContain('footer')
      expect(app.container.innerHTML).not.toContain('auth-page')
      expect(app.container.innerHTML).not.toContain('admin-layout')
      expect(app.container.innerHTML).not.toContain('admin-sidebar')
      expect(app.container.innerHTML).not.toContain('admin-header')
    } finally {
      await app.cleanup()
    }
  })
})
