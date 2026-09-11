import { afterEach, describe, expect, it, vi } from 'vitest'
import { abrirDocumentoEntrada, adjuntarDocumentoEntrada, getDocumentosEntrada } from './documentosApi'

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response

describe('contrato API de documentos de entradas', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('adjunta multipart con el campo obligatorio archivo y sin Content-Type manual', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 1 })); vi.stubGlobal('fetch', fetchMock)
    const file = new File(['%PDF-'], 'factura.pdf', { type: 'application/pdf' })
    await adjuntarDocumentoEntrada(105, file)
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/entradas\/105\/documentos$/)
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    expect((options.body as FormData).get('archivo')).toBe(file)
    expect((options.headers as Record<string, string>)['Content-Type']).toBeUndefined()
  })
  it('consulta documentos asociados al movimiento exacto', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok([])); vi.stubGlobal('fetch', fetchMock)
    await getDocumentosEntrada(105)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/entradas\/105\/documentos$/)
  })
  it('rechaza referencias externas o con recorrido de ruta antes de enviar el token', async () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock)
    await expect(abrirDocumentoEntrada('https://evil.example/documento.pdf')).rejects.toThrow('no es válida')
    await expect(abrirDocumentoEntrada('/api/v1/inventario/movimientos/1/documentos/../secret')).rejects.toThrow('no es válida')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
