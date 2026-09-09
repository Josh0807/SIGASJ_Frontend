import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAuthSession } from '../../modules/auth/utils/authStorage'
import { mountAppRoutes } from '../../test/render-app-routes'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../app/router/publicRoutes'
import { ACTIVIDADES_FONTANERO_PATHS } from './actividadesFontaneroPaths'
import { ACTIVITY_FEEDBACK_MESSAGES } from './utils/activityFeedbackMessages'
import { respuestaTiposActividad } from './test/tiposActividadFixture'
import * as actividadesApi from './services/actividadesFontaneroApi'

const loginAsFontanero = () => {
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

const setInputValue = (
  input: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) => {
  const prototype =
    input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const fillMinimalControlFugas = (container: HTMLElement) => {
  const fecha = container.querySelector('#fechaActividad') as HTMLInputElement
  const titulo = container.querySelector('#titulo') as HTMLInputElement
  const ubicacionFuga = container.querySelector(
    '#ubicacionFuga',
  ) as HTMLInputElement
  setInputValue(fecha, '2026-09-07')
  setInputValue(titulo, 'Control validación 7.10')
  setInputValue(ubicacionFuga, 'Sector norte')
  return { fecha, titulo, ubicacionFuga }
}

/**
 * Validación funcional Backlog 7.10 — gaps de UI (500/network/leak/403/duplicados).
 */
describe('Backlog 7.10 — validación mensajes registro (UI)', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
    vi.spyOn(actividadesApi, 'getTiposActividadFontanero').mockResolvedValue(
      respuestaTiposActividad,
    )
    vi.spyOn(actividadesApi, 'getCorreccionesPendientes').mockResolvedValue({
      data: [],
      total: 0,
    })
  })

  it('500 muestra mensaje seguro, no expone QueryFailedError/TypeORM y preserva datos', async () => {
    vi.spyOn(actividadesApi, 'registrarActividad').mockRejectedValue(
      new Error(
        'HTTP 500: QueryFailedError: INSERT INTO ActividadFontanero TypeORM SQL Exception stack at Object',
      ),
    )
    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_FUGAS'),
    )

    try {
      const fields = fillMinimalControlFugas(app.container)
      const form = app.container.querySelector(
        'form.actividad-registro-form',
      ) as HTMLFormElement

      await act(async () => {
        form.requestSubmit()
      })

      expect(
        app.container.querySelector('[data-testid="actividad-registro-exito"]'),
      ).toBeNull()
      expect(app.container.textContent).toContain(
        ACTIVITY_FEEDBACK_MESSAGES.server,
      )
      expect(app.container.innerHTML).not.toMatch(
        /QueryFailedError|TypeORM|INSERT INTO|stack at/i,
      )
      expect(fields.titulo.value).toBe('Control validación 7.10')
      expect(fields.ubicacionFuga.value).toBe('Sector norte')
      expect(fields.fecha.value).toBe('2026-09-07')

      const submit = app.container.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement
      expect(submit.disabled).toBe(false)
      expect(
        app.container.querySelectorAll('[role="alert"]').length,
      ).toBeLessThanOrEqual(2)
    } finally {
      await app.cleanup()
    }
  })

  it('error de red muestra mensaje de conexión, preserva datos y rehabilita submit', async () => {
    vi.spyOn(actividadesApi, 'registrarActividad').mockRejectedValue(
      new TypeError('Failed to fetch'),
    )
    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_FUGAS'),
    )

    try {
      const fields = fillMinimalControlFugas(app.container)
      const form = app.container.querySelector(
        'form.actividad-registro-form',
      ) as HTMLFormElement

      await act(async () => {
        form.requestSubmit()
      })

      expect(app.container.textContent).toContain(
        ACTIVITY_FEEDBACK_MESSAGES.network,
      )
      expect(app.container.textContent).not.toContain('Datos inválidos')
      expect(app.container.textContent).not.toContain('No hay resultados')
      expect(fields.titulo.value).toBe('Control validación 7.10')
      expect(
        (app.container.querySelector('button[type="submit"]') as HTMLButtonElement)
          .disabled,
      ).toBe(false)
    } finally {
      await app.cleanup()
    }
  })

  it('403 muestra sin permisos y no cierra sesión a login', async () => {
    vi.spyOn(actividadesApi, 'registrarActividad').mockRejectedValue(
      new Error('HTTP 403: Acceso denegado'),
    )
    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_FUGAS'),
    )

    try {
      fillMinimalControlFugas(app.container)
      const form = app.container.querySelector(
        'form.actividad-registro-form',
      ) as HTMLFormElement

      await act(async () => {
        form.requestSubmit()
      })

      expect(app.container.textContent).toContain(
        ACTIVITY_FEEDBACK_MESSAGES.forbidden,
      )
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(
        app.container.querySelector('[data-testid="actividad-registro-exito"]'),
      ).toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('éxito muestra una sola confirmación y no hay success antes de resolver', async () => {
    let resolveRegister!: (value: unknown) => void
    vi.spyOn(actividadesApi, 'registrarActividad').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRegister = resolve
        }),
    )
    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_FUGAS'),
    )

    try {
      fillMinimalControlFugas(app.container)
      const form = app.container.querySelector(
        'form.actividad-registro-form',
      ) as HTMLFormElement

      await act(async () => {
        form.requestSubmit()
      })

      expect(
        app.container.querySelector('[data-testid="actividad-registro-exito"]'),
      ).toBeNull()
      expect(app.container.textContent).toContain('Registrando')

      await act(async () => {
        resolveRegister({
          id: 77,
          tipoActividadId: 1,
          tipoActividadNombre: 'Control de Fugas',
          fechaActividad: '2026-09-07',
          titulo: 'Control validación 7.10',
          descripcion: null,
          ubicacion: null,
          observaciones: null,
          estado: 'REPORTADA',
          observacionCorreccion: null,
          createdAt: '2026-09-07T00:00:00.000Z',
          updatedAt: '2026-09-07T00:00:00.000Z',
        })
        await Promise.resolve()
      })

      const success = app.container.querySelectorAll(
        '[data-testid="actividad-registro-exito"]',
      )
      expect(success).toHaveLength(1)
      expect(success[0]?.getAttribute('role')).toBe('status')
      expect(app.container.textContent).toContain(
        'Actividad registrada correctamente',
      )
    } finally {
      await app.cleanup()
    }
  })
})
