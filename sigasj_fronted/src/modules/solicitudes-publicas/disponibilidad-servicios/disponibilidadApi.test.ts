import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getDisponibilidadErrorMessage,
  registrarDisponibilidadServicios,
  toDisponibilidadPayload,
} from './disponibilidadApi'
import type { DisponibilidadFormValues } from './types'

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
    localId: 'err',
    tipoDocumento: 'poder' as const,
    nombreOriginal: 'fail.pdf',
    tamanio: 50,
    tipoArchivo: 'application/pdf',
    estado: 'error' as const,
    errorMessage: 'falló',
  },
]

const valuesFisica: DisponibilidadFormValues = {
  tipoPersona: 'Persona física',
  nombreFisica: ' María Elena ',
  primerApellidoFisica: ' Rodríguez ',
  segundoApellidoFisica: ' Vargas ',
  identificacionFisica: ' 1-1234-0567 ',
  telefonoFisica: ' 8888-1234 ',
  razonSocial: ' NO ENVIAR ',
  identificacionJuridica: ' NO ENVIAR ',
  nombreRepresentante: ' NO ENVIAR ',
  identificacionRepresentante: ' NO ENVIAR ',
  telefonoRepresentante: ' NO ENVIAR ',
  medioNotificacionPrincipal: 'Correo electrónico',
  valorNotificacionPrincipal: ' maria@ejemplo.com ',
  medioNotificacionSecundario: '',
  valorNotificacionSecundario: '',
  provincia: ' San José ',
  canton: ' Pérez Zeledón ',
  distrito: ' San Isidro de El General ',
  direccionExacta: ' 100 m norte ',
  folioReal: ' 123456-000 ',
  planoCatastrado: ' SJ-1 ',
  planoAgrimensura: '',
  nis: ' NIS-77881 ',
  naturalezaInmueble: 'Inscrito',
  calidadTitular: 'Propietario',
  proposito: 'Fraccionamiento',
  numeroDisponibilidadAnterior: '',
  descripcionProyecto: ' Construcción de 4 unidades ',
  cantidadDormitorios: '3',
  unidadesHabitacionales: '4',
  areaConstruccion: '185.50',
  niveles: '2',
  caudalRequerido: '0.7500',
  autorizacionInspeccion: true,
  firma: 'data:image/png;base64,abc',
  documentos: docsCargados,
}

describe('disponibilidadApi', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('normaliza persona física y omite campos jurídicos y docs con error', () => {
    const payload = toDisponibilidadPayload(valuesFisica)
    expect(payload).toEqual({
      tipoPersona: 'Persona física',
      nombreFisica: 'María Elena',
      primerApellidoFisica: 'Rodríguez',
      segundoApellidoFisica: 'Vargas',
      identificacionFisica: '1-1234-0567',
      telefonoFisica: '8888-1234',
      medioNotificacionPrincipal: 'Correo electrónico',
      valorNotificacionPrincipal: 'maria@ejemplo.com',
      provincia: 'San José',
      canton: 'Pérez Zeledón',
      distrito: 'San Isidro de El General',
      direccionExacta: '100 m norte',
      folioReal: '123456-000',
      planoCatastrado: 'SJ-1',
      nis: 'NIS-77881',
      naturalezaInmueble: 'Inscrito',
      calidadTitular: 'Propietario',
      proposito: 'Fraccionamiento',
      descripcionProyecto: 'Construcción de 4 unidades',
      cantidadDormitorios: 3,
      unidadesHabitacionales: 4,
      areaConstruccion: 185.5,
      niveles: 2,
      caudalRequerido: 0.75,
      autorizacionInspeccion: true,
      firma: 'data:image/png;base64,abc',
      documentos: [
        { id: 11, tokenReclamo: 'tok-id' },
        { id: 12, tokenReclamo: 'tok-pc' },
      ],
    })
    expect(payload).not.toHaveProperty('razonSocial')
    expect(payload).not.toHaveProperty('numeroDisponibilidadAnterior')
    expect(payload).not.toHaveProperty('planoAgrimensura')
  })

  it('normaliza persona jurídica y omite campos físicos', () => {
    const payload = toDisponibilidadPayload({
      ...valuesFisica,
      tipoPersona: 'Persona jurídica',
      razonSocial: ' Empresa SA ',
      identificacionJuridica: ' 3-101-1 ',
      nombreRepresentante: ' Luis ',
      identificacionRepresentante: ' 1-1111-1111 ',
      telefonoRepresentante: ' 8777-0000 ',
      numeroDisponibilidadAnterior: ' DISP-1 ',
      cantidadDormitorios: '',
      unidadesHabitacionales: '',
      areaConstruccion: '',
      niveles: '',
      caudalRequerido: '',
      firma: '',
    })
    expect(payload.tipoPersona).toBe('Persona jurídica')
    expect(payload.razonSocial).toBe('Empresa SA')
    expect(payload.identificacionJuridica).toBe('3-101-1')
    expect(payload.numeroDisponibilidadAnterior).toBe('DISP-1')
    expect(payload).not.toHaveProperty('nombreFisica')
    expect(payload).not.toHaveProperty('cantidadDormitorios')
    expect(payload).not.toHaveProperty('firma')
  })

  it('envía POST al endpoint de disponibilidad-servicios', async () => {
    const response = {
      id: 1,
      codigoSeguimiento: 'DISP-001',
      fechaIngreso: '2026-10-23',
      detalleDisponibilidadServicios: {
        id: 9,
        solicitudId: 1,
        tipoPersona: 'Persona física',
        proposito: 'Fraccionamiento',
        descripcionProyecto: 'Construcción de 4 unidades',
      },
    }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      registrarDisponibilidadServicios(valuesFisica),
    ).resolves.toEqual(response)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(
      /\/solicitudes\/disponibilidad-servicios$/,
    )
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.method).toBe('POST')
    expect(JSON.parse(String(options.body))).toEqual(
      toDisponibilidadPayload(valuesFisica),
    )
  })

  it('mapea mensajes de error del backend', () => {
    expect(
      getDisponibilidadErrorMessage(
        new Error('HTTP 400: ["La descripción del proyecto es obligatoria"]'),
      ),
    ).toBe('La descripción del proyecto es obligatoria')
    expect(getDisponibilidadErrorMessage(new Error('HTTP 500: Fallo'))).toBe(
      'Fallo',
    )
    expect(getDisponibilidadErrorMessage('x')).toContain(
      'No fue posible registrar',
    )
  })
})
