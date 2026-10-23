import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getInfraestructuraLinderosErrorMessage,
  registrarInfraestructuraLinderos,
  toInfraestructuraLinderosPayload,
} from './infraestructuraLinderosApi'
import type { InfraestructuraLinderosFormValues } from './types'

const docsCargados = [
  {
    localId: 'a',
    tipoDocumento: 'identificacion' as const,
    nombreOriginal: 'cedula.pdf',
    tamanio: 100,
    tipoArchivo: 'application/pdf',
    estado: 'cargado' as const,
    id: 11,
    tokenReclamo: 'tok-id',
  },
  {
    localId: 'b',
    tipoDocumento: 'plano-catastrado' as const,
    nombreOriginal: 'plano.pdf',
    tamanio: 200,
    tipoArchivo: 'application/pdf',
    estado: 'cargado' as const,
    id: 12,
    tokenReclamo: 'tok-pc',
  },
  {
    localId: 'c',
    tipoDocumento: 'plano-agrimensura' as const,
    nombreOriginal: 'agrimensura.pdf',
    tamanio: 300,
    tipoArchivo: 'application/pdf',
    estado: 'cargado' as const,
    id: 13,
    tokenReclamo: 'tok-pa',
  },
]

const valuesFisica: InfraestructuraLinderosFormValues = {
  nis: ' NIS-77881 ',
  tipoPersona: 'Persona física',
  nombreFisica: ' María Elena ',
  apellidosFisica: ' Rodríguez Vargas ',
  identificacionFisica: ' 1-1234-0567 ',
  telefonoFisica: ' 8888-1234 ',
  razonSocial: ' NO ENVIAR ',
  cedulaJuridica: ' NO ENVIAR ',
  nombreRepresentante: ' NO ENVIAR ',
  identificacionRepresentante: ' NO ENVIAR ',
  telefonoRepresentante: ' NO ENVIAR ',
  calidadTitular: 'Propietario',
  provincia: ' San José ',
  canton: ' Pérez Zeledón ',
  distrito: ' San Isidro de El General ',
  direccionExacta: ' 100 m norte ',
  folioReal: ' 123456-000 ',
  planoCatastrado: ' SJ-1 ',
  planoAgrimensura: ' AG-1 ',
  proposito: 'Reunión de fincas',
  medioNotificacionPrincipal: 'Correo electrónico',
  valorNotificacionPrincipal: ' maria@ejemplo.com ',
  medioNotificacionSecundario: '',
  valorNotificacionSecundario: '',
  firma: 'data:image/png;base64,abc',
  documentos: docsCargados,
}

describe('infraestructuraLinderosApi', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('normaliza persona física y envía solo referencias de documentos cargados', () => {
    const payload = toInfraestructuraLinderosPayload(valuesFisica)
    expect(payload).toEqual({
      nis: 'NIS-77881',
      tipoPersona: 'Persona física',
      nombreFisica: 'María Elena',
      apellidosFisica: 'Rodríguez Vargas',
      identificacionFisica: '1-1234-0567',
      telefonoFisica: '8888-1234',
      calidadTitular: 'Propietario',
      provincia: 'San José',
      canton: 'Pérez Zeledón',
      distrito: 'San Isidro de El General',
      direccionExacta: '100 m norte',
      folioReal: '123456-000',
      planoCatastrado: 'SJ-1',
      planoAgrimensura: 'AG-1',
      proposito: 'Reunión de fincas',
      medioNotificacionPrincipal: 'Correo electrónico',
      valorNotificacionPrincipal: 'maria@ejemplo.com',
      firma: 'data:image/png;base64,abc',
      documentos: [
        { id: 11, tokenReclamo: 'tok-id' },
        { id: 12, tokenReclamo: 'tok-pc' },
        { id: 13, tokenReclamo: 'tok-pa' },
      ],
    })
    expect(payload.documentos.every((d) => 'id' in d && 'tokenReclamo' in d)).toBe(
      true,
    )
    expect(payload).not.toHaveProperty('razonSocial')
    expect(payload).not.toHaveProperty('cedulaJuridica')
    expect(payload).not.toHaveProperty('estado')
    expect(payload).not.toHaveProperty('solicitudId')
    expect(payload).not.toHaveProperty('medioNotificacionSecundario')
  })

  it('omite documentos en estado subiendo o error del payload', () => {
    const payload = toInfraestructuraLinderosPayload({
      ...valuesFisica,
      documentos: [
        ...docsCargados,
        {
          localId: 'x',
          tipoDocumento: 'poder',
          nombreOriginal: 'fallido.pdf',
          tamanio: 10,
          tipoArchivo: 'application/pdf',
          estado: 'error',
          errorMessage: 'falló',
        },
        {
          localId: 'y',
          tipoDocumento: 'poder',
          nombreOriginal: 'pendiente.pdf',
          tamanio: 10,
          tipoArchivo: 'application/pdf',
          estado: 'subiendo',
        },
      ],
    })
    expect(payload.documentos).toHaveLength(3)
  })

  it('normaliza persona jurídica sin campos físicos', () => {
    const payload = toInfraestructuraLinderosPayload({
      ...valuesFisica,
      tipoPersona: 'Persona jurídica',
      razonSocial: ' Inversiones del Valle S.A. ',
      cedulaJuridica: ' 3-101-123456 ',
      nombreRepresentante: ' Luis Mora ',
      identificacionRepresentante: ' 1-0987-6543 ',
      telefonoRepresentante: ' 8777-4321 ',
    })
    expect(payload.tipoPersona).toBe('Persona jurídica')
    expect(payload.razonSocial).toBe('Inversiones del Valle S.A.')
    expect(payload.cedulaJuridica).toBe('3-101-123456')
    expect(payload).not.toHaveProperty('nombreFisica')
    expect(payload).not.toHaveProperty('identificacionFisica')
  })

  it('incluye medio secundario solo cuando el usuario lo selecciona', () => {
    expect(
      toInfraestructuraLinderosPayload({
        ...valuesFisica,
        medioNotificacionSecundario: 'Teléfono',
        valorNotificacionSecundario: '8888-0000',
      }),
    ).toMatchObject({
      medioNotificacionSecundario: 'Teléfono',
      valorNotificacionSecundario: '8888-0000',
    })
  })

  it('registra la solicitud en el endpoint público', async () => {
    const response = {
      id: 33,
      codigoSeguimiento: 'SOL-2026-00033',
      fechaIngreso: '2026-04-10',
    }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      registrarInfraestructuraLinderos(valuesFisica),
    ).resolves.toEqual(response)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(
      /\/solicitudes\/infraestructura-linderos$/,
    )
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.method).toBe('POST')
    expect(JSON.parse(String(options.body))).toEqual(
      toInfraestructuraLinderosPayload(valuesFisica),
    )
  })

  it('convierte errores del backend en mensaje comprensible', () => {
    expect(
      getInfraestructuraLinderosErrorMessage(
        new Error(
          'HTTP 400: ["El propósito no es válido","El NIS es obligatorio"]',
        ),
      ),
    ).toBe('El propósito no es válido. El NIS es obligatorio')
  })
})
