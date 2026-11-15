import { describe, expect, it } from 'vitest'
import {
  cleanNotificacionTexto,
  resolveNotificacionMensaje,
  resolveNotificacionVisual,
} from './notificacionCampanaUi'

describe('notificacionCampanaUi', () => {
  it('limpia sellos demo del texto', () => {
    expect(
      cleanNotificacionTexto(
        'El material Válvula Bajo Stock Demo 1794595081231 alcanzó el mínimo.',
      ),
    ).toBe('El material Válvula Bajo Stock alcanzó el mínimo.')
  })

  it('oculta mensaje redundante de avería', () => {
    expect(
      resolveNotificacionMensaje(
        'Nueva avería AV-2026-0005',
        'Se registró la avería AV-2026-0005.',
      ),
    ).toBeNull()
  })

  it('resuelve tono e icono por tipo', () => {
    expect(
      resolveNotificacionVisual('ALERTA_REPOSICION_ADMINISTRADORA'),
    ).toEqual({ kind: 'reposicion', tone: 'warning' })
    expect(
      resolveNotificacionVisual('SALIDA_INVENTARIO_REGISTRADA_ADMINISTRADORA'),
    ).toEqual({ kind: 'salida', tone: 'info' })
  })
})
