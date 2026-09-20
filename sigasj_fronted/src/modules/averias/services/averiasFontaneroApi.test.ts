import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWithAuth } from '../../../services/http/httpClient'
import { findFontaneroAveriaFixture } from '../fontanero/fixtures/averiasFontaneroDetail.fixture'
import {
  FONTANERO_AVERIAS_ENDPOINT,
  createFontaneroObservacion,
  getFontaneroAveria,
  getFontaneroAverias,
  iniciarFontaneroAtencion,
  patchFontaneroAveriaClasificacion,
  patchFontaneroAveriaPrioridad,
  resolverFontaneroAveria,
} from './averiasFontaneroApi'

vi.mock('../../../services/http/httpClient', () => ({
  fetchWithAuth: vi.fn(),
}))

describe('averiasFontaneroApi', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('consulta el listado asignado sin enviar fontaneroId', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce({ data: [] })
    await expect(getFontaneroAverias()).resolves.toEqual({ data: [] })
    expect(fetchWithAuth).toHaveBeenCalledWith(FONTANERO_AVERIAS_ENDPOINT, {
      signal: undefined,
    })
    expect(JSON.stringify(vi.mocked(fetchWithAuth).mock.calls[0])).not.toMatch(
      /fontaneroId/,
    )
  })

  it('consulta el detalle por id numérico sin enviar fontaneroId', async () => {
    const detail = findFontaneroAveriaFixture(25)!
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(detail)

    await expect(getFontaneroAveria(25)).resolves.toEqual(detail)
    expect(fetchWithAuth).toHaveBeenCalledTimes(1)
    expect(fetchWithAuth).toHaveBeenCalledWith(
      `${FONTANERO_AVERIAS_ENDPOINT}/25`,
      { signal: undefined },
    )
    expect(JSON.stringify(vi.mocked(fetchWithAuth).mock.calls[0])).not.toMatch(
      /fontaneroId/,
    )
  })

  it('no envía solicitudes con ID inválido', async () => {
    await expect(getFontaneroAveria(Number.NaN)).rejects.toThrow(/HTTP 400/)
    expect(fetchWithAuth).not.toHaveBeenCalled()
  })

  it('cierra la avería enviando solo observacionFinal', async () => {
    const resolved = {
      ...findFontaneroAveriaFixture(27)!,
      estado: 'RESUELTA',
      fechaResolucion: '2026-09-19T18:00:00.000Z',
    }
    vi.mocked(fetchWithAuth).mockResolvedValueOnce({
      message: 'La avería fue marcada como resuelta.',
      data: resolved,
    })

    await expect(
      resolverFontaneroAveria(27, '  Se reparó la fuga.  '),
    ).resolves.toMatchObject({
      data: { estado: 'RESUELTA' },
    })
    expect(fetchWithAuth).toHaveBeenCalledWith(
      `${FONTANERO_AVERIAS_ENDPOINT}/27/resolver`,
      {
        method: 'PATCH',
        body: JSON.stringify({ observacionFinal: '  Se reparó la fuga.  ' }),
        signal: undefined,
      },
    )
    const payload = JSON.parse(
      String(vi.mocked(fetchWithAuth).mock.calls[0]?.[1]?.body),
    ) as Record<string, unknown>
    expect(Object.keys(payload)).toEqual(['observacionFinal'])
    expect(payload).not.toHaveProperty('estado')
    expect(payload).not.toHaveProperty('fechaResolucion')
    expect(payload).not.toHaveProperty('fontaneroId')
  })

  it('inicia la atención sin enviar fecha ni estado del cliente', async () => {
    const started = {
      ...findFontaneroAveriaFixture(25)!,
      estado: 'EN_ATENCION',
      fechaInicioAtencion: '2026-09-19T14:00:00.000Z',
    }
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(started)

    await expect(iniciarFontaneroAtencion(25)).resolves.toEqual(started)
    expect(fetchWithAuth).toHaveBeenCalledWith(
      `${FONTANERO_AVERIAS_ENDPOINT}/25/iniciar-atencion`,
      {
        method: 'PATCH',
        body: JSON.stringify({}),
        signal: undefined,
      },
    )
    const payload = JSON.parse(
      String(vi.mocked(fetchWithAuth).mock.calls[0]?.[1]?.body),
    ) as Record<string, unknown>
    expect(payload).toEqual({})
    expect(payload).not.toHaveProperty('fechaInicioAtencion')
    expect(payload).not.toHaveProperty('estado')
    expect(payload).not.toHaveProperty('fontaneroId')
  })

  it('no inicia atención con ID inválido', async () => {
    await expect(iniciarFontaneroAtencion(Number.NaN)).rejects.toThrow(/HTTP 400/)
    expect(fetchWithAuth).not.toHaveBeenCalled()
  })

  it('envía prioridad Baja/Media/Alta y tipo Tubo madre/Tubo medidor', async () => {
    const detail = findFontaneroAveriaFixture(25)!
    vi.mocked(fetchWithAuth).mockResolvedValueOnce({
      ...detail,
      prioridad: 'MEDIA',
    })
    await expect(patchFontaneroAveriaPrioridad(25, 'MEDIA')).resolves.toMatchObject({
      prioridad: 'MEDIA',
    })
    expect(fetchWithAuth).toHaveBeenCalledWith(
      `${FONTANERO_AVERIAS_ENDPOINT}/25/prioridad`,
      {
        method: 'PATCH',
        body: JSON.stringify({ prioridad: 'MEDIA' }),
        signal: undefined,
      },
    )

    vi.mocked(fetchWithAuth).mockResolvedValueOnce({
      ...detail,
      tipoAveria: 'TUBO_MADRE',
    })
    await expect(
      patchFontaneroAveriaClasificacion(25, 'TUBO_MADRE'),
    ).resolves.toMatchObject({ tipoAveria: 'TUBO_MADRE' })
    expect(fetchWithAuth).toHaveBeenCalledWith(
      `${FONTANERO_AVERIAS_ENDPOINT}/25/clasificacion`,
      {
        method: 'PATCH',
        body: JSON.stringify({ clasificacion: 'TUBO_MADRE' }),
        signal: undefined,
      },
    )
  })

  it('registra una observación enviando solo el texto', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce({
      message: 'Observación registrada correctamente.',
      data: {
        id: 31,
        observacion: 'Se identificó una fuga.',
        fechaCreacion: '2026-09-19T18:10:00.000Z',
        autor: { id: 7, nombre: 'Fontanero A' },
      },
    })

    await expect(createFontaneroObservacion(27, 'Se identificó una fuga.')).resolves.toMatchObject(
      {
        data: { observacion: 'Se identificó una fuga.' },
      },
    )
    expect(fetchWithAuth).toHaveBeenCalledWith(
      `${FONTANERO_AVERIAS_ENDPOINT}/27/observaciones`,
      {
        method: 'POST',
        body: JSON.stringify({ observacion: 'Se identificó una fuga.' }),
        signal: undefined,
      },
    )
    const payload = JSON.parse(
      String(vi.mocked(fetchWithAuth).mock.calls[0]?.[1]?.body),
    ) as Record<string, unknown>
    expect(Object.keys(payload)).toEqual(['observacion'])
    expect(payload).not.toHaveProperty('fontaneroId')
    expect(payload).not.toHaveProperty('fechaCreacion')
    expect(payload).not.toHaveProperty('autor')
  })
})
