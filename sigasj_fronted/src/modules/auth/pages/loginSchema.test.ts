import { describe, expect, it } from 'vitest'
import { loginSchema, validateLoginForm } from './loginSchema'

describe('loginSchema', () => {
  it('exige correo y contraseña', () => {
    expect(loginSchema.safeParse({ email: '', password: '' }).success).toBe(false)
    expect(validateLoginForm({ email: '', password: '' }).success).toBe(false)
  })

  it('valida formato de correo', () => {
    const result = validateLoginForm({
      email: 'no-es-correo',
      password: 'Password123!',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.email).toBe('Ingresa un correo válido.')
    }
  })

  it('acepta credenciales válidas', () => {
    const result = validateLoginForm({
      email: 'admin@asadasanjuan.cr',
      password: 'Password123!',
    })
    expect(result).toEqual({
      success: true,
      data: {
        email: 'admin@asadasanjuan.cr',
        password: 'Password123!',
      },
    })
  })
})
