import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getArregloPagoErrorMessage, registrarArregloPago, toArregloPagoPayload } from './arregloPagoApi'
import type { ArregloPagoFormValues } from './types'

const values: ArregloPagoFormValues = {
  nombre: '  Juan Carlos Rodríguez Mora ',
  cedula: ' 1-1234-0567 ',
  vecinoDe: ' San Juan, 200m norte ',
  telefono: ' 8888-1234 ',
  numeroCuentaServicio: ' CTA-00984 ',
  montoPrimaInicial: '25000',
  plazoSeleccionado: '6 meses',
  firma: 'data:image/png;base64,abc',
  documentos: [new File(['contenido'], 'cedula.pdf', { type: 'application/pdf' })],
}

describe('arregloPagoApi', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('normaliza el formulario al contrato JSON del backend', () => {
    expect(toArregloPagoPayload(values)).toEqual({
      nombre: 'Juan Carlos Rodríguez Mora',
      cedula: '1-1234-0567',
      vecinoDe: 'San Juan, 200m norte',
      telefono: '8888-1234',
      numeroCuentaServicio: 'CTA-00984',
      montoPrimaInicial: 25000,
      plazoSeleccionado: '6 meses',
      firma: 'data:image/png;base64,abc',
    })
  })

  it('registra la solicitud en el endpoint público', async () => {
    const response = { id: 15, codigoSeguimiento: 'SOL-2026-00001' }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(response), { status: 201, headers: { 'Content-Type': 'application/json' } }))

    await expect(registrarArregloPago(values)).resolves.toEqual(response)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/solicitudes\/arreglo-pago$/)
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.method).toBe('POST')
    expect(JSON.parse(String(options.body))).toEqual(toArregloPagoPayload(values))
  })

  it('convierte el arreglo de errores del backend en un mensaje comprensible', () => {
    expect(getArregloPagoErrorMessage(new Error('HTTP 400: ["El plazo no es válido","La prima no puede ser negativa"]'))).toBe(
      'El plazo no es válido. La prima no puede ser negativa',
    )
  })
})
