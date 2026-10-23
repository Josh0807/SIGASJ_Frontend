import { describe, expect, it } from 'vitest'
import { arregloPagoApplicantSchema, arregloPagoDocumentsSchema, arregloPagoServiceSchema } from './arregloPagoSchemas'
import { PLAZOS_ARREGLO_PAGO } from './types'

describe('validación de arreglo de pago', () => {
  it('acepta todos los plazos oficiales y rechaza valores ajenos', () => {
    for (const plazoSeleccionado of PLAZOS_ARREGLO_PAGO) {
      expect(arregloPagoServiceSchema.safeParse({ numeroCuentaServicio: 'CTA-1', montoPrimaInicial: '0', plazoSeleccionado }).success).toBe(true)
    }
    expect(arregloPagoServiceSchema.safeParse({ numeroCuentaServicio: 'CTA-1', montoPrimaInicial: '0', plazoSeleccionado: '' }).success).toBe(false)
    expect(arregloPagoServiceSchema.safeParse({ numeroCuentaServicio: 'CTA-1', montoPrimaInicial: '-1', plazoSeleccionado: '6 meses' }).success).toBe(false)
  })

  it('respeta obligatoriedad y longitudes máximas del backend', () => {
    expect(arregloPagoApplicantSchema.safeParse({ nombre: '', cedula: '', vecinoDe: '', telefono: '' }).success).toBe(false)
    expect(arregloPagoApplicantSchema.safeParse({ nombre: 'A'.repeat(151), cedula: '1', vecinoDe: 'San Juan', telefono: '8888-1234' }).success).toBe(false)
    expect(arregloPagoApplicantSchema.safeParse({ nombre: 'Ana Rodríguez', cedula: '1-1234-0567', vecinoDe: 'San Juan', telefono: '8888-1234' }).success).toBe(true)
  })

  it('requiere al menos un documento y mantiene la firma opcional', () => {
    expect(arregloPagoDocumentsSchema.safeParse({ documentos: [], firma: '' }).success).toBe(false)
    expect(arregloPagoDocumentsSchema.safeParse({ documentos: [new File(['x'], 'documento.pdf')], firma: '' }).success).toBe(true)
  })
})
