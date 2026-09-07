import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAuthSession } from '../../modules/auth/utils/authStorage'
import { mountAppRoutes } from '../../test/render-app-routes'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../app/router/publicRoutes'
import { ACTIVIDADES_FONTANERO_PATHS } from './actividadesFontaneroPaths'
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

const actividadRegistradaMock = {
  id: 99,
  tipoActividadId: 1,
  tipoActividadNombre: 'Control de Fugas',
  fechaActividad: '2026-09-07',
  titulo: 'Control QA',
  descripcion: null,
  ubicacion: 'Sector A',
  observaciones: null,
  estado: 'REPORTADA',
  observacionCorreccion: null,
  createdAt: '2026-09-07T00:00:00.000Z',
  updatedAt: '2026-09-07T00:00:00.000Z',
}

const setInputValue = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

/**
 * QA #933 — flujo UI de registro, validación, corrección y navegación.
 */
describe('QA #933 — registro y validación (Frontend Fontanero)', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
    vi.spyOn(actividadesApi, 'registrarActividad').mockResolvedValue(actividadRegistradaMock)
  })

  it('flujo completo: seleccionar tipo → formulario → registro exitoso', async () => {
    loginAsFontanero()
    const seleccion = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.nueva)

    try {
      const link = seleccion.container.querySelector(
        '[data-testid="tipo-actividad-CONTROL_FUGAS"]',
      ) as HTMLAnchorElement
      expect(link).not.toBeNull()
      expect(link.getAttribute('href')).toBe(
        ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_FUGAS'),
      )
    } finally {
      await seleccion.cleanup()
    }

    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_FUGAS'),
    )

    try {
      const fecha = app.container.querySelector('#fechaActividad') as HTMLInputElement
      const titulo = app.container.querySelector('#titulo') as HTMLInputElement
      const ubicacion = app.container.querySelector('#ubicacion') as HTMLInputElement
      const form = app.container.querySelector('form.actividad-registro-form') as HTMLFormElement

      await act(async () => {
        setInputValue(fecha, '2026-09-07')
        setInputValue(titulo, 'Control QA')
        setInputValue(ubicacion, 'Sector A')
        form.requestSubmit()
      })

      expect(actividadesApi.registrarActividad).toHaveBeenCalledTimes(1)
      expect(app.container.innerHTML).toContain('fue registrada correctamente')
      expect(app.container.innerHTML).toContain('registro #99')
    } finally {
      await app.cleanup()
    }
  })

  it('formulario vacío muestra validaciones locales sin llamar al backend', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('TOMA_PRESION'),
    )

    try {
      const submit = app.container.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement

      await act(async () => {
        submit.click()
      })

      expect(actividadesApi.registrarActividad).not.toHaveBeenCalled()
      expect(app.container.innerHTML).toContain('La fecha de la actividad es obligatoria.')
      expect(app.container.innerHTML).toContain(
        'El título o resumen de la actividad es obligatorio.',
      )
    } finally {
      await app.cleanup()
    }
  })

  it('corrige datos tras error del backend y reenvía con éxito', async () => {
    vi.mocked(actividadesApi.registrarActividad)
      .mockRejectedValueOnce(new Error('HTTP 400: La fecha de la actividad no puede ser futura'))
      .mockResolvedValueOnce(actividadRegistradaMock)

    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('VISITA_CAMPO'),
    )

    try {
      const fecha = app.container.querySelector('#fechaActividad') as HTMLInputElement
      const titulo = app.container.querySelector('#titulo') as HTMLInputElement
      const form = app.container.querySelector('form.actividad-registro-form') as HTMLFormElement

      await act(async () => {
        setInputValue(fecha, '2099-01-01')
        setInputValue(titulo, 'Visita QA')
        form.requestSubmit()
      })

      expect(app.container.innerHTML).toContain('futura')
      expect((app.container.querySelector('#titulo') as HTMLInputElement).value).toBe('Visita QA')

      await act(async () => {
        setInputValue(fecha, '2026-09-07')
        form.requestSubmit()
      })

      expect(actividadesApi.registrarActividad).toHaveBeenCalledTimes(2)
      expect(app.container.querySelector('[data-testid="actividad-registro-exito"]')).not.toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('evita doble registro por doble envío mientras está en curso', async () => {
    let resolvePending: (() => void) | undefined
    vi.mocked(actividadesApi.registrarActividad).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePending = () => resolve(actividadRegistradaMock)
        }),
    )

    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_OPERATIVO'),
    )

    try {
      const fecha = app.container.querySelector('#fechaActividad') as HTMLInputElement
      const titulo = app.container.querySelector('#titulo') as HTMLInputElement
      const submit = app.container.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement
      const form = app.container.querySelector('form.actividad-registro-form') as HTMLFormElement

      await act(async () => {
        setInputValue(fecha, '2026-09-07')
        setInputValue(titulo, 'Operativo QA')
        form.requestSubmit()
      })

      expect(app.container.innerHTML).toContain('Registrando…')
      expect(submit.disabled).toBe(true)

      await act(async () => {
        submit.click()
        form.requestSubmit()
      })

      expect(actividadesApi.registrarActividad).toHaveBeenCalledTimes(1)

      await act(async () => {
        resolvePending?.()
      })
    } finally {
      await app.cleanup()
    }
  })

  it('expone cancelar y volver a selección de tipo', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_CLOROS'),
    )

    try {
      expect(app.container.innerHTML).toContain('href="/admin/actividades/nueva"')
      expect(app.container.innerHTML).toContain('Cancelar')
      expect(app.container.innerHTML).toContain('Cambiar tipo de actividad')
    } finally {
      await app.cleanup()
    }
  })

  it('sin sesión redirige a login; Abonado recibe acceso denegado', async () => {
    const sinSesion = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_FUGAS'),
    )
    try {
      expect(sinSesion.currentPath()).toBe(LOGIN_ROUTE_PATH)
    } finally {
      await sinSesion.cleanup()
    }

    setAuthSession({
      accessToken: 'token-abonado',
      user: { id: '1', role: 'Abonado', name: 'Ana', lastName: 'Pérez' },
    })
    const abonado = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_FUGAS'),
    )
    try {
      expect(abonado.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    } finally {
      await abonado.cleanup()
    }
  })
})
