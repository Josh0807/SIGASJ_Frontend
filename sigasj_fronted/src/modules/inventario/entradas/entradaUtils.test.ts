import { describe, expect, it } from 'vitest'
import { entradaError, toEntradaPayload, validateEntrada } from './entradaUtils'
import type { EntradaFormValues } from './types'

const valid: EntradaFormValues = { materialId: '4', cantidad: '12', proveedorId: '', observacion: '  Recibido completo  ' }

describe('validación de entradas', () => {
  it('acepta una entrada válida y normaliza opcionales', () => {
    expect(validateEntrada(valid)).toEqual({})
    expect(toEntradaPayload(valid)).toEqual({ idMaterial: 4, cantidad: 12, idProveedor: null, observacion: 'Recibido completo' })
  })
  it.each(['', '0', '-1', '1.5'])('rechaza cantidad inválida %j', (cantidad) => expect(validateEntrada({ ...valid, cantidad }).cantidad).toBeTruthy())
  it('exige material y valida proveedor', () => {
    expect(validateEntrada({ ...valid, materialId: '' }).materialId).toBeTruthy()
    expect(validateEntrada({ ...valid, proveedorId: '-2' }).proveedorId).toBeTruthy()
  })
  it('limita observaciones a 1000 caracteres', () => expect(validateEntrada({ ...valid, observacion: 'x'.repeat(1001) }).observacion).toBeTruthy())
  it.each([400, 401, 403, 404, 500])('traduce HTTP %s a un mensaje comprensible', (status) => expect(entradaError(new Error(`HTTP ${status}: detalle`))).toBeTruthy())
})
