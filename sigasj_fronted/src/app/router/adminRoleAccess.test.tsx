import { beforeEach, describe, expect, it } from 'vitest'
import { clearAccessToken } from '../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../test/authTestHelpers'
import {
  EXPECTED_BLOCKED_PATHS,
  EXPECTED_NAV_PATHS,
  INTERNAL_ROLES_UNDER_TEST,
  ROLE_TASK_LABELS,
  SAMPLE_ALLOWED_CONTENT,
} from '../../test/roleAccessFixtures'
import { mountAppRoutes } from '../../test/render-app-routes'
import { ADMIN_HOME_PATH } from './privateRoutes'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from './publicRoutes'

const loginAs = (role: string, id = '1') => {
  loginAsRole(role, id)
}

const sidebarLinks = (html: string) => {
  const classFirst = [
    ...html.matchAll(
      /<a[^>]*class="[^"]*admin-sidebar__link[^"]*"[^>]*href="(\/admin\/[^"]+)"/g,
    ),
  ].map((match) => match[1])

  if (classFirst.length > 0) {
    return classFirst
  }

  return [
    ...html.matchAll(
      /<a[^>]*href="(\/admin\/[^"]+)"[^>]*class="[^"]*admin-sidebar__link[^"]*"/g,
    ),
  ].map((match) => match[1])
}

describe('pruebas de navegación y acceso por rol (11.4.5)', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  describe.each(INTERNAL_ROLES_UNDER_TEST)('sesión como %s', (rol) => {
    const taskLabel = ROLE_TASK_LABELS[rol]

    it(`${taskLabel}: menú lateral muestra solo módulos permitidos`, async () => {
      loginAs(rol)
      const app = await mountAppRoutes(ADMIN_HOME_PATH)

      try {
        expect(app.currentPath()).toBe(ADMIN_HOME_PATH)
        const links = sidebarLinks(app.container.innerHTML)
        expect(links).toEqual([...EXPECTED_NAV_PATHS[rol]])
        if (rol === 'Administradora' || rol === 'Secretaria') {
          expect(links).toContain('/admin/abonados')
        } else {
          expect(links).not.toContain('/admin/abonados')
        }
      } finally {
        await app.cleanup()
      }
    })

    it.each([...EXPECTED_NAV_PATHS[rol]])(
      `${taskLabel}: acceso directo permitido a %s`,
      async (path) => {
        loginAs(rol)
        const app = await mountAppRoutes(path)

        try {
          expect(app.currentPath()).toBe(path)
          const expectedTitle = SAMPLE_ALLOWED_CONTENT[path]
          if (expectedTitle) {
            expect(app.container.innerHTML).toContain(expectedTitle)
          }
          expect(app.container.innerHTML).toContain('admin-layout')
        } finally {
          await app.cleanup()
        }
      },
    )

    it.each([...EXPECTED_BLOCKED_PATHS[rol]])(
      `${taskLabel}: acceso directo bloqueado a %s`,
      async (path) => {
        loginAs(rol)
        const app = await mountAppRoutes(path)

        try {
          expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
          expect(app.container.innerHTML).toContain('Acceso denegado')
          expect(app.container.innerHTML).not.toContain(
            SAMPLE_ALLOWED_CONTENT[path] ?? '',
          )
        } finally {
          await app.cleanup()
        }
      },
    )
  })

  it('pantalla de acceso no autorizado permite volver al panel del rol', async () => {
    loginAs('Secretaria')
    const app = await mountAppRoutes('/admin/usuarios')

    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
      expect(app.container.innerHTML).toContain(
        'No tiene permisos para acceder a esta sección.',
      )
      expect(app.container.innerHTML).toContain('Volver al panel')
      expect(app.container.innerHTML).toContain('href="/admin/dashboard"')
    } finally {
      await app.cleanup()
    }
  })

  it('Abonado autenticado no ingresa al panel administrativo', async () => {
    loginAs('Abonado')
    const app = await mountAppRoutes(ADMIN_HOME_PATH)

    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
      expect(app.container.innerHTML).not.toContain('Iniciar sesión')
      expect(app.container.innerHTML).not.toContain('admin-layout')
      expect(app.container.innerHTML).not.toContain('Dashboard administrativo')
    } finally {
      await app.cleanup()
    }
  })

  it('ocultar Gestión de Abonados del menú no sustituye el guard: Abonado denegado por URL', async () => {
    loginAs('Abonado')
    const app = await mountAppRoutes('/admin/abonados')

    try {
      expect(sidebarLinks(app.container.innerHTML)).not.toContain('/admin/abonados')
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
      expect(app.container.innerHTML).not.toContain('Gestión de abonados')
      expect(app.container.innerHTML).not.toContain('Iniciar sesión')
    } finally {
      await app.cleanup()
    }
  })

  it('Abonado autenticado recibe acceso denegado en Gestión de abonados', async () => {
    loginAs('Abonado')
    const app = await mountAppRoutes('/admin/abonados')

    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
      expect(app.container.innerHTML).not.toContain('Iniciar sesión')
      expect(app.container.innerHTML).not.toContain('Gestión de abonados')
      expect(app.container.innerHTML).not.toContain('admin-layout')
      expect(app.container.innerHTML).not.toContain('admin-sidebar')
    } finally {
      await app.cleanup()
    }
  })

  it('Abonado no consulta otro abonado pasando un ID en la URL', async () => {
    loginAs('Abonado')
    const app = await mountAppRoutes('/admin/abonados/11')

    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
      expect(app.container.innerHTML).not.toContain('Iniciar sesión')
      expect(app.container.innerHTML).not.toContain('Gestión de abonados')
      expect(app.container.innerHTML).not.toContain('admin-layout')
    } finally {
      await app.cleanup()
    }
  })

  it('Abonado autenticado recibe acceso denegado al escribir /admin/abonados/nuevo', async () => {
    loginAs('ABONADO')
    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
      expect(app.container.innerHTML).not.toContain('Iniciar sesión')
      expect(app.container.innerHTML).not.toContain('Gestión de abonados')
      expect(sidebarLinks(app.container.innerHTML)).not.toContain('/admin/abonados')
    } finally {
      await app.cleanup()
    }
  })

  it('Fontanero tampoco entra a Gestión de abonados con un ID en la URL', async () => {
    loginAs('Fontanero')
    const app = await mountAppRoutes('/admin/abonados/11')

    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
      expect(app.container.innerHTML).not.toContain('Gestión de abonados')
    } finally {
      await app.cleanup()
    }
  })

  it('sin sesión redirige al login desde URL administrativa', async () => {
    const app = await mountAppRoutes('/admin/reportes')

    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('auth-page')
    } finally {
      await app.cleanup()
    }
  })

  it('sin sesión redirige al login desde Gestión de abonados', async () => {
    const app = await mountAppRoutes('/admin/abonados')

    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Iniciar sesión')
      expect(app.container.innerHTML).not.toContain('Acceso denegado')
      expect(app.container.innerHTML).not.toContain('Gestión de abonados')
      expect(app.container.innerHTML).not.toContain('admin-layout')
    } finally {
      await app.cleanup()
    }
  })
})
