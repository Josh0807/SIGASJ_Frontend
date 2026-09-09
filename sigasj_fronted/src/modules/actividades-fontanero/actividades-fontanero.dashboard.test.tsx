import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAuthSession } from '../auth/utils/authStorage'
import { loginAsRole } from '../../test/authTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'
import { ACTIVIDADES_FONTANERO_PATHS } from './actividadesFontaneroPaths'
import { ACTIVIDADES_ADMIN_PATHS } from './admin/actividadesAdminPaths'
import * as actividadesApi from './services/actividadesFontaneroApi'

const resumenFontanero = {
  total: 5,
  porEstado: {
    REPORTADA: 2,
    EN_REVISION: 1,
    REVISADA: 1,
    REQUIERE_CORRECCION: 1,
  },
}

const resumenAdmin = {
  total: 4,
  porEstado: {
    REPORTADA: 1,
    REVISADA: 2,
    CORREGIDA: 1,
  },
}

describe('Dashboard resumen de actividades (7.11)', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
    vi.spyOn(actividadesApi, 'getCorreccionesPendientes').mockResolvedValue({
      data: [],
      total: 0,
    })
    vi.spyOn(actividadesApi, 'getActividadesAdmin').mockResolvedValue({
      data: [],
      total: 0,
      totalPages: 1,
    })
    vi.spyOn(actividadesApi, 'getReportesAdmin').mockResolvedValue({
      total: 0,
      porEstado: {},
      porTipo: [],
      porFontanero: [],
      actividades: [],
    })
  })

  it('fontanero ve dashboard con indicadores del resumen propio', async () => {
    vi.spyOn(actividadesApi, 'getResumenActividadesFontanero').mockResolvedValue(
      resumenFontanero,
    )
    loginAsRole('Fontanero')

    const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.dashboard)

    try {
      expect(app.container.innerHTML).toContain('Dashboard de actividades')
      expect(app.container.innerHTML).toContain('Actividades registradas')
      expect(app.container.innerHTML).toContain('Pendientes de revisión')
      expect(app.container.innerHTML).toContain('Corrección solicitada')
      expect(app.container.innerHTML).toContain('Registrar actividad')
      expect(app.container.innerHTML).toContain('href="/admin/actividades/nueva"')
    } finally {
      await app.cleanup()
    }
  })

  it('administradora ve dashboard operativo con resumen general', async () => {
    vi.spyOn(actividadesApi, 'getResumenActividadesAdmin').mockResolvedValue(resumenAdmin)
    loginAsRole('Administradora')

    const app = await mountAppRoutes(ACTIVIDADES_ADMIN_PATHS.dashboard)

    try {
      expect(app.container.innerHTML).toContain('Dashboard operativo')
      expect(app.container.innerHTML).toContain('Actividades reportadas')
      expect(app.container.innerHTML).toContain('Corregidas')
      expect(app.container.innerHTML).toContain('Revisión de actividades')
      expect(app.container.innerHTML).toContain('href="/admin/actividades-fontanero/reportes"')
    } finally {
      await app.cleanup()
    }
  })

  it('reconsulta al pulsar Actualizar', async () => {
    const fetchMock = vi
      .spyOn(actividadesApi, 'getResumenActividadesFontanero')
      .mockResolvedValue(resumenFontanero)

    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero', name: 'Carlos', lastName: 'Mora' },
    })

    const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.dashboard)

    try {
      expect(fetchMock).toHaveBeenCalledTimes(1)

      const refreshButton = app.container.querySelector(
        'button[aria-label="Actualizar resumen de actividades"]',
      ) as HTMLButtonElement | null
      expect(refreshButton).not.toBeNull()

      await act(async () => {
        refreshButton?.click()
      })

      expect(fetchMock).toHaveBeenCalledTimes(2)
    } finally {
      await app.cleanup()
    }
  })

  it('muestra error y permite reintentar', async () => {
    const fetchMock = vi
      .spyOn(actividadesApi, 'getResumenActividadesFontanero')
      .mockRejectedValueOnce(new Error('fallo'))
      .mockResolvedValueOnce(resumenFontanero)

    loginAsRole('Fontanero')
    const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.dashboard)

    try {
      expect(app.container.innerHTML).toContain(
        'No fue posible completar la operación',
      )

      const retryButton = Array.from(app.container.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === 'Reintentar',
      ) as HTMLButtonElement | undefined
      expect(retryButton).toBeDefined()

      await act(async () => {
        retryButton?.click()
      })

      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(app.container.innerHTML).toContain('Dashboard de actividades')
    } finally {
      await app.cleanup()
    }
  })
})
