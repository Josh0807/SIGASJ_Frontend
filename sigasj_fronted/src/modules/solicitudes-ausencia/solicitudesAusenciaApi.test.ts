import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAuthSession } from '../auth/utils/authStorage'
import {
  aprobarSolicitudAusencia,
  crearMiSolicitudAusencia,
  getMiSolicitudAusencia,
  getMisSolicitudesAusencia,
  getSolicitudesAusencia,
  rechazarSolicitudAusencia,
} from './solicitudesAusenciaApi'

describe('solicitudesAusenciaApi — Fontanero 6.5.3', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setAuthSession({
      accessToken: 'jwt-fontanero',
      user: { id: '3', role: 'Fontanero' },
    })
  })

  it('listado llama GET fontanero/solicitudes-ausencia sin colaboradorId', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    )

    await getMisSolicitudesAusencia()

    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toMatch(/\/fontanero\/solicitudes-ausencia$/)
    expect(url).not.toContain('colaboradorId')
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: 'Bearer jwt-fontanero',
    })
  })

  it('detalle llama GET fontanero/solicitudes-ausencia/:id sin colaboradorId', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 5 }), { status: 200 }),
    )

    await getMiSolicitudAusencia(5)

    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toMatch(/\/fontanero\/solicitudes-ausencia\/5$/)
    expect(url).not.toContain('colaboradorId')
  })

  it('crear llama POST fontanero/solicitudes-ausencia sin colaboradorId', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 9, estado: 'PENDIENTE' }), {
        status: 201,
      }),
    )

    await crearMiSolicitudAusencia({
      tipo: 'VACACIONES',
      fechaInicio: '2026-12-01',
      fechaFin: '2026-12-05',
      correo: 'aviso@asadasanjuan.cr',
      motivo: 'Descanso',
    })

    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toMatch(/\/fontanero\/solicitudes-ausencia$/)
    expect(url).not.toContain('colaboradorId')
    expect(fetchMock.mock.calls[0][1]?.method).toBe('POST')
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      tipo: 'VACACIONES',
      fechaInicio: '2026-12-01',
      fechaFin: '2026-12-05',
      correo: 'aviso@asadasanjuan.cr',
      motivo: 'Descanso',
    })
  })
})

describe('solicitudesAusenciaApi — Admin 6.5.4 / 6.5.7', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setAuthSession({
      accessToken: 'jwt-admin',
      user: { id: '1', role: 'Administradora' },
    })
  })

  it('listado GET rrhh/solicitudes-ausencia con query estado', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
        { status: 200 },
      ),
    )

    await getSolicitudesAusencia({ estado: 'PENDIENTE', page: 1 })

    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toMatch(/\/rrhh\/solicitudes-ausencia\?/)
    expect(url).toContain('estado=PENDIENTE')
    expect(url).toContain('page=1')
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: 'Bearer jwt-admin',
    })
  })

  it('aprobar PATCH sin body', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 8, estado: 'APROBADA' }), { status: 200 }),
    )

    await aprobarSolicitudAusencia(8)

    expect(String(fetchMock.mock.calls[0][0])).toMatch(
      /\/rrhh\/solicitudes-ausencia\/8\/aprobar$/,
    )
    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH')
  })

  it('rechazar PATCH con motivoRechazo opcional', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 8, estado: 'RECHAZADA' }), { status: 200 }),
    )

    await rechazarSolicitudAusencia(8, 'Sin cobertura')

    expect(String(fetchMock.mock.calls[0][0])).toMatch(
      /\/rrhh\/solicitudes-ausencia\/8\/rechazar$/,
    )
    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH')
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      motivoRechazo: 'Sin cobertura',
    })
  })
})
