import { describe, expect, it } from 'vitest'
import {
  infraestructuraInmuebleSchema,
  infraestructuraNotificacionesSchema,
  infraestructuraPropositoSchema,
  infraestructuraServicioTitularSchema,
} from './infraestructuraLinderosSchemas'

describe('infraestructuraLinderosSchemas', () => {
  it('acepta persona física completa', () => {
    const result = infraestructuraServicioTitularSchema.safeParse({
      nis: 'NIS-1',
      tipoPersona: 'Persona física',
      nombreFisica: 'María',
      apellidosFisica: 'Rodríguez',
      identificacionFisica: '1-1234-0567',
      telefonoFisica: '8888-1234',
      razonSocial: '',
      cedulaJuridica: '',
      nombreRepresentante: '',
      identificacionRepresentante: '',
      telefonoRepresentante: '',
      calidadTitular: 'Propietario',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza persona física sin identificación', () => {
    const result = infraestructuraServicioTitularSchema.safeParse({
      nis: 'NIS-1',
      tipoPersona: 'Persona física',
      nombreFisica: 'María',
      apellidosFisica: 'Rodríguez',
      identificacionFisica: '',
      telefonoFisica: '8888-1234',
      razonSocial: '',
      cedulaJuridica: '',
      nombreRepresentante: '',
      identificacionRepresentante: '',
      telefonoRepresentante: '',
      calidadTitular: 'Propietario',
    })
    expect(result.success).toBe(false)
  })

  it('acepta persona jurídica y no exige campos físicos', () => {
    const result = infraestructuraServicioTitularSchema.safeParse({
      nis: 'NIS-2',
      tipoPersona: 'Persona jurídica',
      nombreFisica: '',
      apellidosFisica: '',
      identificacionFisica: '',
      telefonoFisica: '',
      razonSocial: 'Empresa SA',
      cedulaJuridica: '3-101-1',
      nombreRepresentante: 'Luis',
      identificacionRepresentante: '1-1111-1111',
      telefonoRepresentante: '8777-0000',
      calidadTitular: 'Representante legal',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza propósito inventado', () => {
    const result = infraestructuraPropositoSchema.safeParse({
      proposito: 'Ampliación inventada',
      planoAgrimensura: 'AG-1',
    })
    expect(result.success).toBe(false)
  })

  it('exige planoAgrimensura para Reunión de fincas', () => {
    const result = infraestructuraPropositoSchema.safeParse({
      proposito: 'Reunión de fincas',
      planoAgrimensura: '',
    })
    expect(result.success).toBe(false)
  })

  it('acepta inmueble con ubicación textual', () => {
    const result = infraestructuraInmuebleSchema.safeParse({
      provincia: 'San José',
      canton: 'Pérez Zeledón',
      distrito: 'San Isidro',
      direccionExacta: '100 m norte',
      folioReal: '',
      planoCatastrado: 'SJ-1',
      planoAgrimensura: '',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza correo inválido cuando el medio principal es correo', () => {
    const result = infraestructuraNotificacionesSchema.safeParse({
      medioNotificacionPrincipal: 'Correo electrónico',
      valorNotificacionPrincipal: 'no-es-correo',
      medioNotificacionSecundario: '',
      valorNotificacionSecundario: '',
    })
    expect(result.success).toBe(false)
  })
})
