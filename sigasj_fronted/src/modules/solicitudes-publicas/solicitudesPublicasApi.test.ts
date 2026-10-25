import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as httpClient from '../../services/http/httpClient'
import {
  consultarSeguimientoPublico,
  normalizeTrackingCode,
} from './solicitudesPublicasApi'

describe('solicitudesPublicasApi — seguimiento 4.14.1', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('normaliza espacios y mayúsculas del código', () => {
    expect(normalizeTrackingCode('  sol-2026-abcd12  ')).toBe('SOL-2026-ABCD12')
  })

  it('consultarSeguimientoPublico envía POST con codigo e identificacion únicamente', async () => {
    const spy = vi.spyOn(httpClient, 'fetchWithAuth').mockResolvedValue({
      codigoSeguimiento: 'SOL-2026-00001',
      estado: 'EN_REVISION',
      fechaIngreso: '2026-10-20T14:30:00.000Z',
      tipoSolicitud: { nombre: 'Arreglo de pago', slug: 'arreglo-pago' },
      historial: [],
    } as never)

    await consultarSeguimientoPublico({
      codigo: 'SOL-2026-00001',
      identificacion: '1-1234-0567',
    })

    expect(spy).toHaveBeenCalledWith('/solicitudes/seguimiento', {
      method: 'POST',
      body: JSON.stringify({
        codigo: 'SOL-2026-00001',
        identificacion: '1-1234-0567',
      }),
    })
    const sent = JSON.parse(String(spy.mock.calls[0]?.[1]?.body)) as Record<
      string,
      unknown
    >
    expect(Object.keys(sent).sort()).toEqual(['codigo', 'identificacion'])
    expect(sent).not.toHaveProperty('usuarioId')
    expect(sent).not.toHaveProperty('solicitudId')
    expect(sent).not.toHaveProperty('includeInternal')
  })
})
