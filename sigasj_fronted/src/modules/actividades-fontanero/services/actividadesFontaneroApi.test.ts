import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWithAuth } from '../../../services/http/httpClient'
import {
  getReportesAdmin,
  registrarActividad,
  toRegistrarActividadPayloadFromTipo,
  toReportesAdminParams,
} from './actividadesFontaneroApi'
import { TIPOS_ACTIVIDAD_BACKEND } from '../test/tiposActividadFixture'

vi.mock('../../../services/http/httpClient', () => ({
  fetchWithAuth: vi.fn(),
}))

describe('actividadesFontaneroApi — registrarActividad', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('construye payload sin identidad del fontanero', () => {
    const tipo = TIPOS_ACTIVIDAD_BACKEND[0]
    expect(
      toRegistrarActividadPayloadFromTipo(tipo, {
        fechaActividad: '2026-09-07',
        titulo: 'Control sector norte',
        ubicacion: '  Barrio Centro  ',
        observaciones: '   ',
      }),
    ).toEqual({
      tipoActividadId: tipo.id,
      fechaActividad: '2026-09-07',
      titulo: 'Control sector norte',
      ubicacion: 'Barrio Centro',
    })
  })

  it('envía POST autenticado al endpoint del fontanero', async () => {
    const tipo = TIPOS_ACTIVIDAD_BACKEND[2]
    const response = {
      id: 12,
      tipoActividadId: tipo.id,
      tipoActividadNombre: tipo.nombre,
      fechaActividad: '2026-09-07',
      titulo: 'Visita programada',
      descripcion: null,
      ubicacion: null,
      observaciones: 'Sin novedad',
      estado: 'REPORTADA',
      observacionCorreccion: null,
      createdAt: '2026-09-07T00:00:00.000Z',
      updatedAt: '2026-09-07T00:00:00.000Z',
    }

    vi.mocked(fetchWithAuth).mockResolvedValueOnce(response)

    const result = await registrarActividad(tipo, {
      fechaActividad: '2026-09-07',
      titulo: 'Visita programada',
      ubicacion: '',
      observaciones: 'Sin novedad',
    })

    expect(result).toEqual(response)
    expect(fetchWithAuth).toHaveBeenCalledWith('/fontanero/actividades', {
      method: 'POST',
      body: JSON.stringify({
        tipoActividadId: tipo.id,
        fechaActividad: '2026-09-07',
        titulo: 'Visita programada',
        observaciones: 'Sin novedad',
      }),
    })
    expect(JSON.stringify(fetchWithAuth.mock.calls[0][1]?.body ?? '')).not.toContain(
      'fontaneroId',
    )
  })
})

describe('actividadesFontaneroApi — getReportesAdmin', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('omite params vacíos', () => {
    expect(
      toReportesAdminParams({
        fechaInicio: '',
        fechaFin: '  ',
        fontaneroId: undefined,
        tipoActividadId: 0,
      }),
    ).toEqual({})
  })

  it('consulta GET admin/actividades/reportes con filtros', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce({
      total: 1,
      porEstado: { REPORTADA: 1 },
      porTipo: [],
      porFontanero: [],
      actividades: [],
    })

    await getReportesAdmin({
      fechaInicio: '2026-09-01',
      fechaFin: '2026-09-30',
      fontaneroId: 'fontanero-1',
      tipoActividadId: 3,
    })

    expect(fetchWithAuth).toHaveBeenCalledWith('/admin/actividades/reportes', {
      params: {
        fechaInicio: '2026-09-01',
        fechaFin: '2026-09-30',
        fontaneroId: 'fontanero-1',
        tipoActividadId: 3,
      },
    })
  })
})
