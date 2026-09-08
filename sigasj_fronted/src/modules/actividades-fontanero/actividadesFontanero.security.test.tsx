import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAccessToken,
  isAuthenticated,
  setAccessToken,
  setAuthSession,
} from '../auth/utils/authStorage'
import { getAdminNavItemsForUser } from '../auth/utils/adminNavigation'
import { fetchWithAuth } from '../../services/http/httpClient'
import { loginAsRole } from '../../test/authTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../app/router/publicRoutes'
import { ACTIVIDADES_FONTANERO_PATHS } from './actividadesFontaneroPaths'
import { ACTIVIDADES_ADMIN_PATHS } from './admin/actividadesAdminPaths'
import * as actividadesApi from './services/actividadesFontaneroApi'

const FONTANERO_PRIVATE_PATHS = [
  ACTIVIDADES_FONTANERO_PATHS.home,
  ACTIVIDADES_FONTANERO_PATHS.nueva,
  ACTIVIDADES_FONTANERO_PATHS.misActividades,
  ACTIVIDADES_FONTANERO_PATHS.historial,
  ACTIVIDADES_FONTANERO_PATHS.correcciones,
] as const

const MANUAL_URLS = [
  '/admin/actividades',
  '/admin/actividades/nueva',
  '/admin/actividades/historial',
  '/admin/actividades/correcciones',
  '/fontanero/actividades',
  '/fontanero/actividades/nueva',
] as const

const BACKEND_FONTANERO_ENDPOINTS = [
  '/fontanero/actividades',
  '/fontanero/actividades/historial',
  '/fontanero/actividades/correcciones',
] as const

const sidebarHrefs = (html: string) =>
  [
    ...html.matchAll(
      /<a[^>]*class="[^"]*admin-sidebar__link[^"]*"[^>]*href="(\/admin\/[^"]+)"/g,
    ),
  ].map((match) => match[1])

/**
 * Aceptación de seguridad Frontend + contrato con Backend para el módulo Fontanero.
 * La seguridad real del API se valida también en Backend; aquí se comprueba que
 * el cliente no evada guards y que propague 401/403 de llamadas directas.
 */
