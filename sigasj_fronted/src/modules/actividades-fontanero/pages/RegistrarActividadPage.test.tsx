import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAuthSession } from '../../../modules/auth/utils/authStorage'
import { mountAppRoutes } from '../../../test/render-app-routes'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { TIPOS_ACTIVIDAD_BACKEND, respuestaTiposActividad } from '../test/tiposActividadFixture'
import * as actividadesApi from '../services/actividadesFontaneroApi'

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

describe('formulario de registro de actividad (#390 / #932)', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
    vi.spyOn(actividadesApi, 'getTiposActividadFontanero').mockResolvedValue(respuestaTiposActividad)
    vi.spyOn(actividadesApi, 'registrarActividad').mockResolvedValue({
      id: 42,
      tipoActividadId: 3,
      tipoActividadNombre: 'Visita de Campo',
      fechaActividad: '2026-09-07',
      titulo: 'Visita programada',
      descripcion: null,
      ubicacion: null,
      observaciones: null,
      estado: 'REPORTADA',
      observacionCorreccion: null,
      createdAt: '2026-09-07T00:00:00.000Z',
      updatedAt: '2026-09-07T00:00:00.000Z',
    })
  })

  it('muestra los seis tipos de actividad en la pantalla de selección', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.nueva)

    try {
      expect(app.currentPath()).toBe(ACTIVIDADES_FONTANERO_PATHS.nueva)
      expect(app.container.innerHTML).toContain('Seleccione el tipo de actividad')

      for (const tipo of TIPOS_ACTIVIDAD_BACKEND) {
        expect(app.container.innerHTML).toContain(tipo.nombre)
        expect(
          app.container.querySelector(`[data-testid="tipo-actividad-${tipo.codigo}"]`),
        ).not.toBeNull()
      }
    } finally {
      await app.cleanup()
    }
  })

  it('carga el formulario específico al elegir un tipo', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_FUGAS'),
    )

    try {
      expect(app.currentPath()).toBe(
        ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_FUGAS'),
      )
      expect(app.container.innerHTML).toContain('Registrar: Control de Fugas')
      expect(app.container.innerHTML).toContain('Formulario: Control de Fugas')
    } finally {
      await app.cleanup()
    }
  })

  it('redirige a selección cuando el código de tipo es inválido', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('TIPO_INEXISTENTE'),
    )

    try {
      expect(app.currentPath()).toBe(ACTIVIDADES_FONTANERO_PATHS.nueva)
    } finally {
      await app.cleanup()
    }
  })

  it('alias /registrar redirige a /nueva', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.registrar)

    try {
      expect(app.currentPath()).toBe(ACTIVIDADES_FONTANERO_PATHS.nueva)
    } finally {
      await app.cleanup()
    }
  })

  it('valida campos obligatorios antes de enviar', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('TOMA_PRESION'),
    )

    try {
      const submit = app.container.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement | null
      expect(submit).not.toBeNull()

      await act(async () => {
        submit?.click()
      })

      expect(app.container.innerHTML).toContain('Este campo es obligatorio.')
      expect(app.container.innerHTML).toContain('data-testid="formulario-errores-resumen"')
    } finally {
      await app.cleanup()
    }
  })

  const setInputValue = (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
    const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
    setter?.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }

  it('muestra éxito tras registrar en el backend', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('VISITA_CAMPO'),
    )

    try {
      const fecha = app.container.querySelector('#fechaActividad') as HTMLInputElement
      const titulo = app.container.querySelector('#titulo') as HTMLInputElement
      const resultadoVisita = app.container.querySelector('#resultadoVisita') as HTMLTextAreaElement
      const form = app.container.querySelector('form.actividad-registro-form') as HTMLFormElement

      await act(async () => {
        setInputValue(fecha, '2026-09-07')
        setInputValue(titulo, 'Visita programada')
        setInputValue(resultadoVisita, 'Visita completada')
        form.requestSubmit()
      })

      expect(actividadesApi.registrarActividad).toHaveBeenCalledTimes(1)
      expect(app.container.querySelector('[data-testid="actividad-registro-exito"]')).not.toBeNull()
      expect(app.container.innerHTML).toContain('Actividad registrada correctamente')
      expect(app.container.innerHTML).toContain('registro #42')
    } finally {
      await app.cleanup()
    }
  })

  it('muestra errores del backend y conserva los datos ingresados', async () => {
    vi.mocked(actividadesApi.registrarActividad).mockRejectedValueOnce(
      new Error('HTTP 400: La fecha de la actividad no puede ser futura'),
    )
    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_FUGAS'),
    )

    try {
      const fecha = app.container.querySelector('#fechaActividad') as HTMLInputElement
      const titulo = app.container.querySelector('#titulo') as HTMLInputElement
      const ubicacionFuga = app.container.querySelector('#ubicacionFuga') as HTMLInputElement
      const form = app.container.querySelector('form.actividad-registro-form') as HTMLFormElement

      await act(async () => {
        setInputValue(fecha, '2099-01-01')
        setInputValue(titulo, 'Control pendiente')
        setInputValue(ubicacionFuga, 'Sector norte')
        form.requestSubmit()
      })

      expect(app.container.querySelector('[data-testid="actividad-registro-exito"]')).toBeNull()
      expect(app.container.innerHTML).toContain('futura')
      expect((app.container.querySelector('#titulo') as HTMLInputElement).value).toBe(
        'Control pendiente',
      )
    } finally {
      await app.cleanup()
    }
  })

  it('informa sesión inválida ante HTTP 401', async () => {
    vi.mocked(actividadesApi.registrarActividad).mockRejectedValueOnce(
      new Error('HTTP 401: No autenticado'),
    )
    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('TOMA_PRESION'),
    )

    try {
      const fecha = app.container.querySelector('#fechaActividad') as HTMLInputElement
      const titulo = app.container.querySelector('#titulo') as HTMLInputElement
      const form = app.container.querySelector('form.actividad-registro-form') as HTMLFormElement

      await act(async () => {
        setInputValue(fecha, '2026-09-07')
        setInputValue(titulo, 'Toma sector sur')
        form.requestSubmit()
      })

      expect(app.container.innerHTML).toContain('sesión')
    } finally {
      await app.cleanup()
    }
  })
})
