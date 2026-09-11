import { describe, expect, it } from 'vitest'
import { proveedorError, toProveedorPayload, validateProveedor } from './proveedorUtils'
import type { ProveedorFormValues } from './types'

const valid: ProveedorFormValues = { nombre: 'Ferretería ABC', razonSocial: '', identificacion: '', telefono: '', correo: '', direccion: '', personaContacto: '' }

describe('validación y normalización de proveedores', () => {
  it('acepta los campos opcionales vacíos y los convierte a null', () => {
    expect(validateProveedor(valid)).toEqual({})
    expect(toProveedorPayload({ ...valid, nombre: '  Ferretería ABC  ' })).toEqual({ nombre: 'Ferretería ABC', razonSocial: null, identificacion: null, telefono: null, correo: null, direccion: null, personaContacto: null })
  })
  it('rechaza nombre vacío y correo inválido', () => {
    const errors = validateProveedor({ ...valid, nombre: ' ', correo: 'correo-invalido' })
    expect(errors.nombre).toContain('obligatorio')
    expect(errors.correo).toContain('válido')
  })
  it('controla las longitudes de identificación y teléfono', () => {
    expect(validateProveedor({ ...valid, identificacion: '1'.repeat(51) }).identificacion).toBeTruthy()
    expect(validateProveedor({ ...valid, telefono: '1'.repeat(31) }).telefono).toBeTruthy()
  })
  it.each([400, 401, 403, 404, 409])('presenta HTTP %s de forma comprensible', (status) => {
    expect(proveedorError(new Error(`HTTP ${status}: mensaje backend`)).length).toBeGreaterThan(10)
  })
})
