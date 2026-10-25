import { describe, expect, it } from 'vitest'
import {
  MENSAJE_SEGUIMIENTO_NO_ENCONTRADO,
  MENSAJE_SEGUIMIENTO_RATE_LIMIT,
  MENSAJE_SEGUIMIENTO_RED,
  MENSAJE_SEGUIMIENTO_SERVIDOR,
  mensajeErrorSeguimientoPublico,
} from './seguimientoPublicoMessages'

describe('mensajeErrorSeguimientoPublico', () => {
  it('404 y combinación inválida usan el mismo mensaje genérico', () => {
    const a = mensajeErrorSeguimientoPublico(
      new Error('HTTP 404: No fue posible localizar una solicitud'),
    )
    const b = mensajeErrorSeguimientoPublico(
      new Error('HTTP 404: Not Found'),
    )
    expect(a).toBe(MENSAJE_SEGUIMIENTO_NO_ENCONTRADO)
    expect(b).toBe(MENSAJE_SEGUIMIENTO_NO_ENCONTRADO)
    expect(a).toBe(b)
    expect(a).not.toMatch(/identificaci[oó]n incorrecta/i)
    expect(a).not.toMatch(/c[oó]digo no existe/i)
  })

  it('429, 500 y red tienen mensajes amigables', () => {
    expect(
      mensajeErrorSeguimientoPublico(new Error('HTTP 429: Too Many Requests')),
    ).toBe(MENSAJE_SEGUIMIENTO_RATE_LIMIT)
    expect(
      mensajeErrorSeguimientoPublico(new Error('HTTP 500: Internal')),
    ).toBe(MENSAJE_SEGUIMIENTO_SERVIDOR)
    expect(
      mensajeErrorSeguimientoPublico(new Error('Failed to fetch')),
    ).toBe(MENSAJE_SEGUIMIENTO_RED)
  })

  it('no expone el cuerpo técnico del error', () => {
    const msg = mensajeErrorSeguimientoPublico(
      new Error('HTTP 500: SELECT * FROM Solicitud WHERE...'),
    )
    expect(msg).toBe(MENSAJE_SEGUIMIENTO_SERVIDOR)
    expect(msg).not.toContain('SELECT')
  })
})
