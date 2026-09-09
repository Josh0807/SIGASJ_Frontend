import { describe, expect, it } from 'vitest'
import { listDatosEspecificosDetalle } from './formatDatosEspecificosDetalle'

describe('formatDatosEspecificosDetalle', () => {
  it('lista entradas conocidas con etiquetas legibles', () => {
    expect(
      listDatosEspecificosDetalle({
        presionMedida: 42.5,
        ubicacionFuga: 'Sector norte',
      }),
    ).toEqual([
      { label: 'Presión medida', value: '42.5' },
      { label: 'Ubicación de la fuga', value: 'Sector norte' },
    ])
  })

  it('devuelve arreglo vacío sin datos', () => {
    expect(listDatosEspecificosDetalle(null)).toEqual([])
    expect(listDatosEspecificosDetalle(undefined)).toEqual([])
  })
})
