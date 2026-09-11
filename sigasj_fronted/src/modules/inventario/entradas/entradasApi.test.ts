import { afterEach, describe, expect, it, vi } from 'vitest'
import { registrarEntrada } from './entradasApi'

describe('contrato API de entradas de inventario', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('registra por POST sin enviar ni calcular stock', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ movimiento: { id: 1, tipo: 'ENTRADA' }, stockAnterior: 2, stockActual: 14, mensaje: 'Entrada registrada' }) } as Response)
    vi.stubGlobal('fetch', fetchMock)
    await registrarEntrada({ idMaterial: 4, cantidad: 12, idProveedor: 7, observacion: 'Factura 123' })
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(String(url)).toMatch(/\/inventario\/entradas$/)
    expect(options.method).toBe('POST')
    expect(options.body).toBe('{"idMaterial":4,"cantidad":12,"idProveedor":7,"observacion":"Factura 123"}')
    expect(options.body).not.toContain('stock')
  })

  it('permite omitir proveedor y observación usando null', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: 2 }) } as Response)
    vi.stubGlobal('fetch', fetchMock)
    await registrarEntrada({ idMaterial: 4, cantidad: 1, idProveedor: null, observacion: null })
    expect((fetchMock.mock.calls[0][1] as RequestInit).body).toContain('"idProveedor":null')
  })
})
