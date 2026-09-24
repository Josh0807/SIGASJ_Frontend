import { describe, expect, it } from 'vitest'
import { rutaAveriaNotificacion } from './rutaAveriaNotificacion'

describe('rutaAveriaNotificacion', () => {
  it('lleva a Administradora y Secretaria al detalle administrativo', () => {
    expect(
      rutaAveriaNotificacion({ role: 'Administradora', id: '1' }, 25),
    ).toBe('/admin/averias/25')
    expect(rutaAveriaNotificacion({ role: 'Secretaria', id: '2' }, 25)).toBe(
      '/admin/averias/25',
    )
  })

  it('lleva al Fontanero a su detalle y no al listado administrativo', () => {
    expect(rutaAveriaNotificacion({ role: 'Fontanero', id: '3' }, 25)).toBe(
      '/fontanero/averias/25',
    )
    expect(rutaAveriaNotificacion({ role: 'Fontanero', id: '3' }, 25)).not.toBe(
      '/admin/averias/25',
    )
  })

  it('no inventa una ruta para un rol sin acceso a Averías', () => {
    expect(rutaAveriaNotificacion({ role: 'Abonado', id: '9' }, 25)).toBeNull()
    expect(rutaAveriaNotificacion(null, 25)).toBeNull()
  })
})
