import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchRawWithAuth } from '../../../services/http/httpClient'
import { EvidenciaActividadError, getEvidenciaActividadBlob } from './evidenciaActividadApi'

vi.mock('../../../services/http/httpClient', () => ({ fetchRawWithAuth: vi.fn() }))

describe('getEvidenciaActividadBlob', () => {
  beforeEach(() => vi.mocked(fetchRawWithAuth).mockReset())

  it('descarga la imagen por el cliente autenticado', async () => {
    const image = new Blob(['image'], { type: 'image/jpeg' })
    vi.mocked(fetchRawWithAuth).mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => image,
    } as Response)
    await expect(getEvidenciaActividadBlob('/api/v1/fontanero/actividades/6/documentos/foto.jpg', 6))
      .resolves.toEqual(image)
    expect(fetchRawWithAuth).toHaveBeenCalledWith(
      '/fontanero/actividades/6/documentos/foto.jpg',
      { signal: undefined },
    )
  })

  it.each([
    [401, 'sesión'],
    [403, 'permiso'],
    [404, 'disponible'],
  ])('distingue el estado %i', async (status, message) => {
    vi.mocked(fetchRawWithAuth).mockResolvedValue(new Response(null, { status }))
    const promise = getEvidenciaActividadBlob('foto.jpg', 6)
    await expect(promise).rejects.toMatchObject({ status })
    await expect(promise).rejects.toThrow(message)
  })

  it('rechaza respuestas exitosas que no sean imágenes', async () => {
    vi.mocked(fetchRawWithAuth).mockResolvedValue(
      new Response('<html></html>', { status: 200, headers: { 'Content-Type': 'text/html' } }),
    )
    await expect(getEvidenciaActividadBlob('foto.jpg', 6)).rejects.toBeInstanceOf(EvidenciaActividadError)
  })
})
