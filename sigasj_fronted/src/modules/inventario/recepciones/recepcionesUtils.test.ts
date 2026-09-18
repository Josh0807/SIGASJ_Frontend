import { describe, expect, it } from 'vitest'
import { recepcionErrorMessage, recepcionItemsValidos } from './recepcionesUtils'

describe('recepcionesUtils', () => {
  it('valida cantidades recibidas mayores a cero', () => {
    expect(recepcionItemsValidos([{ idMaterial: 1, cantidad: 10 }])).toBe(true)
    expect(recepcionItemsValidos([{ idMaterial: 1, cantidad: 0 }])).toBe(false)
    expect(recepcionItemsValidos([])).toBe(false)
  })

  it('traduce errores HTTP de recepción', () => {
    expect(recepcionErrorMessage(new Error('HTTP 409'))).toContain('ya fue recibida')
    expect(recepcionErrorMessage(new Error('HTTP 403'))).toContain('permiso')
  })
})
