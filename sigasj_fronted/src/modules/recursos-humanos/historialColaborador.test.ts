import { describe, expect, it } from 'vitest'
import {
  detalleEventoHistorial,
  etiquetaTipoEvento,
  historialErrorMessage,
} from './historialColaborador'
import type { EventoHistorialColaborador } from './types'

const evento = (
  parcial: Partial<EventoHistorialColaborador> &
    Pick<EventoHistorialColaborador, 'tipo'>,
): EventoHistorialColaborador => ({
  id: 1,
  fecha: '2026-08-15',
  fechaInicio: null,
  fechaFin: null,
  descripcion: '',
  ...parcial,
})

describe('presentación del historial administrativo', () => {
  it('mapea los tipos del backend a etiquetas visibles', () => {
    expect(etiquetaTipoEvento('PERMISO')).toBe('Permiso')
    expect(etiquetaTipoEvento('VACACION')).toBe('Vacaciones')
    expect(etiquetaTipoEvento('INCAPACIDAD')).toBe('Incapacidad')
  })

  it('reutiliza descripcion del backend cuando existe', () => {
    expect(
      detalleEventoHistorial(
        evento({
          tipo: 'PERMISO',
          descripcion: 'Permiso registrado',
          motivo: 'Cita médica',
        }),
      ),
    ).toBe('Permiso registrado')
  })

  it('arma detalle de respaldo por tipo sin inventar datos', () => {
    expect(
      detalleEventoHistorial(
        evento({
          tipo: 'INCAPACIDAD',
          fechaInicio: '2026-08-22',
          fechaFin: '2026-08-24',
        }),
      ),
    ).toMatch(/22.*2026.*24.*2026/)

    expect(
      detalleEventoHistorial(
        evento({
          tipo: 'PERMISO',
          motivo: 'Trámite personal',
        }),
      ),
    ).toBe('Trámite personal')

    expect(
      detalleEventoHistorial(
        evento({
          tipo: 'VACACION',
          tipoMovimiento: 'ACUMULADO',
          cantidadDias: 2,
        }),
      ),
    ).toBe('+2 días adquiridos')
  })

  it('traduce errores HTTP sin exponer detalle técnico', () => {
    expect(historialErrorMessage(new Error('HTTP 404: not found'), 'x')).toBe(
      'No se encontró el colaborador solicitado.',
    )
    expect(historialErrorMessage(new Error('HTTP 403: forbidden'), 'x')).toBe(
      'No tiene acceso para consultar el historial administrativo.',
    )
    expect(historialErrorMessage(new Error('HTTP 500: boom'), 'x')).toBe(
      'No fue posible cargar el historial. Intente nuevamente.',
    )
    expect(
      historialErrorMessage(
        new Error('HTTP 400: ["fechaDesde debe tener formato YYYY-MM-DD"]'),
        'x',
      ),
    ).toBe('fechaDesde debe tener formato YYYY-MM-DD')
  })
})
