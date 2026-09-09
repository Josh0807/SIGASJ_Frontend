import { describe, expect, it } from 'vitest'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { deriveHistorialPagination } from './historialActividadesList'

const actividad = (id: number): ActividadFontaneroRegistrada => ({
  id,
  tipoActividadId: 1,
  tipoActividadNombre: 'Control de Fugas',
  fechaActividad: '2026-03-01',
  titulo: `Actividad ${id}`,
  descripcion: null,
  ubicacion: null,
  observaciones: null,
  estado: 'APROBADA',
  observacionCorreccion: null,
  datosEspecificos: null,
  createdAt: '2026-03-01T10:00:00.000Z',
  updatedAt: '2026-03-01T10:00:00.000Z',
})

describe('historialActividadesList', () => {
  it('usa data y total del Back-end sin refiltrar en cliente', () => {
    const resolved = deriveHistorialPagination(
      { data: [actividad(11), actividad(12)], total: 25 },
      { page: 2, limit: 10 },
    )

    expect(resolved.actividades.map((item) => item.id)).toEqual([11, 12])
    expect(resolved.total).toBe(25)
    expect(resolved.page).toBe(2)
    expect(resolved.totalPages).toBe(3)
    expect(resolved.limit).toBe(10)
  })

  it('sin resultados deja una sola página', () => {
    const resolved = deriveHistorialPagination({ data: [], total: 0 }, {})

    expect(resolved.actividades).toEqual([])
    expect(resolved.total).toBe(0)
    expect(resolved.page).toBe(1)
    expect(resolved.totalPages).toBe(1)
  })

  it('ajusta page cuando supera totalPages', () => {
    const resolved = deriveHistorialPagination(
      { data: [actividad(1), actividad(2)], total: 5 },
      { page: 3, limit: 10 },
    )

    expect(resolved.page).toBe(1)
    expect(resolved.totalPages).toBe(1)
    expect(resolved.actividades).toHaveLength(2)
  })
})
