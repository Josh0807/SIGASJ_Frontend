import { describe, expect, it } from 'vitest'
import { agruparColaFontanero } from './colaFontanero'
import type { AveriaFontaneroListItem } from './types'

const item = (
  overrides: Partial<AveriaFontaneroListItem> & Pick<AveriaFontaneroListItem, 'id' | 'estado' | 'prioridad'>,
): AveriaFontaneroListItem => ({
  codigoSeguimiento: `AV-${overrides.id}`,
  fechaAsignacion: '2026-09-01T12:00:00.000Z',
  sectorComunidad: 'San Juan',
  ubicacion: 'Frente a la escuela',
  descripcion: 'Fuga',
  tipoAveria: 'TUBO_MADRE',
  fechaInicioAtencion: null,
  ...overrides,
})

describe('cola del fontanero', () => {
  it('separa en atención, asignadas y pendientes, y ordena Alta, Media y Baja', () => {
    const grupos = agruparColaFontanero([
      item({ id: 1, estado: 'ASIGNADA', prioridad: 'BAJA' }),
      item({ id: 2, estado: 'PENDIENTE', prioridad: 'ALTA' }),
      item({ id: 3, estado: 'EN_ATENCION', prioridad: 'MEDIA' }),
      item({ id: 4, estado: 'ASIGNADA', prioridad: 'ALTA' }),
      item({ id: 5, estado: 'EN_ATENCION', prioridad: 'ALTA' }),
    ])

    expect(grupos.map((grupo) => grupo.titulo)).toEqual([
      'En atención',
      'Asignadas',
      'Pendientes de atención',
    ])
    expect(grupos[0].items.map((row) => row.id)).toEqual([5, 3])
    expect(grupos[1].items.map((row) => row.id)).toEqual([4, 1])
    expect(grupos[2].items.map((row) => row.id)).toEqual([2])
  })
})
