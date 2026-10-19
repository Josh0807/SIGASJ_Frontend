import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/publicRoutes'
import { clearAccessToken, setAuthSession } from '../../auth/utils/authStorage'
import { getAdminNavItemsForUser } from '../../auth/utils/adminNavigation'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import * as ausenciaApi from '../solicitudesAusenciaApi'
import {
  FONTANERO_MIS_SOLICITUDES_PATH,
  FONTANERO_MIS_SOLICITUDES_TITLE,
} from '../solicitudesAusenciaPaths'
import type { SolicitudAusenciaFontanero } from '../types'

const PATH = FONTANERO_MIS_SOLICITUDES_PATH

const flushAsync = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

const fixture: SolicitudAusenciaFontanero[] = [
  {
    id: 11,
    tipo: 'PERMISO',
    fechaInicio: '2026-11-01',
    fechaFin: '2026-11-02',
    motivo: 'Trámite personal largo para resumir en el listado del Fontanero',
    correoNotificacion: 'fontanero@asadasanjuan.cr',
    observaciones: null,
    estado: 'PENDIENTE',
    motivoRechazo: null,
    reviewedAt: null,
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z',
  },
  {
    id: 12,
    tipo: 'VACACIONES',
    fechaInicio: '2026-12-01',
    fechaFin: '2026-12-05',
    motivo: 'Descanso',
    correoNotificacion: 'fontanero@asadasanjuan.cr',
    observaciones: null,
    estado: 'APROBADA',
    motivoRechazo: null,
    reviewedAt: '2026-10-02T10:00:00.000Z',
    createdAt: '2026-10-01T13:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 13,
    tipo: 'PERMISO',
    fechaInicio: '2026-11-10',
    fechaFin: '2026-11-10',
    motivo: 'Cita',
    correoNotificacion: 'fontanero@asadasanjuan.cr',
    observaciones: null,
    estado: 'RECHAZADA',
    motivoRechazo: 'Sin cobertura',
    reviewedAt: '2026-10-03T09:00:00.000Z',
    createdAt: '2026-10-01T14:00:00.000Z',
    updatedAt: '2026-10-03T09:00:00.000Z',
  },
]

describe('PBI 6.5.6 — Mis solicitudes (Fontanero)', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
    vi.spyOn(ausenciaApi, 'getMisSolicitudesAusencia').mockResolvedValue(fixture)
    vi.spyOn(ausenciaApi, 'getMiSolicitudAusencia').mockImplementation(
      async (id: number) => {
        const found = fixture.find((s) => s.id === id)
        if (!found) {
          throw new Error('HTTP 404: No existe')
        }
        return found
      },
    )
  })

  it('menú Fontanero incluye Mis solicitudes', () => {
    const items = getAdminNavItemsForUser({ role: 'Fontanero', id: '3' })
    const item = items.find((i) => i.path === PATH)
    expect(item?.title).toBe(FONTANERO_MIS_SOLICITUDES_TITLE)
  })

  it('Fontanero ve listado con tipos, estados y Ver detalle', async () => {
    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero' },
    })
    const app = await mountAppRoutes(PATH)
    await flushAsync()

    try {
      expect(app.currentPath()).toBe(PATH)
      const html = app.container.innerHTML
      expect(html).toContain('Mis solicitudes')
      expect(html).toContain('Permiso')
      expect(html).toContain('Vacaciones')
      expect(html).toContain('Pendiente')
      expect(html).toContain('Aprobada')
      expect(html).toContain('Rechazada')
      expect(html).toContain('Ver detalle')
      expect(html).toContain('/fontanero/mis-solicitudes/11')
      expect(html).not.toContain('Vacaciones aprobadas')
      expect(ausenciaApi.getMisSolicitudesAusencia).toHaveBeenCalledTimes(1)
      const callArgs = vi.mocked(ausenciaApi.getMisSolicitudesAusencia).mock.calls[0]
      expect(callArgs.length).toBeLessThanOrEqual(1)
    } finally {
      await app.cleanup()
    }
  })

  it('listado vacío muestra mensaje amigable', async () => {
    vi.spyOn(ausenciaApi, 'getMisSolicitudesAusencia').mockResolvedValue([])
    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero' },
    })
    const app = await mountAppRoutes(PATH)
    await flushAsync()
    try {
      expect(app.container.innerHTML).toContain(
        'Aún no tiene solicitudes registradas.',
      )
      expect(app.container.innerHTML).toContain('Solicitar permiso o vacaciones')
      expect(app.container.innerHTML).not.toContain('No fue posible cargar')
    } finally {
      await app.cleanup()
    }
  })

  it('error de listado muestra reintento', async () => {
    vi.spyOn(ausenciaApi, 'getMisSolicitudesAusencia').mockRejectedValue(
      new Error('HTTP 500: x'),
    )
    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero' },
    })
    const app = await mountAppRoutes(PATH)
    await flushAsync()
    try {
      expect(app.container.innerHTML).toContain(
        'No fue posible cargar sus solicitudes',
      )
      expect(app.container.innerHTML).toContain('Reintentar')
    } finally {
      await app.cleanup()
    }
  })

  it('sin sesión redirige al login', async () => {
    const app = await mountAppRoutes(PATH)
    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
    } finally {
      await app.cleanup()
    }
  })

  it('Administradora no puede abrir Mis solicitudes', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes(PATH)
    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    } finally {
      await app.cleanup()
    }
  })

  it('detalle propio consulta API y muestra datos', async () => {
    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero' },
    })
    const app = await mountAppRoutes(`${PATH}/12`)
    await flushAsync()
    try {
      expect(app.currentPath()).toBe(`${PATH}/12`)
      expect(ausenciaApi.getMiSolicitudAusencia).toHaveBeenCalledWith(
        12,
        expect.anything(),
      )
      const html = app.container.innerHTML
      expect(html).toContain('Vacaciones')
      expect(html).toContain('Aprobada')
      expect(html).toContain('Descanso')
      expect(html).toContain('Volver a mis solicitudes')
      expect(html).not.toContain('Aprobar')
      expect(html).not.toContain('Rechazar')
    } finally {
      await app.cleanup()
    }
  })

  it('detalle pendiente muestra mensaje de revisión', async () => {
    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero' },
    })
    const app = await mountAppRoutes(`${PATH}/11`)
    await flushAsync()
    try {
      expect(app.container.innerHTML).toContain(
        'Su solicitud está pendiente de revisión.',
      )
      expect(app.container.innerHTML).toContain('Pendiente')
    } finally {
      await app.cleanup()
    }
  })

  it('detalle 404 muestra mensaje y volver', async () => {
    vi.spyOn(ausenciaApi, 'getMiSolicitudAusencia').mockRejectedValue(
      new Error('HTTP 404: No existe'),
    )
    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero' },
    })
    const app = await mountAppRoutes(`${PATH}/999`)
    await flushAsync()
    try {
      expect(app.container.innerHTML).toContain('No se encontró la solicitud.')
      expect(app.container.innerHTML).toContain('Volver a mis solicitudes')
    } finally {
      await app.cleanup()
    }
  })

  it('detalle rechazada muestra motivo de rechazo si existe', async () => {
    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero' },
    })
    const app = await mountAppRoutes(`${PATH}/13`)
    await flushAsync()
    try {
      expect(app.container.innerHTML).toContain('Rechazada')
      expect(app.container.innerHTML).toContain('Sin cobertura')
    } finally {
      await app.cleanup()
    }
  })
})
