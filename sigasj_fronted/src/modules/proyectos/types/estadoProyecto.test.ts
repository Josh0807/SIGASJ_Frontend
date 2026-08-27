import { describe, expect, it } from 'vitest'
import {
  ESTADOS_PROYECTO,
  ESTADO_PROYECTO_LABELS,
  ESTADO_PROYECTO_OPTIONS,
  PROYECTO_ESTADO_UPDATE_PENDING,
  isEstadoProyecto,
} from './estadoProyecto'

describe('estadoProyecto', () => {
  it('expone las etiquetas visibles y los valores internos del Backend', () => {
    expect(ESTADO_PROYECTO_OPTIONS).toEqual([
      { value: 'PENDIENTE', label: 'Pendiente' },
      { value: 'EN_PROCESO', label: 'En proceso' },
      { value: 'COMPLETADO', label: 'Completado' },
    ])
    expect(ESTADO_PROYECTO_LABELS).toEqual({
      PENDIENTE: 'Pendiente',
      EN_PROCESO: 'En proceso',
      COMPLETADO: 'Completado',
    })
    expect([...ESTADOS_PROYECTO]).toEqual(
      ESTADO_PROYECTO_OPTIONS.map((option) => option.value),
    )
  })

  it('no trata etiquetas visibles ni estados inventados como valores internos', () => {
    expect(isEstadoProyecto('PENDIENTE')).toBe(true)
    expect(isEstadoProyecto('EN_PROCESO')).toBe(true)
    expect(isEstadoProyecto('COMPLETADO')).toBe(true)
    expect(isEstadoProyecto('Pendiente')).toBe(false)
    expect(isEstadoProyecto('En proceso')).toBe(false)
    expect(isEstadoProyecto('Completado')).toBe(false)
    expect(isEstadoProyecto('EN_EJECUCION')).toBe(false)
    expect(isEstadoProyecto('Inactivo')).toBe(false)
  })

  it('registra el cambio de estado como integración pendiente del Backend', () => {
    expect(PROYECTO_ESTADO_UPDATE_PENDING).toBe(true)
  })
})
