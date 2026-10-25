import { describe, expect, it } from 'vitest'
import type { EventoSeguimientoPublico } from './seguimientoPublicoTypes'
import {
  clavesPrivadasEnPayload,
  ordenarEventosPublicos,
  rolVisualEventoPublico,
  sanitizarSeguimientoPublico,
  tituloEventoPublico,
} from './seguimientoPublicoTimelineUtils'

const e = (
  partial: Partial<EventoSeguimientoPublico> &
    Pick<EventoSeguimientoPublico, 'fecha' | 'estadoNuevo'>,
): EventoSeguimientoPublico => ({
  estadoAnterior: null,
  observacionPublica: null,
  ...partial,
})

describe('seguimientoPublicoTimelineUtils', () => {
  it('ordena ASC sin mutar el original', () => {
    const original = [
      e({ fecha: '2026-10-21T12:00:00.000Z', estadoNuevo: 'APROBADA', estadoAnterior: 'EN_REVISION' }),
      e({ fecha: '2026-10-19T12:00:00.000Z', estadoNuevo: 'PENDIENTE' }),
      e({ fecha: '2026-10-20T12:00:00.000Z', estadoNuevo: 'EN_REVISION', estadoAnterior: 'PENDIENTE' }),
    ]
    const ordenados = ordenarEventosPublicos(original)
    expect(ordenados.map((x) => x.fecha.slice(8, 10))).toEqual(['19', '20', '21'])
    expect(original[0].fecha).toContain('21')
  })

  it('evento inicial sin null/undefined', () => {
    const titulo = tituloEventoPublico(
      e({ fecha: '2026-10-19T10:00:00.000Z', estadoNuevo: 'PENDIENTE' }),
    )
    expect(titulo).toContain('Solicitud registrada')
    expect(titulo).toContain('Pendiente')
    expect(titulo).not.toMatch(/null|undefined/i)
  })

  it('transición con labels humanos', () => {
    expect(
      tituloEventoPublico(
        e({
          fecha: '2026-10-20T10:00:00.000Z',
          estadoAnterior: 'PENDIENTE',
          estadoNuevo: 'EN_REVISION',
        }),
      ),
    ).toBe('Pendiente → En revisión')
  })

  it('marca actual / completado según estadoActual', () => {
    const eventos = ordenarEventosPublicos([
      e({ fecha: '2026-10-19T10:00:00.000Z', estadoNuevo: 'PENDIENTE' }),
      e({
        fecha: '2026-10-20T10:00:00.000Z',
        estadoAnterior: 'PENDIENTE',
        estadoNuevo: 'EN_REVISION',
      }),
    ])
    expect(rolVisualEventoPublico(eventos, 0, 'EN_REVISION')).toBe('completado')
    expect(rolVisualEventoPublico(eventos, 1, 'EN_REVISION')).toBe('actual')
  })

  it('sanitiza y no conserva campos privados aunque lleguen en el objeto', () => {
    const sucio = {
      codigoSeguimiento: 'SOL-2026-00001',
      estado: 'EN_REVISION' as const,
      fechaIngreso: '2026-10-20T10:00:00.000Z',
      tipoSolicitud: { nombre: 'Arreglo', slug: 'arreglo-pago' },
      historial: [
        {
          fecha: '2026-10-20T10:00:00.000Z',
          estadoAnterior: 'PENDIENTE' as const,
          estadoNuevo: 'EN_REVISION' as const,
          observacionPublica: 'Público',
          notaInterna: 'SECRETO',
          idUsuario: 7,
        } as EventoSeguimientoPublico & { notaInterna: string; idUsuario: number },
      ],
      notaInterna: 'NO',
      usuario: { nombre: 'Admin' },
    }
    const limpio = sanitizarSeguimientoPublico(sucio)
    const json = JSON.stringify(limpio)
    expect(json).not.toContain('SECRETO')
    expect(json).not.toContain('notaInterna')
    expect(json).not.toContain('idUsuario')
    expect(json).not.toContain('Admin')
    expect(limpio.historial[0].observacionPublica).toBe('Público')
  })

  it('TRACK-QA-SEC-001: detecta notaInterna accidental en response público', () => {
    // Severidad ALTA / SEGURIDAD si Backend la envía; Frontend no debe renderizarla.
    expect(
      clavesPrivadasEnPayload({
        historial: [{ notaInterna: 'x' }],
      }),
    ).toContain('notaInterna')
  })
})
