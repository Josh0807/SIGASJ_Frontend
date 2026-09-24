import { describe, expect, it } from 'vitest'
import {
  adminAveriaReturnPath,
  fontaneroAveriaReturnPath,
  isSafeAveriaReturnPath,
  readSafeAveriaReturnPath,
  salidaDesdeAveriaHref,
  solicitudMaterialesDesdeAveriaHref,
} from './averiaInventarioPaths'

describe('averiaInventarioPaths', () => {
  it('acepta solo retornos al detalle de avería', () => {
    expect(isSafeAveriaReturnPath('/fontanero/averias/14')).toBe(true)
    expect(isSafeAveriaReturnPath('/admin/averias/14')).toBe(true)
    expect(isSafeAveriaReturnPath('https://evil.example/fontanero/averias/14')).toBe(false)
    expect(isSafeAveriaReturnPath('//evil.example')).toBe(false)
    expect(isSafeAveriaReturnPath('/admin/inventario/salidas')).toBe(false)
    expect(readSafeAveriaReturnPath('/fontanero/averias/14/?x=1')).toBe(
      '/fontanero/averias/14',
    )
  })

  it('conserva idAveria en las rutas existentes de Inventario', () => {
    expect(solicitudMaterialesDesdeAveriaHref(14, 'AV-2026-0014', fontaneroAveriaReturnPath(14))).toBe(
      '/admin/inventario/solicitudes-materiales/nueva?idAveria=14&referencia=AV-2026-0014&from=%2Ffontanero%2Faverias%2F14',
    )
    expect(salidaDesdeAveriaHref(14, adminAveriaReturnPath(14))).toBe(
      '/admin/inventario/salidas?idAveria=14&from=%2Fadmin%2Faverias%2F14',
    )
  })
})
