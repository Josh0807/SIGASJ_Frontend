import { describe, expect, it } from 'vitest'
import {
  mensajeErrorAprobarSolicitud,
  mensajeErrorRechazarSolicitud,
} from './solicitudAusenciaAdminMessages'

describe('solicitudAusenciaAdminMessages', () => {
  it('mapea saldo insuficiente', () => {
    expect(
      mensajeErrorAprobarSolicitud(
        new Error('HTTP 400: Saldo de vacaciones insuficiente'),
      ),
    ).toContain('saldo suficiente de vacaciones')
  })

  it('mapea conflicto y 404', () => {
    expect(mensajeErrorAprobarSolicitud(new Error('HTTP 409: x'))).toBe(
      'Esta solicitud ya fue procesada.',
    )
    expect(mensajeErrorRechazarSolicitud(new Error('HTTP 404: x'))).toBe(
      'No se encontró la solicitud.',
    )
  })
})
