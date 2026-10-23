import { describe, expect, it } from 'vitest'
import {
  cambioTitularDocumentosSchema,
  cambioTitularNotificacionesSchema,
  cambioTitularPropietarioInmuebleSchema,
  cambioTitularServicioSchema,
  cambioTitularSolicitanteSchema,
} from './cambioTitularSchemas'

describe('cambioTitularSchemas', () => {
  it('valida el paso de solicitante', () => {
    expect(
      cambioTitularSolicitanteSchema.safeParse({
        nombreSolicitante: '',
        identificacionSolicitante: '1-1234-0567',
        telefono: '8888-1234',
      }).success,
    ).toBe(false)

    expect(
      cambioTitularSolicitanteSchema.safeParse({
        nombreSolicitante: 'Ana Lucía Vargas',
        identificacionSolicitante: '1-1234-0567',
        telefono: '8888-1234',
      }).success,
    ).toBe(true)
  })

  it('exige naturaleza y calidad oficiales en propietario/inmueble', () => {
    const base = {
      nombrePropietarioRegistral: 'Carlos Mora',
      identificacionPropietario: '1-0987-6543',
      folioReal: '',
      planoCatastrado: '',
      planoAgrimensura: '',
      naturalezaInmueble: 'Inscrito',
      calidadTitular: 'Propietario',
    }

    expect(cambioTitularPropietarioInmuebleSchema.safeParse(base).success).toBe(
      true,
    )
    expect(
      cambioTitularPropietarioInmuebleSchema.safeParse({
        ...base,
        naturalezaInmueble: 'Alquilado',
      }).success,
    ).toBe(false)
    expect(
      cambioTitularPropietarioInmuebleSchema.safeParse({
        ...base,
        calidadTitular: 'Arrendatario',
      }).success,
    ).toBe(false)
  })

  it('valida NIS y facturaANombreDe como texto requerido', () => {
    expect(
      cambioTitularServicioSchema.safeParse({
        nis: 'NIS-45892',
        facturaANombreDe: 'Carlos Mora',
      }).success,
    ).toBe(true)
    expect(
      cambioTitularServicioSchema.safeParse({
        nis: '',
        facturaANombreDe: 'Carlos Mora',
      }).success,
    ).toBe(false)
  })

  it('exige medio principal y permite omitir el secundario', () => {
    expect(
      cambioTitularNotificacionesSchema.safeParse({
        medioNotificacionPrincipal: 'Correo electrónico',
        medioNotificacionSecundario: '',
      }).success,
    ).toBe(true)
    expect(
      cambioTitularNotificacionesSchema.safeParse({
        medioNotificacionPrincipal: 'Correo electrónico',
        medioNotificacionSecundario: 'Teléfono',
      }).success,
    ).toBe(true)
    expect(
      cambioTitularNotificacionesSchema.safeParse({
        medioNotificacionPrincipal: '',
        medioNotificacionSecundario: '',
      }).success,
    ).toBe(false)
    expect(
      cambioTitularNotificacionesSchema.safeParse({
        medioNotificacionPrincipal: 'WhatsApp',
        medioNotificacionSecundario: '',
      }).success,
    ).toBe(false)
  })

  it('exige al menos un documento y acepta firma vacía', () => {
    expect(
      cambioTitularDocumentosSchema.safeParse({
        documentos: [],
        firma: '',
      }).success,
    ).toBe(false)
    expect(
      cambioTitularDocumentosSchema.safeParse({
        documentos: [
          new File(['x'], 'cedula.pdf', { type: 'application/pdf' }),
        ],
        firma: '',
      }).success,
    ).toBe(true)
  })
})
