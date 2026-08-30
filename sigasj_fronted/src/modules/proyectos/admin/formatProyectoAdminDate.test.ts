import { describe, expect, it } from 'vitest'
import { formatProyectoAdminDate } from './formatProyectoAdminDate'

describe('formatProyectoAdminDate', () => {
  it('formatea fechas ISO del Backend sin inventar zona horaria local', () => {
    expect(formatProyectoAdminDate('2026-01-01T00:00:00.000Z')).toBe('01/01/2026')
    expect(formatProyectoAdminDate('2026-08-20T15:30:00.000Z')).toBe('20/08/2026')
  })

  it('muestra un marcador cuando no hay fecha válida', () => {
    expect(formatProyectoAdminDate('')).toBe('—')
    expect(formatProyectoAdminDate(null)).toBe('—')
    expect(formatProyectoAdminDate('no-es-fecha')).toBe('—')
  })
})
