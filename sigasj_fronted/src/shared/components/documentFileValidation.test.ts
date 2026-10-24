import { describe, expect, it } from 'vitest'
import { formatDocumentSize, validateDocumentFile } from './documentFileValidation'

const bytes = {
  pdf: [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  jpg: [0xff, 0xd8, 0xff, 0xe0],
}

describe('validateDocumentFile', () => {
  it.each([
    ['documento.pdf', 'application/pdf', bytes.pdf],
    ['foto.png', 'image/png', bytes.png],
    ['cedula.jpeg', 'image/jpeg', bytes.jpg],
  ])('acepta contenido real permitido: %s', async (name, type, content) => {
    await expect(validateDocumentFile(new File([new Uint8Array(content)], name, { type }))).resolves.toBeNull()
  })

  it('rechaza archivos vacíos, extensiones peligrosas y contenido disfrazado', async () => {
    await expect(validateDocumentFile(new File([], 'vacio.pdf', { type: 'application/pdf' }))).resolves.toContain('vacío')
    await expect(validateDocumentFile(new File([new Uint8Array(bytes.pdf)], 'malware.exe.pdf', { type: 'application/pdf' }))).resolves.toContain('peligrosa')
    await expect(validateDocumentFile(new File(['texto'], 'falso.pdf', { type: 'application/pdf' }))).resolves.toContain('contenido real')
  })
})

describe('formatDocumentSize', () => {
  it('muestra tamaños legibles', () => {
    expect(formatDocumentSize(512)).toBe('512 B')
    expect(formatDocumentSize(1536)).toBe('1.5 KB')
    expect(formatDocumentSize(2 * 1024 * 1024)).toBe('2.0 MB')
  })
})
