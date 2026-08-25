import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWithAuth } from '../../../services/http/httpClient'
import {
  getSolicitudesPendientes,
  registerAbonado,
} from './abonadosApi'
import type { AbonadoRegistroFormValues } from '../admin/types'

vi.mock('../../../services/http/httpClient', () => ({
  fetchWithAuth: vi.fn(),
}))

const sampleValues: AbonadoRegistroFormValues = {
  origen: 'solicitud',
  idSolicitud: '1',
  nombre: 'María',
  apellidos: 'Rodríguez Mora',
  cedula: '1-2345-6789',
  telefono: '8888-1234',
  correo: 'maria.rodriguez@correo.cr',
  direccion: 'San Juan, Desamparados',
  servicio: {
    nis: 'NIS-2026-001',
    medidor: 'MED-45821',
    sector: 'Sector Centro',
    tarifa: 'Residencial',
    numeroPlano: 'PL-1024',
  },
}

describe('abonadosApi — Tarea #341', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('carga solicitudes aprobadas con fetchWithAuth', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({
      solicitudes: [],
      mensaje: 'No hay solicitudes aprobadas pendientes de registro.',
    })

    const response = await getSolicitudesPendientes()

    expect(fetchWithAuth).toHaveBeenCalledWith(
      '/v1/solicitudes/aprobadas-pendientes',
      undefined,
    )
    expect(response.mensaje).toContain('No hay solicitudes')
  })

  it('registra abonado con token vía fetchWithAuth POST', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({
      idAbonado: 12,
      mensaje: 'Abonado y servicio registrados correctamente.',
    })

    const response = await registerAbonado(sampleValues)

    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/abonados', {
      method: 'POST',
      body: JSON.stringify({
        idSolicitud: 1,
        nombre: 'María',
        apellidos: 'Rodríguez Mora',
        cedula: '1-2345-6789',
        telefono: '8888-1234',
        correo: 'maria.rodriguez@correo.cr',
        direccion: 'San Juan, Desamparados',
        servicio: {
          nis: 'NIS-2026-001',
          medidor: 'MED-45821',
          sector: 'Sector Centro',
          tarifa: 'Residencial',
          numeroPlano: 'PL-1024',
        },
      }),
    })
    expect(response.idAbonado).toBe(12)
  })

  it('omite idSolicitud en registro manual', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({
      idAbonado: 13,
      mensaje: 'Abonado y servicio registrados correctamente.',
    })

    await registerAbonado({ ...sampleValues, origen: 'manual', idSolicitud: '' })

    const call = vi.mocked(fetchWithAuth).mock.calls[0]
    const body = JSON.parse(String(call[1]?.body))

    expect(body.idSolicitud).toBeUndefined()
  })
})
