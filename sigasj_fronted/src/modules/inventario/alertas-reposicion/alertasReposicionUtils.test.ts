import { describe, expect, it } from 'vitest'
import {
  formatAlertaEstado,
  getAlertaMaterialNombre,
  getAlertaResponsable,
  getAlertaUnidadMedida,
  normalizeAlertasReposicionList,
  puedeGenerarReposicionDesdeAlerta,
  siguienteEstadoAlerta,
} from './alertasReposicionUtils'
import type { AlertaReposicion } from './types'

const alerta: AlertaReposicion = {
  id: 1,
  idMaterial: 4,
  stockActual: 8,
  stockMinimo: 10,
  estado: 'PENDIENTE',
  fechaGeneracion: '2026-09-14T10:00:00.000Z',
  idUsuarioGestiona: 2,
  material: { id: 4, nombre: 'Tubo PVC 1/2"', unidadMedida: 'Metro' },
  usuarioGestiona: { id: 2, nombre: 'Ana Admin' },
}

describe('alertasReposicionUtils', () => {
  it('normaliza listados paginados y arreglos planos', () => {
    expect(normalizeAlertasReposicionList({ data: [alerta], total: 1, page: 1, limit: 10, totalPages: 1 })).toEqual([alerta])
    expect(normalizeAlertasReposicionList([alerta])).toEqual([alerta])
  })

  it('resuelve material, unidad, responsable y etiquetas de estado', () => {
    expect(getAlertaMaterialNombre(alerta)).toBe('Tubo PVC 1/2"')
    expect(getAlertaUnidadMedida(alerta)).toBe('Metro')
    expect(getAlertaResponsable(alerta)).toBe('Ana Admin')
    expect(formatAlertaEstado('EN_GESTION')).toBe('En gestión')
    expect(formatAlertaEstado('RESUELTA')).toBe('Resuelta')
    expect(getAlertaResponsable({ ...alerta, idUsuarioGestiona: null, usuarioGestiona: null })).toBe('—')
    expect(siguienteEstadoAlerta('PENDIENTE')).toBe('EN_GESTION')
    expect(siguienteEstadoAlerta('EN_GESTION')).toBe('RESUELTA')
    expect(siguienteEstadoAlerta('RESUELTA')).toBeNull()
    expect(puedeGenerarReposicionDesdeAlerta('PENDIENTE')).toBe(true)
    expect(puedeGenerarReposicionDesdeAlerta('RESUELTA')).toBe(false)
  })
})
