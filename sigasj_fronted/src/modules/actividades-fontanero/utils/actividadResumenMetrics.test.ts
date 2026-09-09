import { describe, expect, it } from 'vitest'
import {
  buildAdminResumenMetricas,
  buildFontaneroResumenMetricas,
} from './actividadResumenMetrics'

describe('actividadResumenMetrics', () => {
  it('agrupa métricas del fontanero', () => {
    const metricas = buildFontaneroResumenMetricas({
      total: 6,
      porEstado: {
        REPORTADA: 1,
        EN_REVISION: 1,
        REVISADA: 1,
        CORREGIDA: 1,
        REQUIERE_CORRECCION: 2,
      },
    })

    expect(metricas.total).toBe(6)
    expect(metricas.pendientesRevision).toBe(2)
    expect(metricas.revisadas).toBe(2)
    expect(metricas.correccionSolicitada).toBe(2)
  })

  it('agrupa métricas administrativas', () => {
    const metricas = buildAdminResumenMetricas({
      total: 4,
      porEstado: {
        REPORTADA: 1,
        EN_REVISION: 1,
        REVISADA: 1,
        CORREGIDA: 1,
      },
    })

    expect(metricas.pendientesRevision).toBe(2)
    expect(metricas.revisadas).toBe(1)
    expect(metricas.corregidas).toBe(1)
  })
})
