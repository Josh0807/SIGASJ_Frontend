import { describe, expect, it, vi } from 'vitest'
import { appendValidDocuments, DOCUMENT_MAX_BYTES, formatDocumentSize, validateDocumento } from './documentosUtils'

describe('validación de documentos de entradas', () => {
  it.each([['factura.pdf', 'application/pdf'], ['foto.jpg', 'image/jpeg'], ['guia.jpeg', 'image/jpeg'], ['recibo.png', 'image/png'], ['comprobante.webp', 'image/webp']])('acepta %s con tipo %s', (name, type) => expect(validateDocumento(new File(['contenido'], name, { type }))).toBeNull())
  it('rechaza extensión, MIME, archivo vacío y más de 10 MB', () => {
    expect(validateDocumento(new File(['script'], 'factura.exe', { type: 'application/pdf' }))).toContain('Solo se permiten')
    expect(validateDocumento(new File(['script'], 'factura.pdf', { type: 'application/x-msdownload' }))).toContain('Solo se permiten')
    expect(validateDocumento(new File([], 'vacio.pdf', { type: 'application/pdf' }))).toContain('vacío')
    expect(validateDocumento(new File([new Uint8Array(DOCUMENT_MAX_BYTES + 1)], 'grande.pdf', { type: 'application/pdf' }))).toContain('10 MB')
  })
  it('agrega solo archivos válidos y conserva errores identificables', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'uuid' })
    const result = appendValidDocuments([], [new File(['ok'], 'factura.pdf', { type: 'application/pdf' }), new File(['bad'], 'virus.exe', { type: 'application/x-msdownload' })])
    expect(result.documents).toHaveLength(1)
    expect(result.errors[0]).toContain('virus.exe')
    vi.unstubAllGlobals()
  })
  it('presenta tamaños legibles sin exponer rutas', () => { expect(formatDocumentSize(2048)).toBe('2 KB'); expect(formatDocumentSize(2 * 1024 * 1024)).toBe('2.0 MB') })
})
