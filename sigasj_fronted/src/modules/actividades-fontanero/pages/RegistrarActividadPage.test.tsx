import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAuthSession } from '../../../modules/auth/utils/authStorage'
import { mountAppRoutes } from '../../../test/render-app-routes'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { CATALOGO_TIPOS_ACTIVIDAD } from '../types/tipoActividadFontanero'

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

describe('formulario de registro de actividad (#390)', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  it('muestra los seis tipos de actividad en la pantalla de selección', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.nueva)

    try {
      expect(app.currentPath()).toBe(ACTIVIDADES_FONTANERO_PATHS.nueva)
      expect(app.container.innerHTML).toContain('Seleccione el tipo de actividad')

      for (const tipo of CATALOGO_TIPOS_ACTIVIDAD) {
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

      expect(app.container.innerHTML).toContain('La fecha de la actividad es obligatoria.')
      expect(app.container.innerHTML).toContain(
        'El título o resumen de la actividad es obligatorio.',
      )
    } finally {
      await app.cleanup()
    }
  })

  const setInputValue = (input: HTMLInputElement, value: string) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setter?.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }

  it('muestra éxito tras envío válido simulado', async () => {
    vi.useFakeTimers()
    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.registrarTipo('VISITA_CAMPO'),
    )

    try {
      const fecha = app.container.querySelector('#fechaActividad') as HTMLInputElement
      const titulo = app.container.querySelector('#titulo') as HTMLInputElement
      const form = app.container.querySelector('form.actividad-registro-form') as HTMLFormElement

      await act(async () => {
        setInputValue(fecha, '2026-09-07')
        setInputValue(titulo, 'Visita programada')
        form.requestSubmit()
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500)
      })

      expect(app.container.querySelector('[data-testid="actividad-registro-exito"]')).not.toBeNull()
    } finally {
      vi.useRealTimers()
      await app.cleanup()
    }
  })
})
