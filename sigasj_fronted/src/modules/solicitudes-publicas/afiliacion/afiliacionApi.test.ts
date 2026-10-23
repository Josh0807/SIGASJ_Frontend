import { describe, expect, it, vi } from 'vitest'
import { toAfiliacionPayload } from './afiliacionApi'
import type { AfiliacionFormValues } from './types'

vi.mock('../../../services/http/httpClient', () => ({
  fetchWithAuth: vi.fn(),
}))

const baseValues: AfiliacionFormValues = {
  fechaSolicitud: '2026-10-23',
  nombre: '  María Elena Rodríguez Vargas  ',
  identificacion: '  01-0234-0567  ',
  vecinoDe: ' San Juan ',
  estadoCivil: ' Casado(a) ',
  telefono: ' 8888-1234 ',
  correoElectronico: ' maria@ejemplo.com ',
  numeroAbonado: ' 0045892 ',
  numeroPlano: ' SJ-1 ',
  folioReal: ' 123456-000 ',
  firmaSolicitante: ' data:image/png;base64,AAA ',
  recomendacion1Nombre: ' Carlos Mora ',
  recomendacion1Identificacion: ' 1-0987-6543 ',
  recomendacion1NumeroAbonado: ' 12045 ',
  recomendacion1Firma: ' data:image/png;base64,rec1 ',
  recomendacion2Nombre: ' Ana Vargas ',
  recomendacion2Identificacion: ' 1-2345-6789 ',
  recomendacion2NumeroAbonado: ' 13088 ',
  recomendacion2Firma: ' data:image/png;base64,rec2 ',
}

describe('toAfiliacionPayload', () => {
  it('envía solo campos del DTO 4.7.2 con trim', () => {
    const payload = toAfiliacionPayload(baseValues)

    expect(payload).toEqual({
      fechaSolicitud: '2026-10-23',
      nombre: 'María Elena Rodríguez Vargas',
      identificacion: '01-0234-0567',
      vecinoDe: 'San Juan',
      estadoCivil: 'Casado(a)',
      telefono: '8888-1234',
      correoElectronico: 'maria@ejemplo.com',
      numeroAbonado: '0045892',
      numeroPlano: 'SJ-1',
      folioReal: '123456-000',
      firmaSolicitante: 'data:image/png;base64,AAA',
      recomendacion1Nombre: 'Carlos Mora',
      recomendacion1Identificacion: '1-0987-6543',
      recomendacion1NumeroAbonado: '12045',
      recomendacion1Firma: 'data:image/png;base64,rec1',
      recomendacion2Nombre: 'Ana Vargas',
      recomendacion2Identificacion: '1-2345-6789',
      recomendacion2NumeroAbonado: '13088',
      recomendacion2Firma: 'data:image/png;base64,rec2',
    })
    expect(payload).not.toHaveProperty('estado')
    expect(payload).not.toHaveProperty('solicitudId')
    expect(payload).not.toHaveProperty('fechaSesion')
    expect(payload).not.toHaveProperty('numeroAcuerdo')
    expect(payload).not.toHaveProperty('revisadoPor')
    expect(payload).not.toHaveProperty('currentStep')
  })

  it('omite folio y firmas vacías', () => {
    const payload = toAfiliacionPayload({
      ...baseValues,
      folioReal: '   ',
      firmaSolicitante: '',
      recomendacion1Firma: '',
      recomendacion2Firma: '',
    })

    expect(payload).not.toHaveProperty('folioReal')
    expect(payload).not.toHaveProperty('firmaSolicitante')
    expect(payload).not.toHaveProperty('recomendacion1Firma')
    expect(payload).not.toHaveProperty('recomendacion2Firma')
    expect(payload.recomendacion1Nombre).toBe('Carlos Mora')
    expect(payload.recomendacion2Nombre).toBe('Ana Vargas')
  })

  it('mantiene recomendaciones independientes en el payload', () => {
    const payload = toAfiliacionPayload(baseValues)
    expect(payload.recomendacion1Identificacion).not.toBe(
      payload.recomendacion2Identificacion,
    )
    expect(payload.recomendacion1NumeroAbonado).not.toBe(
      payload.recomendacion2NumeroAbonado,
    )
  })
})
