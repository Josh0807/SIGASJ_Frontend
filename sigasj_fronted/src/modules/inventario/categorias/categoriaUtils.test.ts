import { describe, expect, it } from 'vitest'
import { categoriaError, validateCategoria } from './categoriaUtils'

describe('validación de categorías', () => {
  it('acepta nombre y descripción opcional vacía', () => expect(validateCategoria({ nombre: 'Válvulas', descripcion: '' })).toEqual({}))
  it('rechaza nombre vacío', () => expect(validateCategoria({ nombre: '  ', descripcion: '' }).nombre).toBe('El nombre es obligatorio.'))
  it('aplica límites de 100 y 500 caracteres', () => { expect(validateCategoria({ nombre: 'x'.repeat(101), descripcion: '' }).nombre).toBeTruthy(); expect(validateCategoria({ nombre: 'PVC', descripcion: 'x'.repeat(501) }).descripcion).toBeTruthy() })
  it('presenta 409 sobre el campo nombre', () => expect(categoriaError(new Error('HTTP 409: Conflict')).nombre).toContain('Ya existe'))
  it.each([400, 401, 403, 404])('presenta HTTP %s de forma comprensible', (status) => expect(categoriaError(new Error(`HTTP ${status}: error`)).message.length).toBeGreaterThan(10))
})
