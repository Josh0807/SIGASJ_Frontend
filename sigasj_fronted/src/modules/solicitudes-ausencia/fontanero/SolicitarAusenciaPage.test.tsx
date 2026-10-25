import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/publicRoutes'
import { clearAccessToken, setAuthSession } from '../../auth/utils/authStorage'
import { getAdminNavItemsForUser } from '../../auth/utils/adminNavigation'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import * as vacacionesApi from '../../recursos-humanos/vacacionesApi'
import * as ausenciaApi from '../solicitudesAusenciaApi'
import {
  FONTANERO_SOLICITAR_AUSENCIA_PATH,
  FONTANERO_SOLICITAR_PERMISO_PATH,
  FONTANERO_SOLICITAR_PERMISO_TITLE,
  FONTANERO_SOLICITAR_VACACIONES_PATH,
  FONTANERO_SOLICITAR_VACACIONES_TITLE,
} from '../solicitudesAusenciaPaths'

const HUB = FONTANERO_SOLICITAR_AUSENCIA_PATH
const PERMISO = FONTANERO_SOLICITAR_PERMISO_PATH
const VACACIONES = FONTANERO_SOLICITAR_VACACIONES_PATH

const flushAsync = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

const setInput = (el: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('PBI 6.5.5 — Solicitar permiso o vacaciones (Fontanero)', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
    vi.spyOn(ausenciaApi, 'crearMiSolicitudAusencia').mockResolvedValue({
      id: 42,
      tipo: 'PERMISO',
      fechaInicio: '2026-11-01',
      fechaFin: '2026-11-02',
      motivo: 'Cita médica',
      correoNotificacion: 'fontanero@asadasanjuan.cr, jefe@asadasanjuan.cr',
      observaciones: null,
      estado: 'PENDIENTE',
      motivoRechazo: null,
      reviewedAt: null,
      createdAt: '2026-10-19T12:00:00.000Z',
      updatedAt: '2026-10-19T12:00:00.000Z',
    })
    vi.spyOn(vacacionesApi, 'getBalanceVacacionesPropio').mockResolvedValue({
      colaboradorId: 3,
      colaborador: {
        id: 3,
        nombre: 'Carlos',
        apellidos: 'Mora',
        cedula: '1',
        cargo: 'Fontanero',
        activo: true,
      },
      diasAcumulados: 10,
      diasDisfrutados: 2,
      diasAjusteNeto: 0,
      diasDisponibles: 8,
      totalMovimientos: 2,
    })
  })

  it('menú Fontanero muestra permiso y vacaciones por separado', () => {
    const items = getAdminNavItemsForUser({ role: 'Fontanero', id: '3' })
    expect(items.find((i) => i.path === PERMISO)?.title).toBe(
      FONTANERO_SOLICITAR_PERMISO_TITLE,
    )
    expect(items.find((i) => i.path === VACACIONES)?.title).toBe(
      FONTANERO_SOLICITAR_VACACIONES_TITLE,
    )
    expect(items.find((i) => i.path === HUB)).toBeUndefined()
  })

  it('el hub ofrece ambos trámites sin formulario combinado', async () => {
    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero', name: 'Carlos', lastName: 'Mora' },
    })
    const app = await mountAppRoutes(HUB)
    await flushAsync()
    try {
      const html = app.container.innerHTML
      expect(html).toContain('Solicitar permiso o vacaciones')
      expect(html).toContain('Un permiso no descuenta vacaciones')
      expect(html).toContain(FONTANERO_SOLICITAR_PERMISO_TITLE)
      expect(html).toContain(FONTANERO_SOLICITAR_VACACIONES_TITLE)
      expect(html).toContain(PERMISO)
      expect(html).toContain(VACACIONES)
      expect(app.container.querySelector('select')).toBeNull()
      expect(app.container.querySelector('iframe')).toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('formulario de permiso envía tipo PERMISO y varios correos', async () => {
    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero', name: 'Carlos' },
    })
    vi.spyOn(ausenciaApi, 'getMiSolicitudAusencia').mockResolvedValue({
      id: 42,
      tipo: 'PERMISO',
      fechaInicio: '2026-11-01',
      fechaFin: '2026-11-02',
      motivo: 'Cita médica',
      correoNotificacion: 'aviso@asadasanjuan.cr, jefe@asadasanjuan.cr',
      observaciones: null,
      estado: 'PENDIENTE',
      motivoRechazo: null,
      reviewedAt: null,
      createdAt: '2026-10-19T12:00:00.000Z',
      updatedAt: '2026-10-19T12:00:00.000Z',
    })

    const app = await mountAppRoutes(PERMISO)
    await flushAsync()
    try {
      expect(app.container.innerHTML).toContain('Solicitar permiso')
      expect(app.container.innerHTML).toContain('No descuenta vacaciones')
      expect(app.container.innerHTML).toContain('Adjuntar archivos')
      expect(app.container.querySelector('select')).toBeNull()
      const correo = app.container.querySelector(
        'input[placeholder*="uno@correo.cr"]',
      ) as HTMLInputElement
      const fechas = app.container.querySelectorAll('input[type="date"]')
      const motivo = app.container.querySelector('textarea') as HTMLTextAreaElement

      await act(async () => {
        setInput(correo, 'aviso@asadasanjuan.cr, jefe@asadasanjuan.cr')
        setInput(fechas[0] as HTMLInputElement, '2026-11-01')
        setInput(fechas[1] as HTMLInputElement, '2026-11-02')
        setInput(motivo, 'Cita médica')
      })

      const enviar = Array.from(app.container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Enviar solicitud de permiso'),
      )
      await act(async () => {
        enviar!.click()
      })
      await flushAsync()

      expect(ausenciaApi.crearMiSolicitudAusencia).toHaveBeenCalledWith({
        tipo: 'PERMISO',
        fechaInicio: '2026-11-01',
        fechaFin: '2026-11-02',
        correo: 'aviso@asadasanjuan.cr, jefe@asadasanjuan.cr',
        motivo: 'Cita médica',
        documentos: [],
      })
      expect(app.currentPath()).toBe('/fontanero/mis-solicitudes/42')
    } finally {
      await app.cleanup()
    }
  })

  it('formulario de vacaciones muestra saldo y permite enviar sin observación', async () => {
    vi.mocked(ausenciaApi.crearMiSolicitudAusencia).mockResolvedValue({
      id: 43,
      tipo: 'VACACIONES',
      fechaInicio: '2026-11-16',
      fechaFin: '2026-11-20',
      motivo: null,
      correoNotificacion: 'fontanero@asadasanjuan.cr',
      observaciones: null,
      estado: 'PENDIENTE',
      motivoRechazo: null,
      reviewedAt: null,
      createdAt: '2026-10-19T12:00:00.000Z',
      updatedAt: '2026-10-19T12:00:00.000Z',
    })
    vi.spyOn(ausenciaApi, 'getMiSolicitudAusencia').mockResolvedValue({
      id: 43,
      tipo: 'VACACIONES',
      fechaInicio: '2026-11-16',
      fechaFin: '2026-11-20',
      motivo: null,
      correoNotificacion: 'fontanero@asadasanjuan.cr',
      observaciones: null,
      estado: 'PENDIENTE',
      motivoRechazo: null,
      reviewedAt: null,
      createdAt: '2026-10-19T12:00:00.000Z',
      updatedAt: '2026-10-19T12:00:00.000Z',
    })
    setAuthSession({
      accessToken: 'token-fontanero',
      user: {
        id: '3',
        role: 'Fontanero',
        email: 'fontanero@asadasanjuan.cr',
      },
    })
    const app = await mountAppRoutes(VACACIONES)
    await flushAsync()
    try {
      expect(app.container.innerHTML).toContain('Solicitar vacaciones')
      expect(app.container.innerHTML).toContain('8 día(s) disponibles')
      expect(app.container.innerHTML).not.toContain('Motivo')
      expect(app.container.querySelector('textarea')).toBeNull()
      const correo = app.container.querySelector(
        'input[placeholder*="uno@correo.cr"]',
      ) as HTMLInputElement
      const fechas = app.container.querySelectorAll('input[type="date"]')
      await act(async () => {
        setInput(correo, 'fontanero@asadasanjuan.cr')
        setInput(fechas[0] as HTMLInputElement, '2026-11-16')
        setInput(fechas[1] as HTMLInputElement, '2026-11-20')
      })
      const enviar = Array.from(app.container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Enviar solicitud de vacaciones'),
      )
      await act(async () => {
        enviar!.click()
      })
      await flushAsync()
      expect(ausenciaApi.crearMiSolicitudAusencia).toHaveBeenCalledWith({
        tipo: 'VACACIONES',
        fechaInicio: '2026-11-16',
        fechaFin: '2026-11-20',
        correo: 'fontanero@asadasanjuan.cr',
        motivo: null,
        documentos: [],
      })
      expect(app.currentPath()).toBe('/fontanero/mis-solicitudes/43')
    } finally {
      await app.cleanup()
    }
  })

  it('sin sesión redirige al login', async () => {
    const app = await mountAppRoutes(PERMISO)
    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).not.toContain('Solicitar permiso')
    } finally {
      await app.cleanup()
    }
  })

  it('Administradora no puede entrar a la ruta Fontanero', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes(PERMISO)
    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
    } finally {
      await app.cleanup()
    }
  })

  it('muestra error controlado si falla el envío', async () => {
    vi.spyOn(ausenciaApi, 'crearMiSolicitudAusencia').mockRejectedValue(
      new Error('HTTP 500: x'),
    )
    setAuthSession({
      accessToken: 'token-fontanero',
      user: {
        id: '3',
        role: 'Fontanero',
        email: 'fontanero@asadasanjuan.cr',
      },
    })
    const app = await mountAppRoutes(PERMISO)
    await flushAsync()
    try {
      const correo = app.container.querySelector(
        'input[placeholder*="uno@correo.cr"]',
      ) as HTMLInputElement
      const fechas = app.container.querySelectorAll('input[type="date"]')
      const motivo = app.container.querySelector('textarea') as HTMLTextAreaElement
      await act(async () => {
        setInput(correo, 'aviso@asadasanjuan.cr')
        setInput(fechas[0] as HTMLInputElement, '2026-11-01')
        setInput(fechas[1] as HTMLInputElement, '2026-11-02')
        setInput(motivo, 'Trámite')
      })
      const enviar = Array.from(app.container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Enviar solicitud de permiso'),
      )
      await act(async () => {
        enviar!.click()
      })
      await flushAsync()
      expect(app.container.innerHTML).toContain(
        'No fue posible enviar la solicitud. Intente nuevamente.',
      )
      expect(app.currentPath()).toBe(PERMISO)
    } finally {
      await app.cleanup()
    }
  })

  it('no expone secretos de Jotform en el markup', async () => {
    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero' },
    })
    const app = await mountAppRoutes(HUB)
    await flushAsync()
    try {
      const html = app.container.innerHTML
      expect(html).not.toMatch(/JOTFORM_API_KEY/i)
      expect(html).not.toMatch(/JOTFORM_WEBHOOK_SECRET/i)
      expect(html).not.toMatch(/VITE_JOTFORM_API_KEY/i)
    } finally {
      await app.cleanup()
    }
  })
})
