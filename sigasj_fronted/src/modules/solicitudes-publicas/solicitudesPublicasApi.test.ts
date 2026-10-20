import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSolicitudSeguimiento, normalizeTrackingCode } from './solicitudesPublicasApi'

describe('solicitudesPublicasApi', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('normaliza espacios y mayúsculas del código', () => {
    expect(normalizeTrackingCode('  sol-2026-abcd12  ')).toBe('SOL-2026-ABCD12')
  })

  it('consulta el endpoint público con el código normalizado', async () => {
    const response = {
      id: 42,
      tipoSolicitudId: 1,
      codigoSeguimiento: 'SOL-2026-ABCD12',
      estado: 'EN_REVISION' as const,
      fechaIngreso: '2026-10-20T14:30:00.000Z',
      createdAt: '2026-10-20T14:30:00.000Z',
      updatedAt: '2026-10-20T15:00:00.000Z',
      tipoSolicitud: { id: 1, nombre: 'Solicitud de Arreglo de Pago Domiciliar', slug: 'arreglo-pago' },
    }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    await expect(getSolicitudSeguimiento(' sol-2026-abcd12 ')).resolves.toEqual(response)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/solicitudes\/seguimiento\/SOL-2026-ABCD12$/)
  })
})
