import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAsociados, registrarAsociado } from './asociadosApi'

const ok = (body: unknown, status = 200) => ({ ok: true, status, json: async () => body }) as Response

describe('contrato API de asociados', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('consulta el listado autenticado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok([]))
    vi.stubGlobal('fetch', fetchMock)
    await getAsociados()
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/asociados$/)
  })

  it('registra con POST y el payload esperado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 1 }, 201))
    vi.stubGlobal('fetch', fetchMock)
    const payload = { nombre: 'Juan', apellidos: 'Pérez', cedula: '1-1234', correoElectronico: 'juan@example.com' }
    await registrarAsociado(payload)
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify(payload))
  })
})
