import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from '../../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import * as actividadesApi from '../services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'

const CORRECCIONES_PATH = '/admin/actividades/correcciones'

const actividadPendiente = (overrides: Partial<ActividadFontaneroRegistrada> = {}) =>
  ({
    id: 42,
    tipoActividadId: 1,
    tipoActividadNombre: 'Control de Fugas',
    fechaActividad: '2026-03-01',
    titulo: 'Fuga sector norte',
    descripcion: 'Se detectó humedad',
    ubicacion: 'Barrio Los Ángeles',
    observaciones: null,
    estado: 'REQUIERE_CORRECCION',
    observacionCorreccion: 'Indique la ubicación exacta de la fuga.',
    datosEspecificos: { ubicacionFuga: 'Tubería principal' },
    createdAt: '2026-03-02T10:00:00.000Z',
    updatedAt: '2026-03-02T12:00:00.000Z',
    ...overrides,
  }) satisfies ActividadFontaneroRegistrada

describe('ActividadesFontaneroCorreccionesPage', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  it('muestra listado de correcciones pendientes con motivo y acción', async () => {
    loginAsRole('Fontanero')
    vi.spyOn(actividadesApi, 'getCorreccionesPendientes').mockResolvedValue({
      data: [actividadPendiente()],
      total: 1,
    })

    const app = await mountAppRoutes(CORRECCIONES_PATH)

    try {
      expect(app.currentPath()).toBe(CORRECCIONES_PATH)
      expect(app.container.innerHTML).toContain('Correcciones pendientes')
      expect(app.container.innerHTML).toContain('Fuga sector norte')
      expect(app.container.innerHTML).toContain('Indique la ubicación exacta de la fuga.')
      expect(app.container.innerHTML).toContain('Corregir actividad')
      expect(app.container.innerHTML).toContain('data-testid="corregir-actividad-42"')
    } finally {
      await app.cleanup()
    }
  })

  it('muestra estado vacío cuando no hay correcciones', async () => {
    loginAsRole('Fontanero')
    vi.spyOn(actividadesApi, 'getCorreccionesPendientes').mockResolvedValue({
      data: [],
      total: 0,
    })

    const app = await mountAppRoutes(CORRECCIONES_PATH)

    try {
      expect(app.container.innerHTML).toContain('Sin correcciones pendientes')
      expect(app.container.innerHTML).toContain('data-testid="correcciones-lista-vacia"')
    } finally {
      await app.cleanup()
    }
  })
})
