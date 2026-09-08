import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWithAuth } from '../../../services/http/httpClient'
import { TIPOS_ACTIVIDAD_BACKEND } from '../test/tiposActividadFixture'
import { registrarActividad } from './actividadesFontaneroApi'

vi.mock('../../../services/http/httpClient', () => ({ fetchWithAuth: vi.fn() }))

describe('registro integrado de actividad con documentos', () => {
  beforeEach(() => vi.mocked(fetchWithAuth).mockReset())

  it('envía una sola solicitud multipart y todos los archivos bajo documentos', async () => {
    const tipo = TIPOS_ACTIVIDAD_BACKEND.find((item) => item.codigo === 'INCAPACIDAD_VACACIONES')!
    const pdf = new File(['%PDF-1.4'], 'incapacidad.pdf', { type: 'application/pdf' })
    const png = new File(['png'], 'comprobante.png', { type: 'image/png' })
    vi.mocked(fetchWithAuth).mockResolvedValueOnce({ id: 25, documentos: [] })

    await registrarActividad(tipo, {
      fechaActividad: '2026-09-07', titulo: 'Incapacidad médica', ubicacion: 'San José', observaciones: 'Reposo',
      ubicacionFuga: '', presionMedida: '', resultadoVisita: '', cantidadCloro: '', caudal: '', documentos: [pdf, png],
    })

    expect(fetchWithAuth).toHaveBeenCalledTimes(1)
    const [path, options] = vi.mocked(fetchWithAuth).mock.calls[0]
    const formData = options?.body as FormData
    expect(path).toBe('/fontanero/actividades')
    expect(options?.method).toBe('POST')
    expect(formData).toBeInstanceOf(FormData)
    expect(formData.get('tipoActividadId')).toBe(String(tipo.id))
    expect(formData.get('fechaActividad')).toBe('2026-09-07')
    expect(formData.getAll('documentos')).toEqual([pdf, png])
    expect(formData.get('archivo')).toBeNull()
    expect(formData.get('fontaneroId')).toBeNull()
    expect(formData.get('userId')).toBeNull()
  })
})
