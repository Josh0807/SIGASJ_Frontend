import { describe, expect, it } from 'vitest'
import {
  requiereAlgunPlanoAdjunto,
  tiposEstrictosDisponibilidad,
  tiposRequeridosDisponibilidad,
} from './documentoAdjunto'
import { PROPOSITOS } from './types'

describe('documentoAdjunto disponibilidad', () => {
  it('marca identificación siempre y poder para representante o estación', () => {
    expect(
      tiposEstrictosDisponibilidad({
        proposito: 'Fraccionamiento',
        calidadTitular: 'Propietario',
        planoCatastrado: 'SJ-1',
      }),
    ).toEqual(['identificacion'])

    expect(
      tiposEstrictosDisponibilidad({
        proposito: 'Fraccionamiento',
        calidadTitular: 'Representante legal',
        planoCatastrado: 'SJ-1',
      }),
    ).toContain('poder')

    const estacion = tiposEstrictosDisponibilidad({
      proposito: 'Estación de combustible',
      calidadTitular: 'Propietario',
      planoCatastrado: 'SJ-1',
    })
    expect(estacion).toContain('poder')
    expect(estacion).toContain('plano-catastrado')
  })

  it('exige agrimensura adjunta cuando no hay referencia catastrada', () => {
    expect(
      tiposEstrictosDisponibilidad({
        proposito: 'Urbanización',
        calidadTitular: 'Propietario',
        planoCatastrado: '',
      }),
    ).toContain('plano-agrimensura')
  })

  it('requiere algún plano adjunto para todos los propósitos confirmados', () => {
    for (const proposito of PROPOSITOS) {
      expect(requiereAlgunPlanoAdjunto(proposito)).toBe(true)
      const marked = tiposRequeridosDisponibilidad({
        proposito,
        calidadTitular: 'Propietario',
        planoCatastrado: 'SJ-1',
      })
      expect(marked).toContain('plano-catastrado')
      expect(marked).toContain('plano-agrimensura')
    }
  })
})
