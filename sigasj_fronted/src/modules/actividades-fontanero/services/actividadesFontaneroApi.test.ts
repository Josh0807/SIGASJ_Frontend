import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWithAuth } from '../../../services/http/httpClient'
import {
  getHistorialActividades,
  getActividadAdminDetalle,
  getActividadesAdmin,
  getReportesAdmin,
  revisarActividadAdmin,
  solicitarCorreccionAdmin,
  registrarActividad,
  toHistorialActividadesParams,
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

describe('actividadesFontaneroApi — revisión administrativa', () => {
  beforeEach(() => vi.mocked(fetchWithAuth).mockReset())

  it('envía listado con filtros y conserva paginación del backend', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({ data: [], total: 25, page: 2, limit: 10, totalPages: 3 })
    const result = await getActividadesAdmin({ estado: 'REPORTADA', page: 2, limit: 10 })
    expect(fetchWithAuth).toHaveBeenCalledWith('/admin/actividades', {
      params: { estado: 'REPORTADA', page: 2, limit: 10 },
    })
    expect(result.totalPages).toBe(3)
  })

  it('consulta el detalle por la ruta recomendada y normaliza documentos', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue(actividadApiFixture())
    const result = await getActividadAdminDetalle(12)
    expect(fetchWithAuth).toHaveBeenCalledWith('/actividades-fontanero/12', undefined)
    expect(result.documentos).toHaveLength(1)
  })

  it('marca como revisada sin modificar datos desde el cliente', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue(actividadApiFixture({ estado: 'REVISADA' }))
    await revisarActividadAdmin(12)
    expect(fetchWithAuth).toHaveBeenCalledWith('/admin/actividades-fontanero/12/revisar', {
      method: 'PATCH',
      body: undefined,
    })
  })

  it('solicita corrección con observación obligatoria', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue(
      actividadApiFixture({ estado: 'REQUIERE_CORRECCION' }),
    )
    await solicitarCorreccionAdmin(12, '  Complete evidencia  ')
    expect(fetchWithAuth).toHaveBeenCalledWith(
      '/admin/actividades/12/solicitar-correccion',
      {
        method: 'PATCH',
        body: JSON.stringify({ observacion: 'Complete evidencia' }),
      },
    )
  })
})

const actividadApiFixture = (overrides: Record<string, unknown> = {}) => ({
  id: 12,
  titulo: 'Control de Fugas',
  tipoActividadId: 1,
  tipoActividadNombre: 'Control de Fugas',
  fechaActividad: '2026-08-23',
  estado: 'REPORTADA',
  documentos: [{ id: 5, nombreOriginal: 'evidencia.jpg' }],
  ...overrides,
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

describe('actividadesFontaneroApi — getHistorialActividades', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('omite params vacíos en historial', () => {
    expect(
      toHistorialActividadesParams({
        fechaInicio: '',
        fechaFin: '  ',
        page: 0,
        limit: undefined,
      }),
    ).toEqual({})
  })

  it('consulta GET fontanero/actividades/historial con filtros', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce({
      data: [],
      total: 0,
    })

    await getHistorialActividades({
      fechaInicio: '2026-09-01',
      fechaFin: '2026-09-30',
      page: 2,
      limit: 10,
    })

    expect(fetchWithAuth).toHaveBeenCalledWith('/fontanero/actividades/historial', {
      params: {
        fechaInicio: '2026-09-01',
        fechaFin: '2026-09-30',
        page: 2,
        limit: 10,
      },
    })
  })
})