describe('Seguridad — acceso privado al módulo de actividades (Fontanero)', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.spyOn(actividadesApi, 'getCorreccionesPendientes').mockResolvedValue({
      data: [],
      total: 0,
    })
    vi.spyOn(actividadesApi, 'getTiposActividadFontanero').mockResolvedValue({
      data: [],
      total: 0,
    })
    vi.spyOn(actividadesApi, 'getReportesAdmin').mockResolvedValue({
      total: 0,
      porEstado: {},
      porTipo: [],
      porFontanero: [],
      actividades: [],
    })
  })

  afterEach(() => {
    clearAccessToken()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('Fontanero autenticado', () => {
    it('ingresa a la pantalla principal del módulo', async () => {
      loginAsRole('Fontanero')
      const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.home)

      try {
        expect(app.currentPath()).toBe(ACTIVIDADES_FONTANERO_PATHS.home)
        expect(app.container.innerHTML).toContain('Registro de Actividades')
        expect(app.container.innerHTML).toContain('admin-layout')
      } finally {
        await app.cleanup()
      }
    })

    it.each([...FONTANERO_PRIVATE_PATHS])(
      'accede por URL directa a %s',
      async (path) => {
        loginAsRole('Fontanero')
        const app = await mountAppRoutes(path)

        try {
          expect(app.currentPath()).toBe(path)
          expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
          expect(app.currentPath()).not.toBe(UNAUTHORIZED_ROUTE_PATH)
        } finally {
          await app.cleanup()
        }
      },
    )

    it('el menú muestra Registro de Actividades', async () => {
      loginAsRole('Fontanero')
      const app = await mountAppRoutes('/admin/dashboard')

      try {
        const hrefs = sidebarHrefs(app.container.innerHTML)
        expect(hrefs).toContain(ACTIVIDADES_FONTANERO_PATHS.home)
        expect(hrefs).not.toContain(ACTIVIDADES_ADMIN_PATHS.home)
      } finally {
        await app.cleanup()
      }
    })
  })

  describe('sin sesión / token inválido / token vencido', () => {
    it.each([...MANUAL_URLS])(
      'sin sesión: %s redirige a login',
      async (path) => {
        const app = await mountAppRoutes(path)

        try {
          expect(isAuthenticated()).toBe(false)
          expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
          expect(app.container.innerHTML).not.toContain(
            'Registrar actividad realizada',
          )
        } finally {
          await app.cleanup()
        }
      },
    )

    it('token inválido: el Backend responde 401 al consumir endpoint Fontanero', async () => {
      setAccessToken('token-invalido')
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          text: async () => JSON.stringify({ statusCode: 401, message: 'No autenticado' }),
        }),
      )

      await expect(fetchWithAuth('/fontanero/actividades')).rejects.toThrow(
        /HTTP 401/,
      )
    })

    it('token vencido: el Backend responde 401 al consumir endpoint Fontanero', async () => {
      const expiredJwt =
        'eyJhbGciOiJub25lIn0.eyJzdWIiOiJkZW1vIiwiZXhwIjoxfQ.invalid'
      setAccessToken(expiredJwt)

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          text: async () => JSON.stringify({ statusCode: 401, message: 'No autenticado' }),
        }),
      )

      await expect(
        fetchWithAuth('/fontanero/actividades/historial'),
      ).rejects.toThrow(/HTTP 401/)
    })
  })

  describe('roles no autorizados (Administradora / Secretaria / Abonado)', () => {
    const blockedRoles = ['Administradora', 'Secretaria', 'Abonado'] as const

    it.each(blockedRoles)(
      '%s no accede a la pantalla operativa por URL manual',
      async (role) => {
        loginAsRole(role)
        const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.home)

        try {
          expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
          expect(app.container.innerHTML).toContain('Acceso denegado')
          expect(app.container.innerHTML).not.toContain(
            'Registrar actividad realizada',
          )
        } finally {
          await app.cleanup()
        }
      },
    )

    it.each(blockedRoles)(
      '%s: rutas privadas Fontanero no aparecen en el menú',
      async (role) => {
        const items = getAdminNavItemsForUser({ id: '1', role })
        expect(items.map((item) => item.path)).not.toContain(
          ACTIVIDADES_FONTANERO_PATHS.home,
        )

        loginAsRole(role)
        const app = await mountAppRoutes('/admin/dashboard')
        try {
          if (role === 'Abonado') {
            expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
          } else {
            expect(sidebarHrefs(app.container.innerHTML)).not.toContain(
              ACTIVIDADES_FONTANERO_PATHS.home,
            )
          }
        } finally {
          await app.cleanup()
        }
      },
    )

    it.each(blockedRoles)(
      '%s: llamada directa al Backend recibe 403',
      async (role) => {
        setAuthSession({
          accessToken: `token-${role}`,
          user: { id: '9', role },
        })

        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue({
            ok: false,
            status: 403,
            statusText: 'Forbidden',
            text: async () =>
              JSON.stringify({ statusCode: 403, message: 'Acceso denegado' }),
          }),
        )

        for (const path of BACKEND_FONTANERO_ENDPOINTS) {
          await expect(fetchWithAuth(path)).rejects.toThrow(/HTTP 403/)
        }
        expect(isAuthenticated()).toBe(true)
      },
    )
  })

  describe('evasión de Frontend no basta', () => {
    it('modificar URL restringida no muestra contenido Fontanero a Secretaria', async () => {
      loginAsRole('Secretaria')
      const app = await mountAppRoutes('/admin/actividades/correcciones')

      try {
        expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
        expect(app.container.innerHTML).toContain('Acceso denegado')
        expect(app.container.innerHTML).not.toContain('Correcciones pendientes')
      } finally {
        await app.cleanup()
      }
    })

    it('ocultar botones no es la seguridad: Backend sigue bloqueando con 403', async () => {
      loginAsRole('Abonado')
      // Simula que el atacante conoce la URL del API aunque el menú no la muestre
      expect(
        getAdminNavItemsForUser({ id: '4', role: 'Abonado' }),
      ).toEqual([])

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          text: async () =>
            JSON.stringify({ statusCode: 403, message: 'Acceso denegado' }),
        }),
      )

      await expect(
        fetchWithAuth('/fontanero/actividades', {
          method: 'POST',
          body: JSON.stringify({ titulo: 'Evasión' }),
        }),
      ).rejects.toThrow(/HTTP 403/)
    })

    it('401 y 403 se distinguen correctamente al consumir el API', async () => {
      loginAsRole('Fontanero')

      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          text: async () => '',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          text: async () => '',
        })
      vi.stubGlobal('fetch', fetchMock)

      await expect(fetchWithAuth('/fontanero/actividades')).rejects.toThrow(
        /HTTP 401/,
      )
      await expect(fetchWithAuth('/fontanero/actividades')).rejects.toThrow(
        /HTTP 403/,
      )
    })
  })
})
