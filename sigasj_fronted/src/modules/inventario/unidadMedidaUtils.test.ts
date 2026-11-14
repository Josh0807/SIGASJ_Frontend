import { describe, expect, it } from 'vitest'
import { formatCantidadUnidad, pluralizeUnidad } from './unidadMedidaUtils'

describe('pluralizeUnidad', () => {
  it('mantiene singular con 1', () => {
    expect(pluralizeUnidad('Tubo', 1)).toBe('Tubo')
    expect(pluralizeUnidad('Unidad', 1)).toBe('Unidad')
  })

  it('pluraliza cantidades distintas de 1', () => {
    expect(pluralizeUnidad('Tubo', 20)).toBe('Tubos')
    expect(pluralizeUnidad('Unidad', 12)).toBe('Unidades')
    expect(pluralizeUnidad('Tarro', 8)).toBe('Tarros')
    expect(pluralizeUnidad('Metro', 0)).toBe('Metros')
  })

  it('no altera abreviaturas', () => {
    expect(pluralizeUnidad('kg', 5)).toBe('kg')
    expect(pluralizeUnidad('m', 3)).toBe('m')
  })
})

describe('formatCantidadUnidad', () => {
  it('formatea cantidad con unidad pluralizada', () => {
    expect(formatCantidadUnidad(1, 'Tubo')).toBe('1 Tubo')
    expect(formatCantidadUnidad(20, 'Tubo')).toBe('20 Tubos')
    expect(formatCantidadUnidad(3, null)).toBe('3')
  })
})
