import { describe, expect, it } from 'vitest'
import {
  formatAveriaAdminDateTime,
  formatAveriaAdminDateTimeOrUnavailable,
} from './formatAveriaAdminDate'

describe('formatAveriaAdminDateTime', () => {
  it('formatea fecha y hora a partir de un Date local', () => {
    const value = new Date(2026, 8, 12, 15, 5)
    expect(formatAveriaAdminDateTime(value)).toBe('12/09/2026 15:05')
  })

  it('devuelve guion cuando el valor es vacío o inválido', () => {
    expect(formatAveriaAdminDateTime(null)).toBe('—')
    expect(formatAveriaAdminDateTime('')).toBe('—')
    expect(formatAveriaAdminDateTime('no-es-fecha')).toBe('—')
  })

  it('usa el fallback administrativo cuando la fecha no está disponible', () => {
    expect(formatAveriaAdminDateTimeOrUnavailable(null, 'No disponible')).toBe(
      'No disponible',
    )
    expect(formatAveriaAdminDateTimeOrUnavailable('', 'No disponible')).toBe(
      'No disponible',
    )
    expect(
      formatAveriaAdminDateTimeOrUnavailable('no-es-fecha', 'No disponible'),
    ).toBe('No disponible')
    expect(
      formatAveriaAdminDateTimeOrUnavailable(
        new Date(2026, 8, 12, 15, 5),
        'No disponible',
      ),
    ).toBe('12/09/2026 15:05')
  })
})
