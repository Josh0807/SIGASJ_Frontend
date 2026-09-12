import { describe, expect, it } from 'vitest'
import { parseAveriaAdminId } from './parseAveriaAdminId'

describe('parseAveriaAdminId', () => {
  it('acepta enteros positivos como number o string', () => {
    expect(parseAveriaAdminId(25)).toBe(25)
    expect(parseAveriaAdminId('25')).toBe(25)
    expect(parseAveriaAdminId(' 7 ')).toBe(7)
  })

  it('rechaza valores inválidos sin producir NaN usable', () => {
    expect(parseAveriaAdminId('abc')).toBeNull()
    expect(parseAveriaAdminId('12.5')).toBeNull()
    expect(parseAveriaAdminId('0')).toBeNull()
    expect(parseAveriaAdminId(-3)).toBeNull()
    expect(parseAveriaAdminId(Number.NaN)).toBeNull()
    expect(parseAveriaAdminId('')).toBeNull()
    expect(parseAveriaAdminId(null)).toBeNull()
    expect(parseAveriaAdminId(undefined)).toBeNull()
  })
})
