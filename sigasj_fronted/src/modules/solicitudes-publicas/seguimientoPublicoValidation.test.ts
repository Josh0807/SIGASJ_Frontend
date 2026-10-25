import { describe, expect, it } from 'vitest'
import { validarSeguimientoLocal } from './seguimientoPublicoValidation'

describe('validarSeguimientoLocal', () => {
  it('rechaza ambos vacíos sin payload', () => {
    const { errores, payload } = validarSeguimientoLocal({
      codigo: '   ',
      identificacion: '',
    })
    expect(payload).toBeNull()
    expect(errores.codigo).toBeTruthy()
    expect(errores.identificacion).toBeTruthy()
  })

  it('rechaza código vacío', () => {
    const { errores, payload } = validarSeguimientoLocal({
      codigo: '',
      identificacion: '1-1234-0567',
    })
    expect(payload).toBeNull()
    expect(errores.codigo).toBeTruthy()
  })

  it('rechaza identificación vacía', () => {
    const { errores, payload } = validarSeguimientoLocal({
      codigo: 'SOL-2026-00001',
      identificacion: '  ',
    })
    expect(payload).toBeNull()
    expect(errores.identificacion).toBeTruthy()
  })

  it('rechaza formato de código inválido', () => {
    const { errores, payload } = validarSeguimientoLocal({
      codigo: 'ABC-123',
      identificacion: '1-1234-0567',
    })
    expect(payload).toBeNull()
    expect(errores.codigo).toBeTruthy()
  })

  it('acepta y normaliza valores válidos', () => {
    const { errores, payload } = validarSeguimientoLocal({
      codigo: '  sol-2026-00001  ',
      identificacion: '  01-0234-0567  ',
    })
    expect(errores).toEqual({})
    expect(payload).toEqual({
      codigo: 'SOL-2026-00001',
      identificacion: '01-0234-0567',
    })
  })
})
