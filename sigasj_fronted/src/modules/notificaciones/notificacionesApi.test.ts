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
})
