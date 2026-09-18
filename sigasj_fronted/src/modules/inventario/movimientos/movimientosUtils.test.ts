import { describe, expect, it } from 'vitest'
import {
  formatMovimientoCantidad,
  formatMovimientoTipo,
  getMovimientoReferencia,
  movimientoErrorMessage,
} from './movimientosUtils'
import type { MovimientoInventario } from './types'

const movimientoBase: MovimientoInventario = {
  id: 1,
  tipo: 'SALIDA',
  cantidad: 4,
  fechaMovimiento: '2026-08-22T10:30:00.000Z',
  idMaterial: 2,
  idUsuario: 3,
  material: { id: 2, nombre: 'Tubo PVC', unidadMedida: 'Metro' },
  usuario: { id: 3, nombre: 'Juan Pérez' },
}

describe('movimientosUtils', () => {
  it('formatea tipo y cantidad con unidad', () => {
    expect(formatMovimientoTipo('ENTRADA')).toBe('Entrada')
    expect(formatMovimientoCantidad(movimientoBase)).toBe('4 Metro')
  })

  it('resuelve referencias conocidas', () => {
    expect(getMovimientoReferencia({ ...movimientoBase, referencia: 'AV-2026-0042' })).toBe('AV-2026-0042')
    expect(getMovimientoReferencia(movimientoBase)).toBe('Sin referencia')
  })

  it('traduce errores HTTP de movimientos', () => {
    expect(movimientoErrorMessage(new Error('HTTP 403'))).toContain('permiso')
    expect(movimientoErrorMessage(new Error('HTTP 404'))).toContain('no existe')
  })
})
