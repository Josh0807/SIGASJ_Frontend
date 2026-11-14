import { describe, expect, it } from 'vitest'
import { LANDING_SECTION_IDS } from './landingSections'

describe('landingSections', () => {
  it('organiza las secciones en el orden definido', () => {
    expect(LANDING_SECTION_IDS).toEqual([
      'aviso-institucional',
      'accesos-rapidos',
      'sobre-nosotros',
      'solicitudes-servicio',
      'pagos',
      'reporte-averias',
      'quejas',
      'comunicados',
      'transparencia',
      'proyectos',
      'galeria',
      'contacto',
    ])
  })

  it('incluye las secciones reutilizables requeridas', () => {
    expect(LANDING_SECTION_IDS).toEqual(
      expect.arrayContaining([
        'aviso-institucional',
        'accesos-rapidos',
        'sobre-nosotros',
        'comunicados',
        'pagos',
        'reporte-averias',
        'quejas',
        'proyectos',
        'contacto',
      ]),
    )
  })
})
