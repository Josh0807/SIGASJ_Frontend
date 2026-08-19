import { beforeEach, describe, expect, it } from 'vitest'
import { clearAccessToken } from '../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../test/authTestHelpers'
import { ABONADO_PERSONAL_ROUTE_PATHS } from '../../modules/auth/utils/abonadoAccess'
import { ABONADO_ROLE } from '../../modules/auth/utils/internalRoles'
import { evaluateDirectRouteAccess } from '../../modules/auth/utils/adminAccess'
import { mountAppRoutes } from '../../test/render-app-routes'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from './publicRoutes'

const ADMINISTRATIVE_PATHS = [
  '/admin/abonados',
  '/admin/abonados/11',
  '/admin/abonados/nuevo',
] as const

const SAMPLE_PERSONAL_PATH = '/mis-datos'

const hasAdminContent = (html: string) =>
  html.includes('admin-layout') ||
  html.includes('admin-sidebar') ||
  html.includes('Gestión de abonados')

describe('acceso directo por URL a Gestión de Abonados', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('Administradora entra por URL a una ruta administrativa existente', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes('/admin/abonados')

    try {
      expect(app.currentPath()).toBe('/admin/abonados')
      expect(app.container.innerHTML).toContain('Gestión de abonados')
      expect(app.container.innerHTML).toContain('admin-layout')
      expect(app.currentPath()).not.toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
    } finally {
      await app.cleanup()
    }
  })

  it('Administradora también entra a un sufijo administrativo existente', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes('/admin/abonados/11')

    try {
      expect(app.currentPath()).toBe('/admin/abonados/11')
      expect(app.container.innerHTML).toContain('Gestión de abonados')
      expect(app.container.innerHTML).not.toContain('Acceso denegado')
    } finally {
      await app.cleanup()
    }
  })

  it.each(ADMINISTRATIVE_PATHS)(
    'Abonado autenticado recibe Acceso denegado en %s y no va al login',
    async (path) => {
      loginAsRole('Abonado')
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
        expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
        expect(app.container.innerHTML).toContain('Acceso denegado')
        expect(app.container.innerHTML).toContain(
          'No tiene permisos para acceder a esta sección.',
        )
        expect(app.container.innerHTML).not.toContain('Iniciar sesión')
        expect(hasAdminContent(app.container.innerHTML)).toBe(false)
      } finally {
        await app.cleanup()
      }
    },
  )

  it.each(ADMINISTRATIVE_PATHS)(
    'sin sesión redirige al login desde %s',
    async (path) => {
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        expect(app.container.innerHTML).toContain('Iniciar sesión')
        expect(app.container.innerHTML).not.toContain('Acceso denegado')
        expect(hasAdminContent(app.container.innerHTML)).toBe(false)
      } finally {
        await app.cleanup()
      }
    },
  )

  it('sin sesión redirige al login al intentar una ruta personal del Abonado', () => {
    expect(
      evaluateDirectRouteAccess(
        false,
        null,
        SAMPLE_PERSONAL_PATH,
        undefined,
        [SAMPLE_PERSONAL_PATH],
      ),
    ).toEqual({
      to: LOGIN_ROUTE_PATH,
      state: { from: SAMPLE_PERSONAL_PATH },
    })
  })

  it.each([...ABONADO_PERSONAL_ROUTE_PATHS])(
    'sin sesión redirige al login desde la ruta personal %s',
    async (path) => {
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        expect(app.container.innerHTML).toContain('Iniciar sesión')
        expect(hasAdminContent(app.container.innerHTML)).toBe(false)
      } finally {
        await app.cleanup()
      }
    },
  )

  it('Abonado autenticado entra a una ruta personal autorizada', () => {
    expect(
      evaluateDirectRouteAccess(
        true,
        { id: '4', role: ABONADO_ROLE },
        SAMPLE_PERSONAL_PATH,
        [ABONADO_ROLE],
        [SAMPLE_PERSONAL_PATH],
      ),
    ).toBe('allow')
  })

  it.each([...ABONADO_PERSONAL_ROUTE_PATHS])(
    'Abonado autenticado entra por URL a la ruta personal %s',
    async (path) => {
      loginAsRole('Abonado')
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(path)
        expect(app.container.innerHTML).not.toContain('Acceso denegado')
        expect(app.container.innerHTML).not.toContain('Iniciar sesión')
        expect(hasAdminContent(app.container.innerHTML)).toBe(false)
      } finally {
        await app.cleanup()
      }
    },
  )
})
