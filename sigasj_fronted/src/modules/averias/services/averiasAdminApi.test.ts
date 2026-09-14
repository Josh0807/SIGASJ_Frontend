import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWithAuth } from '../../../services/http/httpClient'
import { AVERIAS_ADMIN_UI_FIXTURE } from '../admin/fixtures/averiasAdminList.fixture'
import { findAveriaDetailFixture } from '../admin/fixtures/averiasAdminDetail.fixture'
import {
  ADMIN_AVERIAS_ENDPOINT,
  getAdminAveria,
  getAdminAverias,
  getAdminAveriasFontanerosAsignables,
  patchAdminAveriaAsignacion,
  patchAdminAveriaClasificacion,
  patchAdminAveriaEstado,
  patchAdminAveriaPrioridad,
  toAveriasAdminParams,
} from './averiasAdminApi'

vi.mock('../../../services/http/httpClient', () => ({
  fetchWithAuth: vi.fn(),
}))

describe('averiasAdminApi', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('omite params vacíos y envía SIN_ASIGNAR para prioridad nula', () => {
    expect(
      toAveriasAdminParams({
        page: 1,
        limit: 20,
        search: '  ',
        estado: '',
        prioridad: 'SIN_ASIGNAR',
        tipo: '',
        fechaDesde: '',
      }),
    ).toEqual({
      page: 1,
      limit: 20,
      search: undefined,
      estado: undefined,
      prioridad: 'SIN_ASIGNAR',
      tipo: undefined,
      fontaneroId: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined,
    })
  })

  it('envía search, estado y prioridad reales en una sola consulta', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(AVERIAS_ADMIN_UI_FIXTURE)

    await getAdminAverias({
      page: 2,
      limit: 20,
      search: 'Juan',
      estado: 'RECIBIDA',
      prioridad: 'ALTA',
    })

    expect(fetchWithAuth).toHaveBeenCalledTimes(1)
    expect(fetchWithAuth).toHaveBeenCalledWith(ADMIN_AVERIAS_ENDPOINT, {
      params: {
        page: 2,
        limit: 20,
        search: 'Juan',
        estado: 'RECIBIDA',
        prioridad: 'ALTA',
        tipo: undefined,
        fontaneroId: undefined,
        fechaDesde: undefined,
        fechaHasta: undefined,
      },
      signal: undefined,
    })
  })

  it('consulta el detalle por id numérico', async () => {
    const detail = findAveriaDetailFixture(2)
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(detail)

    await expect(getAdminAveria(25)).resolves.toEqual(detail)
    expect(fetchWithAuth).toHaveBeenCalledWith(`${ADMIN_AVERIAS_ENDPOINT}/25`, {
      signal: undefined,
    })
  })

  it('GET fontaneros y PATCH asignacion usan contrato Backend 2.4', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce({ data: [{ id: 7 }] })

    await getAdminAveriasFontanerosAsignables()
    expect(fetchWithAuth).toHaveBeenCalledWith(
      `${ADMIN_AVERIAS_ENDPOINT}/fontaneros`,
      { signal: undefined },
    )

    const detail = findAveriaDetailFixture(1)
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(detail)

    await patchAdminAveriaAsignacion(10, 7)
    expect(fetchWithAuth).toHaveBeenCalledWith(
      `${ADMIN_AVERIAS_ENDPOINT}/10/asignacion`,
      {
        method: 'PATCH',
        body: JSON.stringify({ fontaneroId: 7 }),
        signal: undefined,
      },
    )
  })

  it('PATCH estado, prioridad y clasificación usan rutas y body del Backend 2.3', async () => {
    const detail = findAveriaDetailFixture(1)
    vi.mocked(fetchWithAuth).mockResolvedValue(detail)

    await patchAdminAveriaEstado(10, 'EN_REVISION')
    expect(fetchWithAuth).toHaveBeenCalledWith(
      `${ADMIN_AVERIAS_ENDPOINT}/10/estado`,
      {
        method: 'PATCH',
        body: JSON.stringify({ estado: 'EN_REVISION' }),
        signal: undefined,
      },
    )

    await patchAdminAveriaPrioridad(10, 'URGENTE')
    expect(fetchWithAuth).toHaveBeenCalledWith(
      `${ADMIN_AVERIAS_ENDPOINT}/10/prioridad`,
      {
        method: 'PATCH',
        body: JSON.stringify({ prioridad: 'URGENTE' }),
        signal: undefined,
      },
    )

    await patchAdminAveriaClasificacion(10, 'FUGA')
    expect(fetchWithAuth).toHaveBeenCalledWith(
      `${ADMIN_AVERIAS_ENDPOINT}/10/clasificacion`,
      {
        method: 'PATCH',
        body: JSON.stringify({ clasificacion: 'FUGA' }),
        signal: undefined,
      },
    )
  })
})
