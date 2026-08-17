import { describe, expect, it } from 'vitest'
import {
  GALLERY_MAX_IMAGE_SIZE_BYTES,
  validateGalleryImageFile,
} from './validateGalleryImageFile'

describe('validateGalleryImageFile', () => {
  it('acepta JPG, PNG y WebP dentro del límite', () => {
    const file = new File(['x'], 'foto.jpg', { type: 'image/jpeg' })

    expect(validateGalleryImageFile(file)).toBeNull()
  })

  it('rechaza formatos no permitidos', () => {
    const file = new File(['x'], 'foto.gif', { type: 'image/gif' })

    expect(validateGalleryImageFile(file)).toMatch(/JPG, PNG o WebP/)
  })

  it('rechaza archivos mayores a 5 MB', () => {
    const file = new File(
      [new Uint8Array(GALLERY_MAX_IMAGE_SIZE_BYTES + 1)],
      'foto.png',
      { type: 'image/png' },
    )

    expect(validateGalleryImageFile(file)).toMatch(/5 MB/)
  })
})
