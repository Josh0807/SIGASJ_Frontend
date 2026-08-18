import { describe, expect, it } from 'vitest'
import {
  TRANSPARENCIA_MAX_FILE_SIZE_BYTES,
  validateTransparenciaFile,
} from './validateTransparenciaFile'

describe('validateTransparenciaFile', () => {
  it('acepta PDF válido', () => {
    expect(
      validateTransparenciaFile(
        new File(['x'], 'informe.pdf', { type: 'application/pdf' }),
      ),
    ).toBeNull()
  })

  it('acepta JPG válido', () => {
    expect(
      validateTransparenciaFile(
        new File(['x'], 'foto.jpg', { type: 'image/jpeg' }),
      ),
    ).toBeNull()
  })

  it('rechaza formatos no permitidos', () => {
    expect(
      validateTransparenciaFile(
        new File(['x'], 'archivo.zip', { type: 'application/zip' }),
      ),
    ).toMatch(/PDF, JPG, JPEG o PNG/)
  })

  it('rechaza archivos demasiado grandes', () => {
    const large = new File(
      [new Uint8Array(TRANSPARENCIA_MAX_FILE_SIZE_BYTES + 1)],
      'grande.pdf',
      { type: 'application/pdf' },
    )

    expect(validateTransparenciaFile(large)).toMatch(/10 MB/)
  })
})
