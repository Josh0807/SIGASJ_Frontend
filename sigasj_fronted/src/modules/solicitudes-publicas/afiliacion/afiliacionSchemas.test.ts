import { describe, expect, it } from 'vitest'
import {
  afiliacionAbonadoInmuebleSchema,
  afiliacionFirmaSchema,
  afiliacionPersonalesSchema,
  afiliacionRecomendacion1Schema,
  afiliacionRecomendacion2Schema,
} from './afiliacionSchemas'

describe('afiliacionSchemas', () => {
  const personalesValidos = {
    fechaSolicitud: '2026-10-23',
    nombre: 'María Elena Rodríguez Vargas',
    identificacion: '1-0234-0567',
    vecinoDe: 'San Juan, 200 m norte',
    estadoCivil: 'Casado(a)',
    telefono: '8888-1234',
    correoElectronico: 'maria@ejemplo.com',
  }

  it('acepta datos personales válidos', () => {
    expect(afiliacionPersonalesSchema.safeParse(personalesValidos).success).toBe(
      true,
    )
  })

  it('rechaza correo inválido', () => {
    const result = afiliacionPersonalesSchema.safeParse({
      ...personalesValidos,
      correoElectronico: 'no-es-correo',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza fecha con formato inválido', () => {
    const result = afiliacionPersonalesSchema.safeParse({
      ...personalesValidos,
      fechaSolicitud: '23/10/2026',
    })
    expect(result.success).toBe(false)
  })

  it('exige número de abonado y plano; folio opcional', () => {
    expect(
      afiliacionAbonadoInmuebleSchema.safeParse({
        numeroAbonado: '45892',
        numeroPlano: 'SJ-1',
        folioReal: '',
      }).success,
    ).toBe(true)
    expect(
      afiliacionAbonadoInmuebleSchema.safeParse({
        numeroAbonado: '',
        numeroPlano: 'SJ-1',
        folioReal: '',
      }).success,
    ).toBe(false)
  })

  it('exige recomendación 1 completa (firma opcional)', () => {
    expect(
      afiliacionRecomendacion1Schema.safeParse({
        recomendacion1Nombre: 'Carlos Mora',
        recomendacion1Identificacion: '1-0987-6543',
        recomendacion1NumeroAbonado: '12045',
        recomendacion1Firma: '',
      }).success,
    ).toBe(true)
    expect(
      afiliacionRecomendacion1Schema.safeParse({
        recomendacion1Nombre: '',
        recomendacion1Identificacion: '1-0987-6543',
        recomendacion1NumeroAbonado: '12045',
        recomendacion1Firma: '',
      }).success,
    ).toBe(false)
  })

  it('exige recomendación 2 completa de forma independiente', () => {
    expect(
      afiliacionRecomendacion2Schema.safeParse({
        recomendacion2Nombre: 'Ana Vargas',
        recomendacion2Identificacion: '1-2345-6789',
        recomendacion2NumeroAbonado: '13088',
        recomendacion2Firma: '',
      }).success,
    ).toBe(true)
    expect(
      afiliacionRecomendacion2Schema.safeParse({
        recomendacion2Nombre: 'Ana Vargas',
        recomendacion2Identificacion: '',
        recomendacion2NumeroAbonado: '13088',
        recomendacion2Firma: '',
      }).success,
    ).toBe(false)
  })

  it('exige la firma del solicitante', () => {
    expect(
      afiliacionFirmaSchema.safeParse({ firmaSolicitante: '' }).success,
    ).toBe(false)
    expect(
      afiliacionFirmaSchema.safeParse({ firmaSolicitante: 'data:image/png;base64,abc' }).success,
    ).toBe(true)
  })
})
