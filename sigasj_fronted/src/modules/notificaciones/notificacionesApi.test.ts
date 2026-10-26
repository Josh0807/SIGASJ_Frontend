import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWithAuth } from '../../services/http/httpClient'
import {
  getNotificacionesPropias,
  marcarNotificacionLeida,
  NOTIFICACIONES_ENDPOINT,
  parseNotificacionesListado,
} from './notificacionesApi'

vi.mock('../../services/http/httpClient', () => ({
  fetchWithAuth: vi.fn(),
}))

describe('notificacionesApi', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('consulta GET /notificaciones sin enviar id de destinatario', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce({
      data: [
        {
          id: 4,
          idAveria: 25,
          tipo: 'AVERIA_ASIGNADA_FONTANERO',
          titulo: 'Avería asignada AV-2026-0001',
          mensaje: 'Se le asignó la avería AV-2026-0001.',
          leida: false,
          fechaCreacion: '2026-09-22T15:00:00.000Z',
          fechaLectura: null,
        },
      ],
      noLeidas: 1,
    })

    const listado = await getNotificacionesPropias()
    expect(fetchWithAuth).toHaveBeenCalledWith(NOTIFICACIONES_ENDPOINT, {
      signal: undefined,
    })
    expect(listado.noLeidas).toBe(1)
    expect(listado.data[0]?.idAveria).toBe(25)
  })

  it('marca como leída con el id de la notificación', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce({
      id: 4,
      idAveria: 25,
      tipo: 'AVERIA_ASIGNADA_FONTANERO',
      titulo: 'Avería asignada AV-2026-0001',
      mensaje: 'Se le asignó la avería AV-2026-0001.',
      leida: true,
      fechaCreacion: '2026-09-22T15:00:00.000Z',
      fechaLectura: '2026-09-22T16:00:00.000Z',
    })

    await marcarNotificacionLeida(4)
    expect(fetchWithAuth).toHaveBeenCalledWith(
      `${NOTIFICACIONES_ENDPOINT}/4/lectura`,
      { method: 'PATCH', signal: undefined },
    )
  })

  it('no interpreta un payload ajeno (login) como inbox', () => {
    expect(
      parseNotificacionesListado({
        accessToken: 'token',
        user: { id: '1', role: 'Administradora' },
      }),
    ).toEqual({ data: [], noLeidas: 0 })
  })

  it('acepta notificaciones de solicitud de ausencia sin idAveria', () => {
    const listado = parseNotificacionesListado({
      data: [
        {
          id: 9,
          idAveria: null,
          idSolicitudAusencia: 12,
          tipo: 'SOLICITUD_AUSENCIA_PENDIENTE_ADMINISTRADORA',
          titulo: 'Solicitud de permiso pendiente',
          mensaje: 'Juan Fontanero solicitó permiso (2026-11-01 – 2026-11-02).',
          leida: false,
          fechaCreacion: '2026-10-19T15:00:00.000Z',
          fechaLectura: null,
        },
      ],
      noLeidas: 1,
    })
    expect(listado.data).toHaveLength(1)
    expect(listado.data[0]?.idSolicitudAusencia).toBe(12)
    expect(listado.data[0]?.idAveria).toBeNull()
  })

  it('acepta notificaciones de inventario con una referencia válida', () => {
    const listado = parseNotificacionesListado({
      data: [
        {
          id: 20,
          idSolicitudMateriales: 15,
          tipo: 'SOLICITUD_MATERIALES_PENDIENTE_ADMINISTRADORA',
          titulo: 'Nueva solicitud de materiales',
          mensaje: 'Un fontanero registró una solicitud.',
          leida: false,
        },
        {
          id: 21,
          idSalidaInventario: 8,
          tipo: 'SALIDA_INVENTARIO_REGISTRADA_ADMINISTRADORA',
          titulo: 'Salida de inventario registrada',
          mensaje: 'Se registró una nueva salida.',
          leida: false,
        },
        {
          id: 22,
          idReposicion: 5,
          tipo: 'ALERTA_REPOSICION_ADMINISTRADORA',
          titulo: 'Material con existencias bajas',
          mensaje: 'Se generó una alerta de reposición.',
          leida: false,
        },
      ],
      noLeidas: 3,
    })

    expect(listado.data).toHaveLength(3)
    expect(listado.data[0]?.idSolicitudMateriales).toBe(15)
    expect(listado.data[1]?.idSalidaInventario).toBe(8)
    expect(listado.data[2]?.idReposicion).toBe(5)
  })

  it('acepta notificaciones de corrección de actividad', () => {
    const listado = parseNotificacionesListado({
      data: [
        {
          id: 30,
          idActividad: 7,
          tipo: 'ACTIVIDAD_REQUIERE_CORRECCION_FONTANERO',
          titulo: 'Debe corregir una actividad',
          mensaje: 'La administradora pidió correcciones.',
          leida: false,
        },
      ],
      noLeidas: 1,
    })
    expect(listado.data).toHaveLength(1)
    expect(listado.data[0]?.idActividad).toBe(7)
  })
})
