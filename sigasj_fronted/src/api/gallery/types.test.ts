import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  extractPublicGalleryPayload,
  mapPublicGalleryPhoto,
  resolveGalleryImageUrl,
} from './types'

describe('gallery public mappers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('extrae fotografías desde { data: [] }', () => {
    expect(
      extractPublicGalleryPayload({
        data: [{ id: 1, imagenUrl: '/a.png', textoAlternativo: 'Alt' }],
        total: 1,
      }),
    ).toHaveLength(1)
  })

  it('mapea una fotografía pública válida', () => {
    vi.stubEnv('VITE_API_BASE_URL', '')

    const mapped = mapPublicGalleryPhoto({
      idFotografiaGaleria: 2,
      titulo: 'Obra',
      descripcion: 'Detalle',
      imagenUrl: '/uploads/galeria/2.png',
      textoAlternativo: 'Foto de obra',
    })

    expect(mapped).toEqual({
      id: '2',
      title: 'Obra',
      description: 'Detalle',
      imageUrl: '/uploads/galeria/2.png',
      altText: 'Foto de obra',
    })
  })

  it('descarta registros incompletos', () => {
    expect(
      mapPublicGalleryPhoto({
        id: 3,
        imagenUrl: '/uploads/galeria/3.png',
      }),
    ).toBeNull()
  })

  it('resuelve URL relativa con base configurada', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000')

    expect(resolveGalleryImageUrl('/uploads/galeria/foto.png')).toBe(
      'http://localhost:3000/uploads/galeria/foto.png',
    )
  })
})
