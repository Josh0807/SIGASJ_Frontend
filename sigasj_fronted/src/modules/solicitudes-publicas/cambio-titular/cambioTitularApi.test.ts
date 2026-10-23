import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getCambioTitularErrorMessage,
  registrarCambioTitular,
  toCambioTitularPayload,
} from './cambioTitularApi'
import type { CambioTitularFormValues } from './types'

const values: CambioTitularFormValues = {
  nombreSolicitante: '  Ana Lucía Vargas Quirós ',
  identificacionSolicitante: ' 1-1234-0567 ',
  telefono: ' 8888-1234 ',
  nombrePropietarioRegistral: ' Carlos Alberto Mora Jiménez ',
  identificacionPropietario: ' 1-0987-6543 ',
  folioReal: ' 123456-000 ',
  planoCatastrado: '',
  planoAgrimensura: '  ',
  naturalezaInmueble: 'Inscrito',
  calidadTitular: 'Propietario',
  nis: ' NIS-45892 ',
  facturaANombreDe: ' Carlos Alberto Mora Jiménez ',
  medioNotificacionPrincipal: 'Correo electrónico',
  medioNotificacionSecundario: '',
  firma: 'data:image/png;base64,abc',
  documentos: [
    new File(['contenido'], 'cedula.pdf', { type: 'application/pdf' }),
  ],
}

describe('cambioTitularApi', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('normaliza el formulario al contrato JSON del backend sin campos UI', () => {
    const payload = toCambioTitularPayload(values)
    expect(payload).toEqual({
      nombreSolicitante: 'Ana Lucía Vargas Quirós',
      identificacionSolicitante: '1-1234-0567',
      telefono: '8888-1234',
      nombrePropietarioRegistral: 'Carlos Alberto Mora Jiménez',
      identificacionPropietario: '1-0987-6543',
      folioReal: '123456-000',
      naturalezaInmueble: 'Inscrito',
      calidadTitular: 'Propietario',
      nis: 'NIS-45892',
      facturaANombreDe: 'Carlos Alberto Mora Jiménez',
      medioNotificacionPrincipal: 'Correo electrónico',
      firma: 'data:image/png;base64,abc',
    })
    expect(payload).not.toHaveProperty('documentos')
    expect(payload).not.toHaveProperty('estado')
    expect(payload).not.toHaveProperty('solicitudId')
    expect(payload).not.toHaveProperty('medioNotificacionSecundario')
    expect(payload).not.toHaveProperty('planoCatastrado')
    expect(payload).not.toHaveProperty('planoAgrimensura')
  })

  it('incluye medio secundario solo cuando el usuario lo selecciona', () => {
    expect(
      toCambioTitularPayload({
        ...values,
        medioNotificacionSecundario: 'Teléfono',
      }),
    ).toMatchObject({
      medioNotificacionSecundario: 'Teléfono',
    })
  })

  it('registra la solicitud en el endpoint público de cambio de titular', async () => {
    const response = {
      id: 22,
      codigoSeguimiento: 'SOL-2026-00022',
      fechaIngreso: '2026-04-10',
    }
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify(response), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    await expect(registrarCambioTitular(values)).resolves.toEqual(response)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(
      /\/solicitudes\/cambio-titular$/,
    )
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.method).toBe('POST')
    expect(JSON.parse(String(options.body))).toEqual(
      toCambioTitularPayload(values),
    )
  })

  it('convierte el arreglo de errores del backend en un mensaje comprensible', () => {
    expect(
      getCambioTitularErrorMessage(
        new Error(
          'HTTP 400: ["La naturaleza del inmueble no es válida","El NIS es obligatorio"]',
        ),
      ),
    ).toBe(
      'La naturaleza del inmueble no es válida. El NIS es obligatorio',
    )
  })
})
