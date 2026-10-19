import { describe, expect, it } from 'vitest'
import {
  anioEnAsada,
  esFechaCalendario,
  formatearFechaAsada,
  formatearFechaHoraAsada,
  hoyEnAsada,
} from './fechaAsada'

describe('fechaAsada (hora de Costa Rica, UTC-6)', () => {
  it('un instante de las 02:35Z es el día anterior a las 20:35 en Costa Rica', () => {
    expect(formatearFechaHoraAsada('2026-10-18T02:35:47.000Z')).toBe('17/10/2026 20:35')
    expect(formatearFechaAsada('2026-10-18T02:35:47.000Z')).toBe('17/10/2026')
  })

  it('medianoche y fin de día de Costa Rica', () => {
    expect(formatearFechaHoraAsada('2026-10-18T06:00:00.000Z')).toBe('18/10/2026 00:00')
    expect(formatearFechaHoraAsada('2026-10-19T05:59:59.000Z')).toBe('18/10/2026 23:59')
  })

  it('una fecha de calendario no se corre un día', () => {
    expect(formatearFechaAsada('2026-10-18')).toBe('18/10/2026')
    expect(formatearFechaAsada('2026-01-01')).toBe('01/01/2026')
  })

  it('hoy y el año son los de Costa Rica en la noche del 31 de diciembre', () => {
    const nocheVieja = new Date('2027-01-01T02:00:00.000Z') // 31/12/2026 20:00 en CR
    expect(hoyEnAsada(nocheVieja)).toBe('2026-12-31')
    expect(anioEnAsada(nocheVieja)).toBe(2026)
    expect(hoyEnAsada(new Date('2027-01-01T06:00:00.000Z'))).toBe('2027-01-01')
  })

  it('valores vacíos o inválidos devuelven el marcador', () => {
    expect(formatearFechaHoraAsada(null)).toBe('—')
    expect(formatearFechaHoraAsada('no es fecha')).toBe('—')
    expect(formatearFechaAsada(undefined, 'Sin fecha')).toBe('Sin fecha')
  })

  it('reconoce fechas de calendario', () => {
    expect(esFechaCalendario('2026-10-18')).toBe(true)
    expect(esFechaCalendario('2026-10-18T00:00:00Z')).toBe(false)
  })
})
