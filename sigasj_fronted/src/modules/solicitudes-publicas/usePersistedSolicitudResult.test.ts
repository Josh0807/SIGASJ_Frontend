import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { clearPersistedSolicitudResult, persistSolicitudResult, readPersistedSolicitudResult } from './usePersistedSolicitudResult'

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

  it('no restaura una confirmación en una entrada nueva del historial', () => {
    persistSolicitudResult('arreglo-pago', {
      codigoSeguimiento: 'SOL-2026-PRIMERA',
      estado: 'PENDIENTE',
      fechaIngreso: '2026-10-24T20:00:00.000Z',
    })
    window.history.pushState({}, '', '/solicitudes/arreglo-pago')
    expect(readPersistedSolicitudResult('arreglo-pago')).toBeNull()
  })

  it('limpia solamente el resultado del trámite indicado', () => {
    persistSolicitudResult('arreglo-pago', {
      codigoSeguimiento: 'SOL-2026-PAGO', estado: 'PENDIENTE', fechaIngreso: '',
    })
    persistSolicitudResult('afiliacion', {
      codigoSeguimiento: 'SOL-2026-AFILIACION', estado: 'PENDIENTE', fechaIngreso: '',
    })
    clearPersistedSolicitudResult('afiliacion')
    expect(window.sessionStorage.getItem('sigasj:solicitud-confirmada:afiliacion')).toBeNull()
    expect(window.sessionStorage.getItem('sigasj:solicitud-confirmada:arreglo-pago')).not.toBeNull()
  })
})
