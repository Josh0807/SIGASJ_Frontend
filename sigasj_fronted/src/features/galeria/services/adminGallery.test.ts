import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { requestJson, requestVoid } from '../../../shared/api/http'
import {
  deleteAdminGalleryPhoto,
  listAdminGalleryPhotos,
  reorderAdminGalleryPhotos,
  updateAdminGalleryEstado,
} from './adminGallery'

vi.mock('../../../shared/api/http', () => ({
  requestJson: vi.fn(),
  requestFormData: vi.fn(),
  requestVoid: vi.fn(),
}))

const requestJsonMock = vi.mocked(requestJson)
const requestVoidMock = vi.mocked(requestVoid)
const token = 'test-token'

describe('adminGallery API', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    requestJsonMock.mockReset()
    requestVoidMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('lista fotografías activas e inactivas con filtros', async () => {
    requestJsonMock.mockResolvedValue([
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
    ])

    const photos = await listAdminGalleryPhotos(token, {
      titulo: 'obra',
      activo: false,
    })

    expect(requestJsonMock).toHaveBeenCalledWith(
      '/api/admin/galeria?titulo=obra&activo=false',
      { token },
    )
    expect(photos).toHaveLength(2)
    expect(photos[1]?.activo).toBe(false)
  })

  it('actualiza el estado activo/inactivo de una fotografía', async () => {
    requestJsonMock.mockResolvedValue({
      idFotografiaGaleria: 4,
      imagenUrl: '/uploads/galeria/4.png',
      textoAlternativo: 'Alt',
      ordenVisualizacion: 0,
      activo: false,
    })

    const photo = await updateAdminGalleryEstado(token, 4, false)

    expect(requestJsonMock).toHaveBeenCalledWith('/api/admin/galeria/4/estado', {
      method: 'PATCH',
      token,
      body: { activo: false },
    })
    expect(photo.activo).toBe(false)
  })

  it('reorganiza el orden de visualización', async () => {
    requestJsonMock.mockResolvedValue([
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
    ])

    const payload = [
      { idFotografiaGaleria: 2, ordenVisualizacion: 0 },
      { idFotografiaGaleria: 1, ordenVisualizacion: 1 },
    ]

    const photos = await reorderAdminGalleryPhotos(token, payload)

    expect(requestJsonMock).toHaveBeenCalledWith('/api/admin/galeria/orden', {
      method: 'PATCH',
      token,
      body: { fotografias: payload },
    })
    expect(photos.map((item) => item.id)).toEqual([2, 1])
  })

  it('elimina una fotografía administrativa', async () => {
    requestVoidMock.mockResolvedValue(undefined)

    await deleteAdminGalleryPhoto(token, 9)

    expect(requestVoidMock).toHaveBeenCalledWith('/api/admin/galeria/9', {
      method: 'DELETE',
      token,
    })
  })
})
