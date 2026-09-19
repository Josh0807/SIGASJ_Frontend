import { describe, expect, it } from 'vitest'
import {
  AVERIA_UNASSIGNED_LABEL,
  AVERIA_UNCLASSIFIED_LABEL,
} from '../admin/types'
import {
  getFontaneroAccionesOperativas,
  puedeIntentarIniciarAtencionAveria,
  puedeRegistrarObservacionAveria,
} from './fontaneroAveriaAcciones'
import {
  getFontaneroObservacionesLabel,
  getFontaneroPrioridadLabel,
  getFontaneroTipoLabel,
  sortObservacionesAtencion,
} from './fontaneroAveriaPresentation'
import { AVERIAS_FONTANERO_OBSERVACIONES_VACIAS } from './types'

describe('presentación del detalle Fontanero', () => {
  it('trata los textos de ausencia del Backend como pendientes, no como enums', () => {
    expect(getFontaneroTipoLabel('Sin clasificar')).toBe(AVERIA_UNCLASSIFIED_LABEL)
    expect(getFontaneroTipoLabel(null)).toBe(AVERIA_UNCLASSIFIED_LABEL)
    expect(getFontaneroTipoLabel('TUBERIA_DANADA')).toBe('Tubería dañada')
    expect(getFontaneroPrioridadLabel('Sin asignar')).toBe(AVERIA_UNASSIGNED_LABEL)
    expect(getFontaneroPrioridadLabel('ALTA')).toBe('Alta')
    expect(getFontaneroObservacionesLabel('Sin observaciones')).toBe(
      AVERIAS_FONTANERO_OBSERVACIONES_VACIAS,
    )
    expect(getFontaneroObservacionesLabel('Tramo reemplazado.')).toBe(
      'Tramo reemplazado.',
    )
  })

  it('solo ofrece marcar como resuelta cuando está en atención', () => {
    expect(getFontaneroAccionesOperativas('ASIGNADA')).toEqual([])
    expect(getFontaneroAccionesOperativas('PENDIENTE')).toEqual([])
    expect(getFontaneroAccionesOperativas('EN_ATENCION')).toEqual(['RESUELTA'])
    expect(getFontaneroAccionesOperativas('RESUELTA')).toEqual([])
    expect(getFontaneroAccionesOperativas('RECIBIDA')).toEqual([])
  })

  it('permite intentar iniciar atención en Asignada o Pendiente de atención', () => {
    expect(puedeIntentarIniciarAtencionAveria('ASIGNADA')).toBe(true)
    expect(puedeIntentarIniciarAtencionAveria('PENDIENTE')).toBe(true)
    expect(puedeIntentarIniciarAtencionAveria('PENDIENTE_ATENCION')).toBe(true)
    expect(puedeIntentarIniciarAtencionAveria('EN_ATENCION')).toBe(false)
    expect(puedeIntentarIniciarAtencionAveria('RESUELTA')).toBe(false)
  })

  it('permite registrar observaciones mientras la avería no esté resuelta', () => {
    expect(puedeRegistrarObservacionAveria('ASIGNADA')).toBe(true)
    expect(puedeRegistrarObservacionAveria('EN_ATENCION')).toBe(true)
    expect(puedeRegistrarObservacionAveria('PENDIENTE')).toBe(true)
    expect(puedeRegistrarObservacionAveria('RESUELTA')).toBe(false)
  })

  it('ordena las observaciones de atención cronológicamente', () => {
    const ordered = sortObservacionesAtencion([
      {
        id: 2,
        observacion: 'Segunda',
        fechaCreacion: '2026-09-04T11:20:00.000Z',
        autor: { id: 7, nombre: 'Fontanero A' },
      },
      {
        id: 1,
        observacion: 'Primera',
        fechaCreacion: '2026-09-04T10:35:00.000Z',
        autor: { id: 7, nombre: 'Fontanero A' },
      },
    ])
    expect(ordered.map((item) => item.observacion)).toEqual(['Primera', 'Segunda'])
  })
})
