import { describe, expect, it } from 'vitest'
import {
  disponibilidadDocumentosSchema,
  disponibilidadInmuebleSchema,
  disponibilidadNaturalezaCalidadSchema,
  disponibilidadPropositoSchema,
  disponibilidadProyectoSchema,
  disponibilidadSolicitanteSchema,
} from './disponibilidadSchemas'
import { PROPOSITOS } from './types'

describe('disponibilidadSchemas', () => {
  it('acepta persona física completa', () => {
    const result = disponibilidadSolicitanteSchema.safeParse({
      tipoPersona: 'Persona física',
      nombreFisica: 'María',
      primerApellidoFisica: 'Rodríguez',
      segundoApellidoFisica: 'Vargas',
      identificacionFisica: '1-1234-0567',
      telefonoFisica: '8888-1234',
      razonSocial: '',
      identificacionJuridica: '',
      nombreRepresentante: '',
      identificacionRepresentante: '',
      telefonoRepresentante: '',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza persona física sin identificación', () => {
    const result = disponibilidadSolicitanteSchema.safeParse({
      tipoPersona: 'Persona física',
      nombreFisica: 'María',
      primerApellidoFisica: 'Rodríguez',
      segundoApellidoFisica: 'Vargas',
      identificacionFisica: '',
      telefonoFisica: '8888-1234',
      razonSocial: '',
      identificacionJuridica: '',
      nombreRepresentante: '',
      identificacionRepresentante: '',
      telefonoRepresentante: '',
    })
    expect(result.success).toBe(false)
  })

  it('acepta persona jurídica y no exige campos físicos', () => {
    const result = disponibilidadSolicitanteSchema.safeParse({
      tipoPersona: 'Persona jurídica',
      nombreFisica: '',
      primerApellidoFisica: '',
      segundoApellidoFisica: '',
      identificacionFisica: '',
      telefonoFisica: '',
      razonSocial: 'Empresa SA',
      identificacionJuridica: '3-101-1',
      nombreRepresentante: 'Luis',
      identificacionRepresentante: '1-1111-1111',
      telefonoRepresentante: '8777-0000',
    })
    expect(result.success).toBe(true)
  })

  it('exige al menos un plano textual en inmueble', () => {
    const sinPlanos = disponibilidadInmuebleSchema.safeParse({
      provincia: 'San José',
      canton: 'Pérez Zeledón',
      distrito: 'San Isidro',
      direccionExacta: '100 m norte',
      folioReal: '',
      planoCatastrado: '',
      planoAgrimensura: '',
      nis: '',
    })
    expect(sinPlanos.success).toBe(false)

    const conCatastrado = disponibilidadInmuebleSchema.safeParse({
      provincia: 'San José',
      canton: 'Pérez Zeledón',
      distrito: 'San Isidro',
      direccionExacta: '100 m norte',
      folioReal: '',
      planoCatastrado: 'SJ-1',
      planoAgrimensura: '',
      nis: '',
    })
    expect(conCatastrado.success).toBe(true)
  })

  it('acepta todas las naturalezas y calidades oficiales', () => {
    for (const naturaleza of ['Inscrito', 'Sin inscribir'] as const) {
      for (const calidad of [
        'Propietario',
        'Poseedor',
        'Representante legal',
      ] as const) {
        expect(
          disponibilidadNaturalezaCalidadSchema.safeParse({
            naturalezaInmueble: naturaleza,
            calidadTitular: calidad,
          }).success,
        ).toBe(true)
      }
    }
  })

  it('acepta todos los propósitos oficiales y rechaza inventados', () => {
    for (const proposito of PROPOSITOS) {
      const result = disponibilidadPropositoSchema.safeParse({
        proposito,
        numeroDisponibilidadAnterior: '',
        planoCatastrado:
          proposito === 'Estación de combustible' ? 'SJ-1' : 'SJ-1',
        planoAgrimensura: '',
      })
      expect(result.success).toBe(true)
    }
    expect(
      disponibilidadPropositoSchema.safeParse({
        proposito: 'Ampliación inventada',
        numeroDisponibilidadAnterior: '',
        planoCatastrado: 'SJ-1',
        planoAgrimensura: '',
      }).success,
    ).toBe(false)
  })

  it('exige plano catastrado textual para Estación de combustible', () => {
    const result = disponibilidadPropositoSchema.safeParse({
      proposito: 'Estación de combustible',
      numeroDisponibilidadAnterior: '',
      planoCatastrado: '',
      planoAgrimensura: 'AG-1',
    })
    expect(result.success).toBe(false)
  })

  it('exige descripción del proyecto y acepta decimales opcionales', () => {
    expect(
      disponibilidadProyectoSchema.safeParse({
        descripcionProyecto: '   ',
        cantidadDormitorios: '',
        unidadesHabitacionales: '',
        areaConstruccion: '',
        niveles: '',
        caudalRequerido: '',
      }).success,
    ).toBe(false)

    const ok = disponibilidadProyectoSchema.safeParse({
      descripcionProyecto: 'Urbanización fase 1',
      cantidadDormitorios: '2',
      unidadesHabitacionales: '4',
      areaConstruccion: '120.55',
      niveles: '2',
      caudalRequerido: '0.125',
    })
    expect(ok.success).toBe(true)
  })

  it('exige identificación cargada y no permite docs en error', () => {
    const sinDocs = disponibilidadDocumentosSchema.safeParse({
      proposito: 'Fraccionamiento',
      calidadTitular: 'Propietario',
      planoCatastrado: 'SJ-1',
      documentos: [],
      autorizacionInspeccion: true,
    })
    expect(sinDocs.success).toBe(false)

    const conError = disponibilidadDocumentosSchema.safeParse({
      proposito: 'Fraccionamiento',
      calidadTitular: 'Propietario',
      planoCatastrado: 'SJ-1',
      autorizacionInspeccion: false,
      documentos: [
        {
          localId: '1',
          tipoDocumento: 'identificacion',
          nombreOriginal: 'a.pdf',
          tamanio: 1,
          tipoArchivo: 'application/pdf',
          estado: 'error',
        },
      ],
    })
    expect(conError.success).toBe(false)
  })
})
