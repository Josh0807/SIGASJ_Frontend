import { describe, expect, it } from 'vitest'
import { formatProyectoAdminDate } from './formatProyectoAdminDate'

describe('formatProyectoAdminDate', () => {
  it('muestra el día de Costa Rica (UTC-6) para los instantes UTC del Backend', () => {
    // 01/01/2026 00:00Z es 31/12/2025 18:00 en Costa Rica
    expect(formatProyectoAdminDate('2026-01-01T00:00:00.000Z')).toBe('31/12/2025')
    expect(formatProyectoAdminDate('2026-08-20T15:30:00.000Z')).toBe('20/08/2026')
    // creada a las 20:35 del 17 en Costa Rica (02:35Z del 18)
    expect(formatProyectoAdminDate('2026-10-18T02:35:47.000Z')).toBe('17/10/2026')
  })

  it('una fecha de calendario sin hora no se corre de día', () => {
    expect(formatProyectoAdminDate('2026-10-18')).toBe('18/10/2026')
  })

  it('muestra un marcador cuando no hay fecha válida', () => {
    expect(formatProyectoAdminDate('')).toBe('—')
    expect(formatProyectoAdminDate(null)).toBe('—')
    expect(formatProyectoAdminDate('no-es-fecha')).toBe('—')
  })
})
