import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAuthSession } from '../../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/publicRoutes'
import * as actividadesApi from '../services/actividadesFontaneroApi'
import { respuestaTiposActividad } from '../test/tiposActividadFixture'

const HOME_PATH = '/admin/actividades'
const BACKLOG_HOME_PATH = '/fontanero/actividades'

const loginAsFontaneroConNombre = () => {
  setAuthSession({
    accessToken: 'token-fontanero',
    user: {
      id: '3',
      role: 'Fontanero',
      name: 'Carlos',
      lastName: 'Mora',
    },
  })
}

describe('pantalla principal — Registro de Actividades del Fontanero', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
    vi.spyOn(actividadesApi, 'getCorreccionesPendientes').mockResolvedValue({
      data: [],
      total: 0,
    })
    vi.spyOn(actividadesApi, 'getHistorialActividades').mockResolvedValue({
      data: [],
      total: 0,
    })
    vi.spyOn(actividadesApi, 'getTiposActividadFontanero').mockResolvedValue(respuestaTiposActividad)
  })

  it('Fontanero autenticado ve la pantalla de entrada con su nombre', async () => {
    loginAsFontaneroConNombre()
    const app = await mountAppRoutes(HOME_PATH)

    try {
      expect(app.currentPath()).toBe(HOME_PATH)
      expect(app.container.innerHTML).toContain('Registro de Actividades')
      expect(app.container.innerHTML).toContain('Carlos Mora')
      expect(app.container.innerHTML).toContain('Fontanero')
      expect(app.container.innerHTML).toContain('Volver al dashboard')
    } finally {
      await app.cleanup()
    }
  })

  it('ruta de backlog /fontanero/actividades muestra la misma pantalla', async () => {
    loginAsFontaneroConNombre()
    const app = await mountAppRoutes(BACKLOG_HOME_PATH)

    try {
      expect(app.currentPath()).toBe(HOME_PATH)
      expect(app.container.innerHTML).toContain('Registro de Actividades')
    } finally {
      await app.cleanup()
    }
  })

  it('sin sesión no puede visualizar la pantalla', async () => {
    const app = await mountAppRoutes(HOME_PATH)

    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).not.toContain('Registrar actividad realizada')
    } finally {
      await app.cleanup()
    }
  })

  it('Administradora no usa esta pantalla operativa', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes(HOME_PATH)

    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
    } finally {
      await app.cleanup()
    }
  })

  it('Abonado no puede visualizarla', async () => {
    loginAsRole('Abonado')
    const app = await mountAppRoutes(HOME_PATH)

    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
    } finally {
      await app.cleanup()
    }
  })

  it('muestra los cuatro accesos operativos y no opciones administrativas', async () => {
    loginAsFontaneroConNombre()
    const app = await mountAppRoutes(HOME_PATH)

    try {
      const html = app.container.innerHTML
      expect(html).toContain('Registrar actividad realizada')
      expect(html).toContain('Ver mis actividades')
      expect(html).toContain('Historial')
      expect(html).toContain('Correcciones pendientes')
      expect(html).toContain('href="/admin/actividades/nueva"')
      expect(html).toContain('href="/admin/actividades/mis-actividades"')
      expect(html).toContain('href="/admin/actividades/historial"')
      expect(html).toContain('href="/admin/actividades/correcciones"')
      expect(html).not.toContain('href="/admin/actividades-fontanero"')
      expect(html).not.toContain('Dashboard de actividades')
      expect(html).not.toContain('Reportes de actividades')
    } finally {
      await app.cleanup()
    }
  })

  it('permite iniciar el registro de una actividad (selección de tipo)', async () => {
    loginAsFontaneroConNombre()
    const app = await mountAppRoutes('/admin/actividades/nueva')

    try {
      await act(async () => {
        await Promise.resolve()
      })
      expect(app.currentPath()).toBe('/admin/actividades/nueva')
      expect(app.container.innerHTML).toContain('Registrar actividad')
      expect(app.container.innerHTML).toContain('Seleccione el tipo de actividad')
      expect(app.container.innerHTML).toContain('Control de Fugas')
      expect(app.container.innerHTML).toContain('Toma de presión')
    } finally {
      await app.cleanup()
    }
  })

  it('permite acceder a mis actividades e historial', async () => {
    loginAsFontaneroConNombre()

    const mis = await mountAppRoutes('/admin/actividades/mis-actividades')
    try {
      expect(mis.currentPath()).toBe('/admin/actividades/mis-actividades')
      expect(mis.container.innerHTML).toContain('Mis actividades')
    } finally {
      await mis.cleanup()
    }

    const historial = await mountAppRoutes('/admin/actividades/historial')
    try {
      expect(historial.currentPath()).toBe('/admin/actividades/historial')
      expect(historial.container.innerHTML).toContain('Historial de actividades')
    } finally {
      await historial.cleanup()
    }
  })

  it('muestra estado cuando no existen correcciones pendientes', async () => {
    loginAsFontaneroConNombre()
    const app = await mountAppRoutes(HOME_PATH)

    try {
      expect(app.container.querySelector('[data-testid="correcciones-vacias"]')).not.toBeNull()
      expect(app.container.innerHTML).toContain('Sin correcciones pendientes por ahora.')
      expect(app.container.innerHTML).toContain(
        'No tiene actividades pendientes de corrección.',
      )
    } finally {
      await app.cleanup()
    }
  })

  it('muestra indicador numérico cuando hay correcciones pendientes', async () => {
    vi.spyOn(actividadesApi, 'getCorreccionesPendientes').mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }],
      total: 2,
    })
    loginAsFontaneroConNombre()
    const app = await mountAppRoutes(HOME_PATH)

    try {
      expect(app.container.querySelector('[data-testid="correcciones-vacias"]')).toBeNull()
      expect(app.container.innerHTML).toContain('>2<')
      expect(app.container.innerHTML).toContain(
        'Revise y reenvíe las actividades que requieren ajuste.',
      )
    } finally {
      await app.cleanup()
    }
  })

  it('muestra error controlado y permite reintentar el indicador', async () => {
    vi.spyOn(actividadesApi, 'getCorreccionesPendientes').mockRejectedValue(
      new Error('HTTP 500'),
    )
    loginAsFontaneroConNombre()
    const app = await mountAppRoutes(HOME_PATH)

    try {
      expect(app.container.innerHTML).toContain(
        'No se pudo cargar el indicador de correcciones.',
      )
      expect(app.container.innerHTML).toContain('Reintentar')
    } finally {
      await app.cleanup()
    }
  })

  it('aviso de sesión vencida cuando el indicador recibe 401', async () => {
    vi.spyOn(actividadesApi, 'getCorreccionesPendientes').mockRejectedValue(
      new Error('HTTP 401'),
    )
    loginAsFontaneroConNombre()
    const app = await mountAppRoutes(HOME_PATH)

    try {
      expect(app.container.innerHTML).toContain(
        'Su sesión no es válida o ha vencido',
      )
    } finally {
      await app.cleanup()
    }
  })
})
