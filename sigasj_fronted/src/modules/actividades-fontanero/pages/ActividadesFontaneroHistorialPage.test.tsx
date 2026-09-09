import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from '../../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import * as actividadesApi from '../services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'

const HISTORIAL_PATH = '/admin/actividades/historial'

const actividadHistorial = (
  overrides: Partial<ActividadFontaneroRegistrada> = {},
) =>
  ({
    id: 77,
    tipoActividadId: 1,
    tipoActividadNombre: 'Control de Fugas',
    fechaActividad: '2026-03-01',
    titulo: 'Revisión sector sur',
    descripcion: 'Sin novedad',
    ubicacion: 'Barrio Centro',
    observaciones: null,
    estado: 'APROBADA',
    observacionCorreccion: null,
    datosEspecificos: null,
    createdAt: '2026-03-02T10:00:00.000Z',
    updatedAt: '2026-03-02T12:00:00.000Z',
    ...overrides,
  }) satisfies ActividadFontaneroRegistrada

const setInputValue = (input: HTMLInputElement, value: string) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
    input,
    value,
  )
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const waitForUpdates = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe('ActividadesFontaneroHistorialPage', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  it('muestra listado del historial con enlace al detalle', async () => {
    loginAsRole('Fontanero')
    vi.spyOn(actividadesApi, 'getHistorialActividades').mockResolvedValue({
      data: [actividadHistorial()],
      total: 1,
    })

    const app = await mountAppRoutes(HISTORIAL_PATH)

    try {
      expect(app.currentPath()).toBe(HISTORIAL_PATH)
      expect(app.container.innerHTML).toContain('Historial de actividades')
      expect(app.container.innerHTML).toContain('Revisión sector sur')
      expect(app.container.innerHTML).toContain(
        'data-testid="ver-historial-actividad-77"',
      )
      expect(app.container.innerHTML).toContain(
        'href="/admin/actividades/historial/77"',
      )
    } finally {
      await app.cleanup()
    }
  })

  it('muestra estado vacío cuando no hay actividades en historial', async () => {
    loginAsRole('Fontanero')
    vi.spyOn(actividadesApi, 'getHistorialActividades').mockResolvedValue({
      data: [],
      total: 0,
    })

    const app = await mountAppRoutes(HISTORIAL_PATH)

    try {
      expect(app.container.innerHTML).toContain(
        'Sin actividades en el historial',
      )
      expect(app.container.innerHTML).toContain(
        'data-testid="historial-lista-vacia"',
      )
    } finally {
      await app.cleanup()
    }
  })

  it('envía periodo y paginación al Back-end al consultar', async () => {
    loginAsRole('Fontanero')
    const getHistorial = vi
      .spyOn(actividadesApi, 'getHistorialActividades')
      .mockResolvedValue({ data: [actividadHistorial()], total: 1 })

    const app = await mountAppRoutes(HISTORIAL_PATH)

    try {
      await waitForUpdates()
      const inicio = app.container.querySelector(
        '[data-testid="historial-fecha-inicio"]',
      ) as HTMLInputElement
      const fin = app.container.querySelector(
        '[data-testid="historial-fecha-fin"]',
      ) as HTMLInputElement

      await act(async () => {
        setInputValue(inicio, '2026-09-01')
        setInputValue(fin, '2026-09-30')
      })

      await act(async () => {
        app.container.querySelector('form')?.requestSubmit()
        await Promise.resolve()
      })

      expect(getHistorial).toHaveBeenCalledWith({
        fechaInicio: '2026-09-01',
        fechaFin: '2026-09-30',
        page: 1,
        limit: 10,
      })
    } finally {
      await app.cleanup()
    }
  })

  it('pagina con el total del servidor, no recortando el data local', async () => {
    loginAsRole('Fontanero')
    const getHistorial = vi
      .spyOn(actividadesApi, 'getHistorialActividades')
      .mockResolvedValueOnce({
        data: [actividadHistorial({ id: 1, titulo: 'Página 1' })],
        total: 25,
      })
      .mockResolvedValueOnce({
        data: [actividadHistorial({ id: 2, titulo: 'Página 2' })],
        total: 25,
      })

    const app = await mountAppRoutes(HISTORIAL_PATH)

    try {
      await waitForUpdates()
      expect(app.container.textContent).toContain('25 actividades')
      expect(app.container.textContent).toContain('Página 1 de 3')
      expect(app.container.textContent).toContain('Página 1')

      const siguiente = app.container.querySelector(
        '[data-testid="historial-pagina-siguiente"]',
      ) as HTMLButtonElement
      expect(siguiente).not.toBeNull()

      await act(async () => {
        siguiente.click()
        await Promise.resolve()
        await Promise.resolve()
        await Promise.resolve()
      })

      await waitForUpdates()
      await waitForUpdates()

      expect(getHistorial).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
      })
      expect(app.container.textContent).toContain('Página 2')
    } finally {
      await app.cleanup()
    }
  })

  it('no consulta si el rango de fechas es inválido', async () => {
    loginAsRole('Fontanero')
    const getHistorial = vi
      .spyOn(actividadesApi, 'getHistorialActividades')
      .mockResolvedValue({ data: [], total: 0 })

    const app = await mountAppRoutes(HISTORIAL_PATH)

    try {
      await waitForUpdates()
      const inicio = app.container.querySelector(
        '[data-testid="historial-fecha-inicio"]',
      ) as HTMLInputElement
      const fin = app.container.querySelector(
        '[data-testid="historial-fecha-fin"]',
      ) as HTMLInputElement

      await act(async () => {
        setInputValue(inicio, '2026-09-30')
        setInputValue(fin, '2026-09-01')
      })

      const callsBefore = getHistorial.mock.calls.length

      await act(async () => {
        app.container.querySelector('form')?.requestSubmit()
        await Promise.resolve()
      })

      expect(app.container.textContent).toContain(
        'La fecha inicial no puede ser posterior a la fecha final.',
      )
      expect(getHistorial.mock.calls.length).toBe(callsBefore)
    } finally {
      await app.cleanup()
    }
  })

  it('muestra detalle de actividad del historial', async () => {
    loginAsRole('Fontanero')
    vi.spyOn(actividadesApi, 'getActividadDetalle').mockResolvedValue(
      actividadHistorial({ id: 88, titulo: 'Detalle historial' }),
    )

    const app = await mountAppRoutes('/admin/actividades/historial/88')

    try {
      expect(app.currentPath()).toBe('/admin/actividades/historial/88')
      expect(app.container.innerHTML).toContain('Detalle de actividad')
      expect(app.container.innerHTML).toContain('Detalle historial')
      expect(app.container.innerHTML).toContain('Barrio Centro')
    } finally {
      await app.cleanup()
    }
  })

  it('muestra vacío diferenciado cuando hay filtro de periodo sin resultados', async () => {
    loginAsRole('Fontanero')
    vi.spyOn(actividadesApi, 'getHistorialActividades').mockResolvedValue({
      data: [],
      total: 0,
    })

    const app = await mountAppRoutes(HISTORIAL_PATH)

    try {
      await waitForUpdates()
      const inicio = app.container.querySelector(
        '[data-testid="historial-fecha-inicio"]',
      ) as HTMLInputElement
      const fin = app.container.querySelector(
        '[data-testid="historial-fecha-fin"]',
      ) as HTMLInputElement

      await act(async () => {
        setInputValue(inicio, '2026-09-01')
        setInputValue(fin, '2026-09-30')
        app.container.querySelector('form')?.requestSubmit()
        await Promise.resolve()
        await Promise.resolve()
      })

      expect(app.container.textContent).toContain(
        'No hay actividades en el periodo seleccionado',
      )
    } finally {
      await app.cleanup()
    }
  })

  it('muestra mensaje del backend ante HTTP 400', async () => {
    loginAsRole('Fontanero')
    vi.spyOn(actividadesApi, 'getHistorialActividades').mockRejectedValue(
      new Error('HTTP 400: fechaInicio no puede ser posterior a fechaFin'),
    )

    const app = await mountAppRoutes(HISTORIAL_PATH)

    try {
      await waitForUpdates()
      expect(app.container.textContent).toContain(
        'fechaInicio no puede ser posterior a fechaFin',
      )
    } finally {
      await app.cleanup()
    }
  })
})
