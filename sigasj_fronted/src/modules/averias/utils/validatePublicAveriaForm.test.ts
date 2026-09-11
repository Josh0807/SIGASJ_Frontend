import { describe, expect, it } from 'vitest'
import { EMPTY_PUBLIC_AVERIA_FORM } from '../types/publicAveriaForm'
import { validatePublicAveriaForm } from './validatePublicAveriaForm'

const validValues = {
  ...EMPTY_PUBLIC_AVERIA_FORM,
  nombreReportante: 'María Rodríguez',
  telefonoReportante: '8888-8888',
  ubicacion: 'Frente a la escuela, 50 m sur',
  sectorComunidad: 'San Juan',
  descripcion: 'Se observa una fuga en la tubería de distribución.',
}

describe('validatePublicAveriaForm', () => {
  it('exige los campos obligatorios y no marca identificación ni correo vacíos', () => {
    const errors = validatePublicAveriaForm(EMPTY_PUBLIC_AVERIA_FORM)

    expect(errors.nombreReportante).toBe('Ingrese su nombre completo.')
    expect(errors.telefonoReportante).toBe('Ingrese un número telefónico de contacto.')
    expect(errors.ubicacion).toBe('Indique la ubicación de la avería.')
    expect(errors.sectorComunidad).toBe('Indique el sector o comunidad.')
    expect(errors.descripcion).toBe('Describa el problema reportado.')
    expect(errors.identificacionReportante).toBeUndefined()
    expect(errors.correoReportante).toBeUndefined()
  })

  it('trata espacios como vacíos en campos obligatorios', () => {
    const errors = validatePublicAveriaForm({
      ...EMPTY_PUBLIC_AVERIA_FORM,
      nombreReportante: '   ',
      telefonoReportante: '   ',
      ubicacion: '   ',
      sectorComunidad: '   ',
      descripcion: '   ',
    })

    expect(errors.nombreReportante).toBeDefined()
    expect(errors.telefonoReportante).toBeDefined()
    expect(errors.ubicacion).toBeDefined()
    expect(errors.sectorComunidad).toBeDefined()
    expect(errors.descripcion).toBeDefined()
  })

  it('acepta correo vacío y rechaza formato inválido', () => {
    expect(validatePublicAveriaForm(validValues).correoReportante).toBeUndefined()
    expect(
      validatePublicAveriaForm({ ...validValues, correoReportante: 'correo-invalido' })
        .correoReportante,
    ).toBe('Ingrese un correo electrónico válido.')
    expect(
      validatePublicAveriaForm({ ...validValues, correoReportante: 'maria@example.com' })
        .correoReportante,
    ).toBeUndefined()
  })

  it('acepta un reporte mínimo válido', () => {
    expect(validatePublicAveriaForm(validValues)).toEqual({})
  })
})
