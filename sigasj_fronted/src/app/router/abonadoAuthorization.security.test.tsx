import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  ABONADO_PERSONAL_NAV_ITEMS,
  ABONADO_PERSONAL_ROUTE_PATHS,
  getAbonadoPersonalNavItems,
} from '../../modules/auth/utils/abonadoAccess'
import { ABONADO_ROLE } from '../../modules/auth/utils/internalRoles'
import {
  getAuthUser,
  isAuthenticated,
} from '../../modules/auth/utils/authStorage'
import { clearAccessToken } from '../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../test/authTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'
import { EXPECTED_NAV_PATHS } from '../../test/roleAccessFixtures'
import { ADMIN_HOME_PATH, ADMIN_PROFILE_PATH } from './privateRoutes'
import {
  LANDING_ROUTE_PATH,
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from './publicRoutes'

const ADMINISTRATIVE_ABONADOS_PATHS = [
  '/admin/abonados',
  '/admin/abonados/11',
  '/admin/abonados/nuevo',
] as const

const sidebarHrefs = (html: string) =>
  [
    ...html.matchAll(
      /<a[^>]*class="[^"]*admin-sidebar__link[^"]*"[^>]*href="(\/admin\/[^"]+)"/g,
    ),
  ].map((match) => match[1])

const hasAdminChrome = (html: string) =>
  html.includes('admin-layout') ||
  html.includes('admin-sidebar') ||
  html.includes('admin-header') ||
  html.includes('Gestión de abonados')

describe('seguridad — sesión Abonado', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
  })

  it('inicia sesión como Abonado y permanece en su área permitida (landing)', async () => {
    loginAsRole(ABONADO_ROLE)
    const app = await mountAppRoutes(LANDING_ROUTE_PATH)

    try {
      expect(isAuthenticated()).toBe(true)
      expect(getAuthUser()?.role).toBe('Abonado')
      expect(app.currentPath()).toBe(LANDING_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
    } finally {
      await app.cleanup()
    }
  })

  it('el login administrativo no ofrece el rol Abonado', async () => {
    const app = await mountAppRoutes(LOGIN_ROUTE_PATH)

    try {
      const options = [
        ...app.container.querySelectorAll<HTMLOptionElement>('.auth-page__select option'),
      ].map((option) => option.value)

      expect(options).toEqual(['Administradora', 'Secretaria', 'Fontanero'])
      expect(options).not.toContain('Abonado')
    } finally {
      await app.cleanup()
    }
  })

  it('no muestra opciones administrativas en menú ni chrome del panel', async () => {
    loginAsRole(ABONADO_ROLE)
    const app = await mountAppRoutes(LANDING_ROUTE_PATH)

    try {
      expect(sidebarHrefs(app.container.innerHTML)).toEqual([])
      expect(getAbonadoPersonalNavItems(getAuthUser())).toEqual([])
      expect(app.container.innerHTML).not.toContain('Gestión de abonados')
      expect(app.container.innerHTML).not.toContain('Gestión de usuarios')
      expect(app.container.innerHTML).not.toContain('admin-sidebar')
      expect(app.container.innerHTML).not.toContain('admin-header')

      for (const path of EXPECTED_NAV_PATHS.Administradora) {
        expect(app.container.innerHTML).not.toContain(`href="${path}"`)
      }
    } finally {
      await app.cleanup()
    }
  })

  it('no existen rutas personales de consulta, perfil de padrón ni solicitud de cambios', () => {
    expect(ABONADO_PERSONAL_NAV_ITEMS).toEqual([])
    expect(ABONADO_PERSONAL_ROUTE_PATHS).toEqual([])
    expect(ABONADO_PERSONAL_ROUTE_PATHS).not.toContain(ADMIN_PROFILE_PATH)
    expect(
      ABONADO_PERSONAL_ROUTE_PATHS.some((path) =>
        /perfil|mis-datos|cambio/i.test(path),
      ),
    ).toBe(false)
  })

  it.each([...ABONADO_PERSONAL_ROUTE_PATHS])(
    'accede a la ruta personal existente %s',
    async (path) => {
      loginAsRole(ABONADO_ROLE)
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(path)
        expect(app.container.innerHTML).not.toContain('Acceso denegado')
        expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
      } finally {
        await app.cleanup()
      }
    },
  )

  it('/admin/perfil no es perfil de Abonado y queda denegado', async () => {
    loginAsRole(ABONADO_ROLE)
    const app = await mountAppRoutes(ADMIN_PROFILE_PATH)

    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
      expect(app.container.innerHTML).not.toContain('Mi perfil')
      expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
    } finally {
      await app.cleanup()
    }
  })

  it.each([
    ADMIN_HOME_PATH,
    ...EXPECTED_NAV_PATHS.Administradora,
    ...ADMINISTRATIVE_ABONADOS_PATHS,
  ])('no entra a la función administrativa %s', async (path) => {
    loginAsRole(ABONADO_ROLE)
    const app = await mountAppRoutes(path)

    try {
      expect(isAuthenticated()).toBe(true)
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
      expect(app.container.innerHTML).not.toContain('Gestión de abonados')
      expect(hasAdminChrome(app.container.innerHTML)).toBe(false)
    } finally {
      await app.cleanup()
    }
  })
})
