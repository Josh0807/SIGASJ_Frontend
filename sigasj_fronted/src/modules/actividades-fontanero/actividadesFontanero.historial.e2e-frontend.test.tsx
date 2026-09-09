import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAuthSession } from '../auth/utils/authStorage'
import { mountAppRoutes } from '../../test/render-app-routes'
import { ACTIVIDADES_FONTANERO_PATHS } from './actividadesFontaneroPaths'
import * as actividadesApi from './services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from './types/actividadFontaneroApi'

const login = () =>
  setAuthSession({
    accessToken: 'jwt-fontanero',
    user: { id: '12', role: 'Fontanero', name: 'Carlos' },
  })

const historialItem = (
  overrides: Partial<ActividadFontaneroRegistrada> = {},
): ActividadFontaneroRegistrada => ({
  id: 41,
  tipoActividadId: 1,
  tipoActividadNombre: 'Control de Fugas',
  fechaActividad: '2026-09-10',
  titulo: 'Fuga sector norte',
  descripcion: 'Reparación concluida',
  ubicacion: 'San Juan',
  observaciones: null,
  estado: 'APROBADA',
  observacionCorreccion: null,
  datosEspecificos: null,
  createdAt: '2026-09-10T08:00:00.000Z',
  updatedAt: '2026-09-12T14:00:00.000Z',
  ...overrides,
})

const setDate = (input: HTMLInputElement, value: string) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
    input,
    value,
  )
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('PBI 7.7 — historial del fontanero (integración frontend)', () => {
  beforeEach(() => {
    login()
    vi.restoreAllMocks()
  })

  it('consulta, pagina y abre detalle usando el contrato del Back-end', async () => {
    const getHistorial = vi
      .spyOn(actividadesApi, 'getHistorialActividades')
      .mockImplementation(async (filters) => {
        if (filters.page === 2) {
          return {
            data: [historialItem({ id: 42, titulo: 'Jornada 11 sept' })],
            total: 11,
          }
        }
        return {
          data: [historialItem({ id: 41, titulo: 'Jornada 10 sept' })],
          total: 11,
        }
      })

    vi.spyOn(actividadesApi, 'getActividadDetalle').mockResolvedValue(
      historialItem({ id: 42, titulo: 'Jornada 11 sept', estado: 'CORREGIDA' }),
    )

    const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.historial)

    try {
      await act(async () => {
        await Promise.resolve()
        await Promise.resolve()
      })

      const inicio = app.container.querySelector(
        '[data-testid="historial-fecha-inicio"]',
      ) as HTMLInputElement
      const fin = app.container.querySelector(
        '[data-testid="historial-fecha-fin"]',
      ) as HTMLInputElement

      await act(async () => {
        setDate(inicio, '2026-09-01')
        setDate(fin, '2026-09-30')
        app.container.querySelector('form')?.requestSubmit()
        await Promise.resolve()
      })

      expect(getHistorial).toHaveBeenCalledWith({
        fechaInicio: '2026-09-01',
        fechaFin: '2026-09-30',
        page: 1,
        limit: 10,
      })
      expect(app.container.textContent).toContain('11 actividades')
      expect(app.container.textContent).toContain('Página 1 de 2')

      await act(async () => {
        ;(
          app.container.querySelector(
            '[data-testid="historial-pagina-siguiente"]',
          ) as HTMLButtonElement
        ).click()
        await Promise.resolve()
        await Promise.resolve()
      })

      expect(getHistorial).toHaveBeenLastCalledWith({
        fechaInicio: '2026-09-01',
        fechaFin: '2026-09-30',
        page: 2,
        limit: 10,
      })
      expect(app.container.textContent).toContain('Jornada 11 sept')

      await act(async () => {
        ;(
          app.container.querySelector(
            '[data-testid="ver-historial-actividad-42"]',
          ) as HTMLAnchorElement
        ).click()
        await Promise.resolve()
        await Promise.resolve()
      })

      expect(app.currentPath()).toBe(
        ACTIVIDADES_FONTANERO_PATHS.historialDetalle(42),
      )
      expect(app.container.textContent).toContain('Detalle de actividad')
      expect(app.container.textContent).toContain('Jornada 11 sept')
      expect(actividadesApi.getActividadDetalle).toHaveBeenCalledWith(42)
    } finally {
      await app.cleanup()
    }
  })
})
