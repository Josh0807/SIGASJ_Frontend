import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from '../../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import * as actividadesApi from '../services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'

const PATH = '/admin/actividades/mis-actividades'

const actividad = (id: number, overrides: Partial<ActividadFontaneroRegistrada> = {}) =>
  ({
    id,
    tipoActividadId: 3,
    tipoActividadNombre: 'Visita de Campo',
    fechaActividad: '2026-03-01',
    titulo: `Actividad ${id}`,
    descripcion: 'Descripción de prueba',
    ubicacion: 'San Juan',
    observaciones: null,
    estado: 'REPORTADA',
    observacionCorreccion: null,
    datosEspecificos: null,
    createdAt: '2026-03-02T10:00:00.000Z',
    updatedAt: '2026-03-02T12:00:00.000Z',
    ...overrides,
  }) satisfies ActividadFontaneroRegistrada

describe('MisActividadesPage', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  it('lista las actividades registradas con su estado', async () => {
    loginAsRole('Fontanero')
    vi.spyOn(actividadesApi, 'getMisActividades').mockResolvedValue({
      data: [actividad(1), actividad(2, { estado: 'REQUIERE_CORRECCION', observacionCorreccion: 'Falta ubicación' })],
      total: 2,
    })
    const app = await mountAppRoutes(PATH)
    try {
      const html = app.container.innerHTML
      expect(html).toContain('Mis actividades')
      expect(html).toContain('Actividad 1')
      expect(html).toContain('Actividad 2')
      expect(html).toContain('Reportada')
      expect(html).toContain('Requiere corrección')
      expect(html).toContain('Falta ubicación')
      expect(html).toContain('Corregir actividad')
    } finally {
      await app.cleanup()
    }
  })

  it('muestra estado vacío cuando no hay actividades', async () => {
    loginAsRole('Fontanero')
    vi.spyOn(actividadesApi, 'getMisActividades').mockResolvedValue({ data: [], total: 0 })
    const app = await mountAppRoutes(PATH)
    try {
      expect(app.container.innerHTML).toContain('Todavía no ha registrado actividades.')
    } finally {
      await app.cleanup()
    }
  })

  it('muestra error con opción de reintentar', async () => {
    loginAsRole('Fontanero')
    vi.spyOn(actividadesApi, 'getMisActividades').mockRejectedValue(new Error('HTTP 500'))
    const app = await mountAppRoutes(PATH)
    try {
      expect(app.container.innerHTML).toContain('No se pudieron consultar sus actividades')
      expect(app.container.innerHTML).toContain('Reintentar')
    } finally {
      await app.cleanup()
    }
  })

  it('filtra por estado y pagina de 10 en 10', async () => {
    loginAsRole('Fontanero')
    const muchas = Array.from({ length: 12 }, (_, i) => actividad(i + 1))
    muchas.push(actividad(99, { estado: 'REVISADA', titulo: 'Ya revisada' }))
    vi.spyOn(actividadesApi, 'getMisActividades').mockResolvedValue({ data: muchas, total: 13 })
    const app = await mountAppRoutes(PATH)
    try {
      expect(app.container.innerHTML).toContain('Página 1 de 2')
      expect(app.container.querySelectorAll('[data-testid="mis-actividades-lista"] > li')).toHaveLength(10)

      const select = app.container.querySelector<HTMLSelectElement>('[data-testid="mis-actividades-estado"]')!
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set?.call(select, 'REVISADA')
        select.dispatchEvent(new Event('change', { bubbles: true }))
      })
      expect(app.container.querySelectorAll('[data-testid="mis-actividades-lista"] > li')).toHaveLength(1)
      expect(app.container.innerHTML).toContain('Ya revisada')
      expect(app.container.innerHTML).not.toContain('Página 1 de')
    } finally {
      await app.cleanup()
    }
  })
})
