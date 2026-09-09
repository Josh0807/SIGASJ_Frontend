import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAuthSession } from '../../modules/auth/utils/authStorage'
import { mountAppRoutes } from '../../test/render-app-routes'
import { ACTIVIDADES_FONTANERO_PATHS } from './actividadesFontaneroPaths'
import * as actividadesApi from './services/actividadesFontaneroApi'
import { respuestaTiposActividad, TIPOS_ACTIVIDAD_BACKEND } from './test/tiposActividadFixture'
import type { ActividadFontaneroRegistrada } from './types/actividadFontaneroApi'

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

const actividadPendiente = (): ActividadFontaneroRegistrada => ({
  id: 55,
  tipoActividadId: TIPOS_ACTIVIDAD_BACKEND[1].id,
  tipoActividadNombre: 'Toma de presión',
  fechaActividad: '2026-09-01',
  titulo: 'Medición sector norte',
  descripcion: 'Lectura inicial',
  ubicacion: 'Planta',
  observaciones: null,
  estado: 'REQUIERE_CORRECCION',
  observacionCorreccion: 'Confirme la presión medida.',
  datosEspecificos: { presionMedida: 40 },
  createdAt: '2026-09-02T10:00:00.000Z',
  updatedAt: '2026-09-02T12:00:00.000Z',
})

const setInputValue = (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const prototype =
    input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

/**
 * QA #937 — flujo UI de corrección, reenvío y mensajes de validación.
 */
describe('QA #937 — corrección y reenvío (Frontend Fontanero)', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
    vi.spyOn(actividadesApi, 'getTiposActividadFontanero').mockResolvedValue(respuestaTiposActividad)
    vi.spyOn(actividadesApi, 'getCorreccionesPendientes').mockResolvedValue({
      data: [actividadPendiente()],
      total: 1,
    })
  })

  it('flujo: listado → corregir → reenvío exitoso', async () => {
    const pendiente = actividadPendiente()
    vi.spyOn(actividadesApi, 'getActividadDetalle').mockResolvedValue(pendiente)
    vi.spyOn(actividadesApi, 'corregirActividad').mockResolvedValue({
      ...pendiente,
      titulo: 'Medición corregida',
      estado: 'CORREGIDA',
      observacionCorreccion: null,
      datosEspecificos: { presionMedida: 44 },
    })

    loginAsFontanero()
    const listado = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.correcciones)

    try {
      expect(listado.container.innerHTML).toContain('Medición sector norte')
      expect(listado.container.innerHTML).toContain('Confirme la presión medida.')
    } finally {
      await listado.cleanup()
    }

    const corregir = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.corregirActividad(pendiente.id),
    )

    try {
      expect(corregir.container.innerHTML).toContain('Corregir: Toma de presión')
      expect(corregir.container.innerHTML).toContain('data-testid="correccion-motivo-banner"')

      const titulo = corregir.container.querySelector('#titulo') as HTMLInputElement
      const presionMedida = corregir.container.querySelector('#presionMedida') as HTMLInputElement
      const form = corregir.container.querySelector('form.actividad-registro-form') as HTMLFormElement

      expect(titulo.value).toBe('Medición sector norte')
      expect(presionMedida.value).toBe('40')

      await act(async () => {
        setInputValue(titulo, 'Medición corregida')
        setInputValue(presionMedida, '44')
        form.requestSubmit()
      })

      expect(actividadesApi.corregirActividad).toHaveBeenCalledTimes(1)
      expect(corregir.container.innerHTML).toContain(
        'La información fue actualizada correctamente',
      )
    } finally {
      await corregir.cleanup()
    }
  })

  it('muestra validación local al reenviar corrección incompleta', async () => {
    const pendiente = actividadPendiente()
    vi.spyOn(actividadesApi, 'getActividadDetalle').mockResolvedValue(pendiente)
    vi.spyOn(actividadesApi, 'corregirActividad')

    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.corregirActividad(pendiente.id),
    )

    try {
      const titulo = app.container.querySelector('#titulo') as HTMLInputElement
      const presionMedida = app.container.querySelector('#presionMedida') as HTMLInputElement
      const form = app.container.querySelector('form.actividad-registro-form') as HTMLFormElement

      await act(async () => {
        setInputValue(titulo, '   ')
        setInputValue(presionMedida, '')
        form.requestSubmit()
      })

      expect(actividadesApi.corregirActividad).not.toHaveBeenCalled()
      expect(app.container.innerHTML).toContain('data-testid="formulario-errores-resumen"')
      expect(app.container.innerHTML).toContain('Este campo es obligatorio.')
    } finally {
      await app.cleanup()
    }
  })

  it('conserva datos y muestra error del backend al reenviar corrección inválida', async () => {
    const pendiente = actividadPendiente()
    vi.spyOn(actividadesApi, 'getActividadDetalle').mockResolvedValue(pendiente)
    vi.spyOn(actividadesApi, 'corregirActividad').mockRejectedValue(
      new Error('HTTP 400: La presión medida es obligatoria y debe ser un valor numérico positivo'),
    )

    loginAsFontanero()
    const app = await mountAppRoutes(
      ACTIVIDADES_FONTANERO_PATHS.corregirActividad(pendiente.id),
    )

    try {
      const form = app.container.querySelector('form.actividad-registro-form') as HTMLFormElement

      await act(async () => {
        form.requestSubmit()
      })

      expect(actividadesApi.corregirActividad).toHaveBeenCalledTimes(1)
      expect(app.container.innerHTML).toContain('presión')
      expect((app.container.querySelector('#titulo') as HTMLInputElement).value).toBe(
        'Medición sector norte',
      )
    } finally {
      await app.cleanup()
    }
  })
})
