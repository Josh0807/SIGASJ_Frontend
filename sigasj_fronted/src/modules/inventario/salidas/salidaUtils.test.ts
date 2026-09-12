import { describe, expect, it } from 'vitest'
import { parseRelatedId, salidaError, toSalidaPayload, validateSalida } from './salidaUtils'

describe('utilidades del formulario de salida', () => {
  it('valida material, cantidad positiva entera y longitud de observación', () => {
    expect(validateSalida({ materialId: '', cantidad: '0', observacion: '' })).toMatchObject({ materialId: expect.any(String), cantidad: expect.stringContaining('mayor a cero') })
    expect(validateSalida({ materialId: '2', cantidad: '1.5', observacion: '' }).cantidad).toContain('entero')
    expect(validateSalida({ materialId: '2', cantidad: '3', observacion: 'a'.repeat(1001) }).observacion).toContain('1000')
    expect(validateSalida({ materialId: '2', cantidad: '3', observacion: ' Reparación ' })).toEqual({})
  })

  it('crea el contrato sin id de usuario y conserva relaciones opcionales', () => {
    const payload = toSalidaPayload({ materialId: '4', cantidad: '2', observacion: '  Fuga  ' }, 12, null)
    expect(payload).toEqual({ idMaterial: 4, cantidad: 2, idAveria: 12, idSolicitud: null, observacion: 'Fuga' })
    expect(payload).not.toHaveProperty('idUsuario')
    expect(parseRelatedId('7')).toBe(7)
    expect(parseRelatedId('-1')).toBeNull()
  })

  it('presenta directamente el mensaje corregible del backend', () => {
    expect(salidaError(new Error('HTTP 400: Stock insuficiente. Existencias disponibles: 5'))).toContain('Existencias disponibles: 5')
    expect(salidaError(new Error('HTTP 401: Unauthorized'))).toContain('sesión venció')
    expect(salidaError(new Error('HTTP 403: Forbidden resource'))).toContain('No tiene permisos')
    expect(salidaError(new Error('HTTP 404: El material con ID 99 no fue encontrado'))).toContain('material con ID 99')
  })
})
