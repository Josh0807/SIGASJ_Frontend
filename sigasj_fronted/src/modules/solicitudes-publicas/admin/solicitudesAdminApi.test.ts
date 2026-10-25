import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cambiarEstadoSolicitudAdmin,
  getHistorialSolicitudAdmin,
  getSolicitudAdmin,
  getSolicitudAdminDetail,
  getSolicitudDocumentoAdmin,
  getSolicitudesAdmin,
  normalizeSolicitudAdminDetail,
  normalizeSolicitudesAdminList,
  solicitudesAdminParams,
} from './solicitudesAdminApi'

describe('solicitudesAdminApi', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('construye filtros paginados sin enviar valores vacíos', () => {
    expect(solicitudesAdminParams({ search: ' SOL-2026 ', estado: 'PENDIENTE', tipo: '', page: 2 })).toEqual({
      search: 'SOL-2026', estado: 'PENDIENTE', tipo: undefined, page: 2, limit: 10,
    })
  })

  it('normaliza respuestas paginadas del backend', () => {
    const row = { id: 15, codigoSeguimiento: 'SOL-2026-X8K91B', estado: 'PENDIENTE', fechaIngreso: '2026-10-24T18:30:00.000Z' }
    expect(normalizeSolicitudesAdminList({ items: [row], meta: { total: 21, page: 2, limit: 10, totalPages: 3 } })).toEqual({ data: [row], total: 21, page: 2, limit: 10, totalPages: 3 })
  })

  it('recupera los datos específicos desde la relación directa del formulario', () => {
    const normalized = normalizeSolicitudAdminDetail({
      id: 15, codigoSeguimiento: 'SOL-2026-X8K91B', estado: 'PENDIENTE', fechaIngreso: '2026-10-24',
      detalleFormulario: null, detalleDisponibilidadServicios: { nombreSolicitante: 'Ana' },
      documentos: [], historial: [], camposAdministrativos: {},
    })
    expect(normalized.detalleFormulario).toEqual({ nombreSolicitante: 'Ana' })
  })

  it('consume listado y alias protegido de detalle', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 15, codigoSeguimiento: 'SOL-2026-X8K91B', estado: 'PENDIENTE', fechaIngreso: '2026-10-24', detalleFormulario: {}, documentos: [], historial: [], camposAdministrativos: {} }), { status: 200 }))
      .mockResolvedValueOnce(new Response('pdf', { status: 200, headers: { 'Content-Type': 'application/pdf' } }))

    await getSolicitudesAdmin({ search: '', estado: '', tipo: '', page: 1 })
    await getSolicitudAdminDetail(15)
    await getSolicitudDocumentoAdmin(15, 40)

    expect(String(fetchMock.mock.calls[0][0])).toContain('/solicitudes?page=1&limit=10')
    expect(String(fetchMock.mock.calls[1][0])).toMatch(/\/solicitudes\/15\/detalle$/)
    expect(String(fetchMock.mock.calls[2][0])).toMatch(/\/solicitudes\/15\/documentos\/40\/descargar$/)
  })

  it('consulta resumen, historial y cambio de estado', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 15,
            tipoSolicitudId: 1,
            codigoSeguimiento: 'SOL-2026-X8K91B',
            estado: 'PENDIENTE',
            fechaIngreso: '2026-10-24',
            createdAt: '2026-10-24',
            updatedAt: '2026-10-24',
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 15,
            solicitudId: 15,
            codigoSeguimiento: 'SOL-2026-X8K91B',
            estado: 'EN_REVISION',
            fechaResolucion: null,
            estadoAnterior: 'PENDIENTE',
            estadoNuevo: 'EN_REVISION',
            observacionPublica: 'Público',
            notaInterna: 'Interno',
            idUsuario: 1,
            fecha: '2026-10-25',
            historialId: 9,
          }),
          { status: 200 },
        ),
      )

    await getSolicitudAdmin(15)
    await getHistorialSolicitudAdmin(15)
    await cambiarEstadoSolicitudAdmin(15, {
      estadoNuevo: 'EN_REVISION',
      observacionPublica: 'Público',
    })

    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/solicitudes\/15$/)
    expect(String(fetchMock.mock.calls[1][0])).toMatch(/\/solicitudes\/15\/historial$/)
    expect(String(fetchMock.mock.calls[2][0])).toMatch(/\/solicitudes\/15\/estado$/)
    expect(fetchMock.mock.calls[2][1]?.method).toBe('PATCH')
  })
})
