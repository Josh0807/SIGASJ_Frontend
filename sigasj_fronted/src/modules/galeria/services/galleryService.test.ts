import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createGalleryPhoto,
  fetchAdminGallery,
  fetchPublicGallery,
} from './galleryService'

vi.mock('../../../services/http/httpClient', () => ({
  fetchWithAuth: vi.fn(),
}))

import { fetchWithAuth } from '../../../services/http/httpClient'

describe('galleryService', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('fetchPublicGallery usa el endpoint público', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue([])

    await fetchPublicGallery()

    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/public/galeria')
  })

  it('fetchAdminGallery envía filtros como query params', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue([])

    await fetchAdminGallery({ titulo: 'tanque', activo: true })

    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/galeria', {
      params: { titulo: 'tanque', activo: true },
    })
  })

  it('createGalleryPhoto envía multipart con imagen', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({ id: 1 })
    const file = new File(['x'], 'foto.jpg', { type: 'image/jpeg' })

    await createGalleryPhoto(
      {
        titulo: 'Obra',
        descripcion: 'Detalle',
        textoAlternativo: 'Alt',
        ordenVisualizacion: 0,
        activo: true,
      },
      file,
    )

    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/galeria', {
      method: 'POST',
      body: expect.any(FormData),
    })

    const [, options] = vi.mocked(fetchWithAuth).mock.calls[0]
    const formData = options?.body as FormData
    expect(formData.get('textoAlternativo')).toBe('Alt')
    expect(formData.get('imagen')).toBe(file)
  })
})
