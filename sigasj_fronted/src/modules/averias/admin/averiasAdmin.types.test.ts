import { describe, expect, it } from 'vitest'
import {
  AVERIA_NO_ABONADO_LABEL,
  AVERIA_NO_OBSERVATIONS_LABEL,
  AVERIA_NOT_PROVIDED_LABEL,
  AVERIA_UNASSIGNED_LABEL,
  AVERIA_UNCLASSIFIED_LABEL,
  getAbonadoRelacionadoLabel,
  getFontaneroLabel,
  getObservacionesLabel,
  getOptionalPersonalLabel,
  getPrioridadLabel,
  getTipoAveriaDetailLabel,
} from './types'

describe('labels de detalle de avería', () => {
  it('diferencia dato no asignado, no clasificado y no proporcionado', () => {
    expect(getFontaneroLabel(null)).toBe(AVERIA_UNASSIGNED_LABEL)
    expect(getPrioridadLabel(null)).toBe(AVERIA_UNASSIGNED_LABEL)
    expect(getTipoAveriaDetailLabel(null)).toBe(AVERIA_UNCLASSIFIED_LABEL)
    expect(getOptionalPersonalLabel(null)).toBe(AVERIA_NOT_PROVIDED_LABEL)
    expect(getOptionalPersonalLabel('')).toBe(AVERIA_NOT_PROVIDED_LABEL)
    expect(getObservacionesLabel(null)).toBe(AVERIA_NO_OBSERVATIONS_LABEL)
    expect(getAbonadoRelacionadoLabel(null, null)).toBe(AVERIA_NO_ABONADO_LABEL)
  })

  it('no usa el nombre de una relación nula', () => {
    expect(getFontaneroLabel({ id: 8 })).toBe('Fontanero #8')
    expect(getAbonadoRelacionadoLabel(14, { id: 14, nombre: 'Juan Pérez' })).toBe(
      'Juan Pérez',
    )
    expect(getAbonadoRelacionadoLabel(21, null)).toBe('Abonado #21')
  })
})
