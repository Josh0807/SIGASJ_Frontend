import { describe, expect, it } from 'vitest'
import { emailField, numericField, requiredSelection, requiredText, zodIssuesToFieldErrors } from './formValidationSchemas'

describe('formValidationSchemas', () => {
  it('valida textos y selecciones obligatorias con mensajes comprensibles', () => {
    expect(requiredText('el nombre').safeParse('  ').success).toBe(false)
    expect(requiredSelection('un tipo de identificación').safeParse('').success).toBe(false)
    expect(requiredText('el nombre').safeParse('María').success).toBe(true)
  })

  it('valida correo y valores numéricos', () => {
    expect(emailField.safeParse('correo-invalido').success).toBe(false)
    expect(emailField.safeParse('persona@example.com').success).toBe(true)
    expect(numericField('el monto').safeParse('12A').success).toBe(false)
    expect(numericField('el monto').safeParse('1250.50').success).toBe(true)
  })

  it('conserva el primer mensaje de cada campo de Zod', () => {
    expect(zodIssuesToFieldErrors([
      { path: ['correo'], message: 'Correo requerido.' },
      { path: ['correo'], message: 'Correo inválido.' },
      { path: ['direccion', 'canton'], message: 'Cantón requerido.' },
    ])).toEqual({
      correo: 'Correo requerido.',
      'direccion.canton': 'Cantón requerido.',
    })
  })
})
