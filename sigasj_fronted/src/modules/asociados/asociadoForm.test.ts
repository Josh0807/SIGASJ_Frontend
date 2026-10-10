import { describe, expect, it } from 'vitest'
import { asociadoSubmitError, asociadoUpdateError, toActualizarAsociadoPayload, toRegistrarAsociadoPayload, validateAsociado } from './asociadoForm'

describe('formulario de asociados', () => {
  it('marca todos los campos obligatorios', () => {
    expect(validateAsociado({ nombre: ' ', apellidos: '', cedula: '', correoElectronico: '' })).toEqual({
      nombre: 'El nombre es obligatorio.',
      apellidos: 'Los apellidos son obligatorios.',
      cedula: 'La cédula es obligatoria.',
      correoElectronico: 'El correo electrónico es obligatorio.',
    })
  })

  it('valida el correo y los límites del contrato', () => {
    const errors = validateAsociado({
      nombre: 'N'.repeat(101),
      apellidos: 'A'.repeat(101),
      cedula: '1'.repeat(31),
      correoElectronico: 'correo-invalido',
    })
    expect(Object.keys(errors)).toEqual(['nombre', 'apellidos', 'cedula', 'correoElectronico'])
  })

  it('limpia los datos y normaliza el correo sin enviar fechaRegistro', () => {
    expect(toRegistrarAsociadoPayload({ nombre: ' Juan ', apellidos: ' Pérez ', cedula: ' 1-2345 ', correoElectronico: ' JUAN@EJEMPLO.COM ' })).toEqual({
      nombre: 'Juan', apellidos: 'Pérez', cedula: '1-2345', correoElectronico: 'juan@ejemplo.com',
    })
  })

  it('traduce conflictos y permisos a mensajes útiles', () => {
    expect(asociadoSubmitError(new Error('HTTP 409: duplicado'))).toContain('cédula')
    expect(asociadoSubmitError(new Error('HTTP 403: Forbidden'))).toContain('permisos')
  })

  it('presenta las validaciones 400 del backend como texto legible', () => {
    expect(
      asociadoSubmitError(
        new Error(
          'HTTP 400: ["El correo electrónico no tiene un formato válido","El nombre es obligatorio"]',
        ),
      ),
    ).toBe(
      'El correo electrónico no tiene un formato válido. El nombre es obligatorio.',
    )
  })

  it('envía solamente los datos modificados al actualizar', () => {
    const initial = { nombre: 'Ana', apellidos: 'Mora', cedula: '1-1111', correoElectronico: 'ana@example.com' }
    expect(toActualizarAsociadoPayload({ ...initial, nombre: ' Ana María ' }, initial)).toEqual({ nombre: 'Ana María' })
    expect(toActualizarAsociadoPayload(initial, initial)).toEqual({})
  })

  it('identifica la cédula duplicada como error de campo', () => {
    expect(asociadoUpdateError(new Error('HTTP 409: duplicada')).cedula).toContain('cédula')
  })

  it('no expone detalles técnicos de SQL Server', () => {
    const result = asociadoUpdateError(
      new Error('HTTP 400: SQL Server duplicate key constraint UQ_asociados_cedula'),
    )
    expect(result.message).toBe('Revise los datos ingresados e inténtelo nuevamente.')
    expect(result.message).not.toMatch(/sql|constraint|duplicate key/i)
  })
})
