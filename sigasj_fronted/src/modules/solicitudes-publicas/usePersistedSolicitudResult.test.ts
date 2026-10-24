import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { persistSolicitudResult, readPersistedSolicitudResult } from './usePersistedSolicitudResult'

describe('persistencia de confirmación de solicitud', () => {
  beforeEach(() => window.sessionStorage.clear())
  afterEach(() => window.sessionStorage.clear())

  it('recupera el código al recargar sin conservar información sensible', () => {
    persistSolicitudResult('arreglo-pago', {
      codigoSeguimiento: 'SOL-2026-A82K91',
      estado: 'PENDIENTE',
      fechaIngreso: '2026-10-24T19:50:00.000Z',
    })

    expect(readPersistedSolicitudResult('arreglo-pago')).toEqual({
      codigoSeguimiento: 'SOL-2026-A82K91',
      estado: 'PENDIENTE',
      fechaIngreso: '2026-10-24T19:50:00.000Z',
    })
    expect(window.sessionStorage.getItem('sigasj:solicitud-confirmada:arreglo-pago')).not.toContain('firma')
  })

  it('aísla la confirmación de cada formulario', () => {
    persistSolicitudResult('afiliacion', {
      codigoSeguimiento: 'SOL-2026-Z91P2',
      estado: 'PENDIENTE',
      fechaIngreso: '2026-10-24T20:00:00.000Z',
    })
    expect(readPersistedSolicitudResult('cambio-titular')).toBeNull()
  })
})
