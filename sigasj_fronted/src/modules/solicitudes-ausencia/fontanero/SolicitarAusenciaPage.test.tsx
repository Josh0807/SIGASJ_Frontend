import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/publicRoutes'
import { clearAccessToken, setAuthSession } from '../../auth/utils/authStorage'
import { getAdminNavItemsForUser } from '../../auth/utils/adminNavigation'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import * as ausenciaApi from '../solicitudesAusenciaApi'
import {
  FONTANERO_SOLICITAR_AUSENCIA_PATH,
  FONTANERO_SOLICITAR_AUSENCIA_TITLE,
} from '../solicitudesAusenciaPaths'
import { hoyEnAsada } from '../../../shared/utils/fechaAsada'

const PATH = FONTANERO_SOLICITAR_AUSENCIA_PATH

const flushAsync = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
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
      correoNotificacion: 'fontanero@asadasanjuan.cr',
      observaciones: null,
      estado: 'PENDIENTE',
      motivoRechazo: null,
      reviewedAt: null,
      createdAt: '2026-10-19T12:00:00.000Z',
      updatedAt: '2026-10-19T12:00:00.000Z',
    })
  })

  it('menú Fontanero muestra la opción con el título correcto', () => {
    const items = getAdminNavItemsForUser({ role: 'Fontanero', id: '3' })
    const item = items.find((i) => i.path === PATH)
    expect(item).toBeDefined()
    expect(item?.title).toBe(FONTANERO_SOLICITAR_AUSENCIA_TITLE)
    expect(item?.title).toBe('Solicitar permiso o vacaciones')
  })

  it('Fontanero ve formulario nativo con aviso y sin embed externo', async () => {
    setAuthSession({
      accessToken: 'token-fontanero',
      user: {
        id: '3',
        role: 'Fontanero',
        name: 'Carlos',
        lastName: 'Mora',
        email: 'fontanero@asadasanjuan.cr',
      },
    })
    const app = await mountAppRoutes(PATH)
    await flushAsync()

    try {
      expect(app.currentPath()).toBe(PATH)
      const html = app.container.innerHTML
      expect(html).toContain('Solicitar permiso o vacaciones')
      expect(html).toContain('Complete el formulario para enviar su solicitud')
      expect(html).toContain('pendiente')
      expect(html).toContain('no se considera aprobada')
      expect(html).toContain('Carlos Mora')
      expect(html).toContain('Correo para aviso')
      expect(html).toContain('ejemplo@correo.com')
      expect(html).toContain('recibir el aviso si la solicitud es')
      const correoInput = app.container.querySelector(
        'input[type="email"]',
      ) as HTMLInputElement
      expect(correoInput?.value).toBe('fontanero@asadasanjuan.cr')
      const fechas = app.container.querySelectorAll('input[type="date"]')
      expect((fechas[0] as HTMLInputElement).value).toBe(hoyEnAsada())
      expect((fechas[1] as HTMLInputElement).value).toBe(hoyEnAsada())
      expect(html).toContain('Seleccione el tipo')
      expect(html).toContain('Permiso')
      expect(html).toContain('Vacaciones')
      expect(html).toContain('Enviar solicitud')
      expect(html).not.toContain('Vacaciones aprobadas')
      expect(html).not.toContain('Cree su propio Jotform')
      expect(app.container.querySelector('iframe')).toBeNull()
      expect(app.container.querySelector('fieldset')).toBeNull()
      expect(html).not.toContain('form.jotform.com')
    } finally {
      await app.cleanup()
    }
  })

  it('envía solicitud y navega al detalle', async () => {
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
      correoNotificacion: 'aviso@asadasanjuan.cr',
      observaciones: null,
      estado: 'PENDIENTE',
      motivoRechazo: null,
      reviewedAt: null,
      createdAt: '2026-10-19T12:00:00.000Z',
      updatedAt: '2026-10-19T12:00:00.000Z',
    })

    const app = await mountAppRoutes(PATH)
    await flushAsync()

    try {
      const tipo = app.container.querySelector('select') as HTMLSelectElement
      const fechas = app.container.querySelectorAll('input[type="date"]')
      const correo = app.container.querySelector(
        'input[type="email"]',
      ) as HTMLInputElement
      const motivo = app.container.querySelector(
        'input[placeholder*="Cita médica"]',
      ) as HTMLInputElement

      await act(async () => {
        const setSelect = (el: HTMLSelectElement, value: string) => {
          Object.getOwnPropertyDescriptor(
            HTMLSelectElement.prototype,
            'value',
          )?.set?.call(el, value)
          el.dispatchEvent(new Event('change', { bubbles: true }))
        }
        const setInput = (el: HTMLInputElement, value: string) => {
          Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value',
          )?.set?.call(el, value)
          el.dispatchEvent(new Event('input', { bubbles: true }))
          el.dispatchEvent(new Event('change', { bubbles: true }))
        }
        setInput(correo, 'aviso@asadasanjuan.cr')
        setSelect(tipo, 'PERMISO')
        setInput(fechas[0] as HTMLInputElement, '2026-11-01')
        setInput(fechas[1] as HTMLInputElement, '2026-11-02')
        setInput(motivo, 'Cita médica')
      })

      const enviar = Array.from(app.container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Enviar solicitud'),
      )
      await act(async () => {
        enviar!.click()
      })
      await flushAsync()

      expect(ausenciaApi.crearMiSolicitudAusencia).toHaveBeenCalledWith({
        tipo: 'PERMISO',
        fechaInicio: '2026-11-01',
        fechaFin: '2026-11-02',
        correo: 'aviso@asadasanjuan.cr',
        motivo: 'Cita médica',
      })
      expect(app.currentPath()).toBe('/fontanero/mis-solicitudes/42')
    } finally {
      await app.cleanup()
    }
  })

  it('sin sesión redirige al login', async () => {
    const app = await mountAppRoutes(PATH)
    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).not.toContain('Solicitar permiso o vacaciones')
    } finally {
      await app.cleanup()
    }
  })

  it('Administradora no puede entrar a la ruta Fontanero', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes(PATH)
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
    const app = await mountAppRoutes(PATH)
    await flushAsync()
    try {
      const tipo = app.container.querySelector('select') as HTMLSelectElement
      const fechas = app.container.querySelectorAll('input[type="date"]')
      const motivo = app.container.querySelector(
        'input[placeholder*="Cita médica"]',
      ) as HTMLInputElement
      await act(async () => {
        Object.getOwnPropertyDescriptor(
          HTMLSelectElement.prototype,
          'value',
        )?.set?.call(tipo, 'PERMISO')
        tipo.dispatchEvent(new Event('change', { bubbles: true }))
        const setInput = (el: HTMLInputElement, value: string) => {
          Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value',
          )?.set?.call(el, value)
          el.dispatchEvent(new Event('input', { bubbles: true }))
        }
        setInput(fechas[0] as HTMLInputElement, '2026-11-01')
        setInput(fechas[1] as HTMLInputElement, '2026-11-02')
        setInput(motivo, 'Trámite')
      })
      const enviar = Array.from(app.container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Enviar solicitud'),
      )
      await act(async () => {
        enviar!.click()
      })
      await flushAsync()
      expect(app.container.innerHTML).toContain(
        'No fue posible enviar la solicitud. Intente nuevamente.',
      )
      expect(app.currentPath()).toBe(PATH)
    } finally {
      await app.cleanup()
    }
  })

  it('no expone secretos de Jotform en el markup', async () => {
    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero' },
    })
    const app = await mountAppRoutes(PATH)
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
