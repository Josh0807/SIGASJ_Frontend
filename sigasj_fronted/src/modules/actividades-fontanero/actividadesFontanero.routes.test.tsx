import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from '../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../test/authTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../app/router/publicRoutes'
import * as actividadesApi from './services/actividadesFontaneroApi'

const FONTANERO_PATHS = [
  '/admin/actividades',
  '/admin/actividades/nueva',
  '/admin/actividades/historial',
  '/admin/actividades/correcciones',
  '/admin/actividades/mis-actividades',
] as const

const ADMIN_PATHS = [
  '/admin/actividades-fontanero',
  '/admin/actividades-fontanero/dashboard',
  '/admin/actividades-fontanero/reportes',
] as const

const BACKLOG_FONTANERO_PATHS = [
  '/fontanero/actividades',
  '/fontanero/actividades/nueva',
  '/fontanero/actividades/historial',
  '/fontanero/actividades/correcciones',
] as const

describe('protección de rutas — Registro de Actividades del Fontanero', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
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

  it.each([...FONTANERO_PATHS])(
    'sin sesión redirige a login desde %s',
    async (path) => {
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
        expect(app.container.innerHTML).not.toContain('Registro de Actividades')
      } finally {
        await app.cleanup()
      }
    },
  )

  it.each([...ADMIN_PATHS])(
    'sin sesión redirige a login desde ruta administrativa %s',
    async (path) => {
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      } finally {
        await app.cleanup()
      }
    },
  )

  it('Fontanero accede a /registrar mediante redirección a /nueva', async () => {
    loginAsRole('Fontanero')
    const app = await mountAppRoutes('/admin/actividades/registrar')

    try {
      expect(app.currentPath()).toBe('/admin/actividades/nueva')
      expect(app.container.innerHTML).toContain('admin-layout')
      expect(app.container.innerHTML).toContain('Registro de Actividades')
    } finally {
      await app.cleanup()
    }
  })

  it.each([...FONTANERO_PATHS])(
    'Fontanero puede acceder a %s',
    async (path) => {
      loginAsRole('Fontanero')
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(path)
        expect(app.container.innerHTML).toContain('admin-layout')
        expect(app.container.innerHTML).toContain('Registro de Actividades')
      } finally {
        await app.cleanup()
      }
    },
  )

  it.each([...ADMIN_PATHS])(
    'Administradora puede acceder a %s',
    async (path) => {
      loginAsRole('Administradora')
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(path)
        expect(app.container.innerHTML).toContain('admin-layout')
      } finally {
        await app.cleanup()
      }
    },
  )

  it.each([...FONTANERO_PATHS])(
    'Administradora recibe acceso denegado en operativa Fontanero %s',
    async (path) => {
      loginAsRole('Administradora')
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
        expect(app.container.innerHTML).toContain('Acceso denegado')
      } finally {
        await app.cleanup()
      }
    },
  )

  it.each([...ADMIN_PATHS])(
    'Fontanero recibe acceso denegado en administrativa %s',
    async (path) => {
      loginAsRole('Fontanero')
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
        expect(app.container.innerHTML).toContain('Acceso denegado')
      } finally {
        await app.cleanup()
      }
    },
  )

  it.each([...FONTANERO_PATHS, ...ADMIN_PATHS])(
    'Abonado no puede acceder a %s',
    async (path) => {
      loginAsRole('Abonado')
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
        expect(app.container.innerHTML).toContain('Acceso denegado')
      } finally {
        await app.cleanup()
      }
    },
  )

  it.each([...FONTANERO_PATHS, ...ADMIN_PATHS])(
    'Secretaria recibe acceso denegado en %s',
    async (path) => {
      loginAsRole('Secretaria')
      const app = await mountAppRoutes(path)

      try {
        expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
        expect(app.container.innerHTML).toContain('Acceso denegado')
      } finally {
        await app.cleanup()
      }
    },
  )

  it('menú Fontanero incluye Registro de Actividades y no el módulo admin', async () => {
    loginAsRole('Fontanero')
    const app = await mountAppRoutes('/admin/dashboard')

    try {
      expect(app.container.innerHTML).toContain('href="/admin/actividades"')
      expect(app.container.innerHTML).not.toContain(
        'href="/admin/actividades-fontanero"',
      )
    } finally {
      await app.cleanup()
    }
  })

  it('menú Administradora incluye Actividades del Fontanero y no la operativa', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes('/admin/dashboard')

    try {
      expect(app.container.innerHTML).toContain(
        'href="/admin/actividades-fontanero"',
      )
      expect(app.container.innerHTML).not.toContain('href="/admin/actividades"')
    } finally {
      await app.cleanup()
    }
  })

  it.each([...BACKLOG_FONTANERO_PATHS])(
    'ruta de backlog %s redirige al equivalente /admin y exige Fontanero',
    async (path) => {
      loginAsRole('Fontanero')
      const app = await mountAppRoutes(path)

      try {
        const expected = path.replace('/fontanero/actividades', '/admin/actividades')
        expect(app.currentPath()).toBe(expected)
        expect(app.container.innerHTML).toContain('Registro de Actividades')
      } finally {
        await app.cleanup()
      }
    },
  )

  it('URL de backlog sin sesión redirige a login', async () => {
    const app = await mountAppRoutes('/fontanero/actividades/nueva')

    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
    } finally {
      await app.cleanup()
    }
  })

  it('Abonado con URL de backlog recibe acceso denegado tras redirección', async () => {
    loginAsRole('Abonado')
    const app = await mountAppRoutes('/fontanero/actividades')

    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
    } finally {
      await app.cleanup()
    }
  })
})
