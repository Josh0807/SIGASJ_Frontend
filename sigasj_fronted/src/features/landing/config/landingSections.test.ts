import { describe, expect, it } from 'vitest'
import { LANDING_SECTION_IDS } from './landingSections'

describe('landingSections', () => {
  it('organiza las secciones en el orden definido', () => {
    expect(LANDING_SECTION_IDS).toEqual([
      'sobre-nosotros',
      'comunicados',
      'transparencia',
      'solicitudes-servicio',
      'reporte-averias',
      'proyectos',
      'galeria',
      'contacto',
    ])
  })

  it('incluye las secciones reutilizables requeridas', () => {
    expect(LANDING_SECTION_IDS).toEqual(
      expect.arrayContaining([
        'sobre-nosotros',
        'comunicados',
        'reporte-averias',
        'proyectos',
        'contacto',
      ]),
    )
  })
})
