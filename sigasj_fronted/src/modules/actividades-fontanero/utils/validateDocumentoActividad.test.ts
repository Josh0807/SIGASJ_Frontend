import { describe, expect, it } from 'vitest'
import { DOCUMENTO_ACTIVIDAD_MAX_BYTES, formatDocumentoSize, validateDocumentoActividad } from './validateDocumentoActividad'

describe('validateDocumentoActividad', () => {
  it('acepta formatos válidos', () => {
    expect(validateDocumentoActividad(new File(['pdf'], 'respaldo.pdf', { type: 'application/pdf' }))).toBeNull()
    expect(validateDocumentoActividad(new File(['jpg'], 'foto.jpeg', { type: 'image/jpeg' }))).toBeNull()
  })
  it('rechaza extensión, MIME o tamaño inválidos', () => {
    expect(validateDocumentoActividad(new File(['x'], 'archivo.docx', { type: 'application/octet-stream' }))).toContain('PDF')
    expect(validateDocumentoActividad(new File(['x'], 'falso.pdf', { type: 'text/plain' }))).toContain('permitido')
    const large = new File([new Uint8Array(DOCUMENTO_ACTIVIDAD_MAX_BYTES + 1)], 'grande.png', { type: 'image/png' })
    expect(validateDocumentoActividad(large)).toContain('10 MB')
  })
  it('formatea el tamaño', () => {
    expect(formatDocumentoSize(1536)).toBe('1.5 KB')
    expect(formatDocumentoSize(2 * 1024 * 1024)).toBe('2.0 MB')
  })
})
