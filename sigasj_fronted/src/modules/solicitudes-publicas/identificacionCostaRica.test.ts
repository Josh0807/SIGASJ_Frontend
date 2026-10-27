import { describe, expect, it } from 'vitest'
import {
  cedulaFisicaSchema,
  limitarCedulaFisica,
  limitarTelefonoCr,
  soloDigitos,
  telefonoCostaRicaSchema,
} from './identificacionCostaRica'

describe('identificacionCostaRica', () => {
  it('cuenta solo dígitos', () => {
    expect(soloDigitos('1-2345-6789')).toBe('123456789')
    expect(soloDigitos('8888-1234')).toBe('88881234')
  })

  it('no deja escribir más de 9 dígitos en cédula', () => {
    expect(limitarCedulaFisica('1234567890')).toBe('123456789')
    expect(limitarCedulaFisica('1-2345-67890')).toBe('1-2345-6789')
    expect(limitarCedulaFisica('1-2345-6789')).toBe('1-2345-6789')
  })

  it('no deja escribir más de 8 dígitos en teléfono', () => {
    expect(limitarTelefonoCr('888812345')).toBe('88881234')
    expect(limitarTelefonoCr('8888-12345')).toBe('8888-1234')
  })

  it('exige teléfono con exactamente 8 dígitos', () => {
    expect(telefonoCostaRicaSchema().safeParse('').success).toBe(false)
    expect(telefonoCostaRicaSchema().safeParse('8888-123').success).toBe(false)
    expect(telefonoCostaRicaSchema().safeParse('8888-12345').success).toBe(false)
    expect(telefonoCostaRicaSchema().safeParse('8888-1234').success).toBe(true)
    expect(telefonoCostaRicaSchema().safeParse('88881234').success).toBe(true)
  })

  it('exige cédula física con exactamente 9 dígitos', () => {
    expect(cedulaFisicaSchema().safeParse('').success).toBe(false)
    expect(cedulaFisicaSchema().safeParse('1-2345-678').success).toBe(false)
    expect(cedulaFisicaSchema().safeParse('1-2345-67890').success).toBe(false)
    expect(cedulaFisicaSchema().safeParse('1-2345-6789').success).toBe(true)
    expect(cedulaFisicaSchema().safeParse('123456789').success).toBe(true)
  })
})
