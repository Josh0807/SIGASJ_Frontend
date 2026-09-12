import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAuthSession } from '../../auth/utils/authStorage'
import { consultarDisponibilidad, getSalidasPorAveria, registrarSalida } from './salidasApi'

const ok = (body: unknown, status = 200) => ({ ok: true, status, json: async () => body }) as Response

describe('contratos HTTP de salidas', () => {
  beforeEach(() => setAuthSession({ accessToken: 'jwt-fontanero', user: { id: '3', role: 'Fontanero' } }))
  afterEach(() => { vi.unstubAllGlobals(); clearAccessToken() })

  it('consulta la disponibilidad con material y cantidad', async () => {
    const body = { idMaterial: 4, nombreMaterial: 'Tubo PVC', disponible: true, stockActual: 20, stockMinimo: 5, cantidadSolicitada: 5, stockResultante: 15, esAgotamientoTotal: false, esBajoMinimo: false, mensaje: 'Stock suficiente.' }
    const fetchMock = vi.fn(() => Promise.resolve(ok(body)))
    vi.stubGlobal('fetch', fetchMock)
    expect(await consultarDisponibilidad(4, 5)).toEqual(body)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/inventario\/materiales\/4\/disponibilidad\?cantidad=5$/)
  })

  it('envía el contrato estricto sin permitir falsificar al responsable', async () => {
    const response = { mensaje: 'Registrada', stockAnterior: 20, stockActual: 16, diferencia: -4, agotadoTotal: false, bajoStockMinimo: false, movimiento: { id: 105, tipo: 'SALIDA', cantidad: 4, fechaMovimiento: '2026-09-11', observacion: 'Reparación', idMaterial: 4, idUsuario: 3, idAveria: 42, idSolicitud: null } }
    const fetchMock = vi.fn(() => Promise.resolve(ok(response, 201)))
    vi.stubGlobal('fetch', fetchMock)
    const payload = { idMaterial: 4, cantidad: 4, idAveria: 42, idSolicitud: null, observacion: 'Reparación' }
    expect(await registrarSalida(payload)).toEqual(response)
    const [, options] = fetchMock.mock.calls[0]
    expect(options).toMatchObject({ method: 'POST' })
    expect(JSON.parse(String((options as RequestInit).body))).toEqual(payload)
    expect(String((options as RequestInit).body)).not.toContain('idUsuario')
    expect((options as RequestInit).headers).toMatchObject({ Authorization: 'Bearer jwt-fontanero' })
  })

  it('consulta los movimientos relacionados con una avería', async () => {
    const movements = [{ id: 105, tipo: 'SALIDA', cantidad: 4, idAveria: 42 }]
    const fetchMock = vi.fn(() => Promise.resolve(ok(movements)))
    vi.stubGlobal('fetch', fetchMock)
    expect(await getSalidasPorAveria(42)).toEqual(movements)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/inventario\/salidas\/averia\/42$/)
  })
})
