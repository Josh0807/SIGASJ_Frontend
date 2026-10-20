import { describe, expect, it } from 'vitest'
import { DOCUMENT_REQUIREMENTS } from './documentRequirementsConfig'

describe('DOCUMENT_REQUIREMENTS', () => {
  it('define una configuración específica para los seis formularios oficiales', () => {
    expect(Object.keys(DOCUMENT_REQUIREMENTS)).toEqual([
      'arreglo-pago',
      'cambio-titular',
      'infraestructura-linderos',
      'afiliacion',
      'disponibilidad-servicios',
      'servicio-existente',
    ])
    expect(DOCUMENT_REQUIREMENTS['arreglo-pago'].documents[0].name).toBe('Copia de la cédula del propietario')
    expect(DOCUMENT_REQUIREMENTS['cambio-titular'].documents.some((item) => item.name === 'Poder o autorización')).toBe(true)
    expect(DOCUMENT_REQUIREMENTS['infraestructura-linderos'].documents.some((item) => item.name === 'Plano catastrado')).toBe(true)
    expect(DOCUMENT_REQUIREMENTS['disponibilidad-servicios'].documents.some((item) => item.kind === 'special')).toBe(true)
    expect(DOCUMENT_REQUIREMENTS['servicio-existente'].documents).toHaveLength(2)
  })

  it('no exige adjuntos adicionales para afiliación', () => {
    expect(DOCUMENT_REQUIREMENTS.afiliacion.allowAttachments).toBe(false)
    expect(DOCUMENT_REQUIREMENTS.afiliacion.documents).toEqual([])
  })

  it('no convierte requisitos condicionales en obligatorios', () => {
    for (const config of Object.values(DOCUMENT_REQUIREMENTS)) {
      for (const requirement of config.documents.filter((item) => item.kind !== 'required')) {
        expect(requirement.kind).not.toBe('required')
      }
    }
  })
})
