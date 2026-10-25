import { describe, expect, it } from 'vitest'
import {
  formatearFechaHistorial,
  nombreResponsableHistorial,
  ordenarHistorialCronologico,
  tituloTransicionHistorial,
} from './solicitudHistorialUtils'
import type { HistorialSolicitudEvento } from './solicitudesAdminTypes'

const base = (
  partial: Partial<HistorialSolicitudEvento> &
    Pick<HistorialSolicitudEvento, 'id' | 'fecha' | 'estadoNuevo'>,
): HistorialSolicitudEvento => ({
  solicitudId: 1,
  estadoAnterior: null,
  observacionPublica: null,
  notaInterna: null,
  idUsuario: null,
  usuario: null,
  ...partial,
})

describe('solicitudHistorialUtils', () => {
  it('ordena ASC por fecha y desempata por id sin mutar el original', () => {
    const a = base({
      id: 3,
      fecha: '2026-10-21T12:00:00.000Z',
      estadoNuevo: 'EN_REVISION',
      estadoAnterior: 'PENDIENTE',
    })
    const b = base({
      id: 1,
      fecha: '2026-10-19T12:00:00.000Z',
      estadoNuevo: 'PENDIENTE',
    })
    const c = base({
      id: 2,
      fecha: '2026-10-20T12:00:00.000Z',
      estadoNuevo: 'EN_REVISION',
      estadoAnterior: 'PENDIENTE',
    })
    const original = [a, b, c]
    const ordenados = ordenarHistorialCronologico(original)
    expect(ordenados.map((e) => e.id)).toEqual([1, 2, 3])
    expect(original.map((e) => e.id)).toEqual([3, 1, 2])
  })

  it('desempata por id cuando la fecha es igual', () => {
    const misma = '2026-10-20T10:00:00.000Z'
    const ordenados = ordenarHistorialCronologico([
      base({ id: 9, fecha: misma, estadoNuevo: 'APROBADA', estadoAnterior: 'EN_REVISION' }),
      base({ id: 2, fecha: misma, estadoNuevo: 'EN_REVISION', estadoAnterior: 'PENDIENTE' }),
    ])
    expect(ordenados.map((e) => e.id)).toEqual([2, 9])
  })

  it('evento inicial no muestra null → estado', () => {
    const titulo = tituloTransicionHistorial(
      base({ id: 1, fecha: '2026-10-19T10:00:00.000Z', estadoNuevo: 'PENDIENTE' }),
    )
    expect(titulo).toContain('Solicitud registrada')
    expect(titulo).toContain('Pendiente')
    expect(titulo).not.toMatch(/null|undefined/i)
  })

  it('transición muestra labels humanos', () => {
    expect(
      tituloTransicionHistorial(
        base({
          id: 2,
          fecha: '2026-10-20T10:00:00.000Z',
          estadoAnterior: 'PENDIENTE',
          estadoNuevo: 'EN_REVISION',
        }),
      ),
    ).toBe('Pendiente → En revisión')
  })

  it('nombre responsable usa nombre y rol; sin usuario omite', () => {
    expect(
      nombreResponsableHistorial(
        base({
          id: 1,
          fecha: '2026-10-20T10:00:00.000Z',
          estadoNuevo: 'PENDIENTE',
          idUsuario: 7,
          usuario: { idUsuario: 7, nombre: 'María Rodríguez', rol: 'ADMINISTRADORA' },
        }),
      ),
    ).toBe('María Rodríguez · ADMINISTRADORA')

    expect(
      nombreResponsableHistorial(
        base({
          id: 2,
          fecha: '2026-10-20T10:00:00.000Z',
          estadoNuevo: 'PENDIENTE',
          idUsuario: null,
          usuario: null,
        }),
      ),
    ).toBeNull()
  })

  it('formatea fecha con es-CR', () => {
    const { fecha, hora } = formatearFechaHistorial('2026-10-20T16:35:00.000Z')
    expect(fecha).toMatch(/\d{2}\/\d{2}\/2026/)
    expect(hora.length).toBeGreaterThan(0)
  })
})
