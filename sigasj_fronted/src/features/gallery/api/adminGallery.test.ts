import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  deleteAdminGalleryPhoto,
  listAdminGalleryPhotos,
  reorderAdminGalleryPhotos,
  updateAdminGalleryEstado,
} from './adminGallery'

const token = 'test-token'

describe('adminGallery API', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('lista fotografías activas e inactivas con filtros', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          JSON.stringify([
            {
              idFotografiaGaleria: 1,
              titulo: 'Obra',
              descripcion: 'Detalle',
              imagenUrl: '/uploads/galeria/1.png',
              textoAlternativo: 'Alt',
              ordenVisualizacion: 0,
              activo: true,
            },
            {
              idFotografiaGaleria: 2,
              titulo: null,
              descripcion: null,
              imagenUrl: '/uploads/galeria/2.png',
              textoAlternativo: 'Inactiva',
              ordenVisualizacion: 1,
              activo: false,
            },
          ]),
      }),
    )

    const photos = await listAdminGalleryPhotos(token, {
      titulo: 'obra',
      activo: false,
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/galeria?titulo=obra&activo=false',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
        }),
      }),
    )
    expect(photos).toHaveLength(2)
    expect(photos[1]?.activo).toBe(false)
  })

  it('actualiza el estado activo/inactivo de una fotografía', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          JSON.stringify({
            idFotografiaGaleria: 4,
            imagenUrl: '/uploads/galeria/4.png',
            textoAlternativo: 'Alt',
            ordenVisualizacion: 0,
            activo: false,
          }),
      }),
    )

    const photo = await updateAdminGalleryEstado(token, 4, false)

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/galeria/4/estado',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ activo: false }),
      }),
    )
    expect(photo.activo).toBe(false)
  })

  it('reorganiza el orden de visualización', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          JSON.stringify([
            {
              idFotografiaGaleria: 2,
              imagenUrl: '/uploads/galeria/2.png',
              textoAlternativo: 'Segunda',
              ordenVisualizacion: 0,
              activo: true,
            },
            {
              idFotografiaGaleria: 1,
              imagenUrl: '/uploads/galeria/1.png',
              textoAlternativo: 'Primera',
              ordenVisualizacion: 1,
              activo: true,
            },
          ]),
      }),
    )

    const payload = [
      { idFotografiaGaleria: 2, ordenVisualizacion: 0 },
      { idFotografiaGaleria: 1, ordenVisualizacion: 1 },
    ]

    const photos = await reorderAdminGalleryPhotos(token, payload)

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/galeria/orden',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ fotografias: payload }),
      }),
    )
    expect(photos.map((item) => item.id)).toEqual([2, 1])
  })

  it('elimina una fotografía administrativa', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        text: async () => '',
      }),
    )

    await deleteAdminGalleryPhoto(token, 9)

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/galeria/9',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
        }),
      }),
    )
  })
})
