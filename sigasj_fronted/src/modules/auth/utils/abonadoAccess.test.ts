import { describe, expect, it } from 'vitest'
import {
  ABONADO_PERSONAL_NAV_ITEMS,
  ABONADO_PERSONAL_ROUTE_PATHS,
  ADMINISTRATIVE_ABONADOS_PATH,
  canAbonadoAccessRoute,
  getAbonadoPersonalNavItems,
  isAbonadoPersonalRoute,
  isAdministrativeAbonadosPath,
  toAbonadoPersonalRoutePath,
} from './abonadoAccess'

describe('acceso del rol Abonado al módulo de Gestión de Abonados', () => {
  it('reconoce el padrón administrativo y cualquier sufijo como función no permitida', () => {
    expect(ADMINISTRATIVE_ABONADOS_PATH).toBe('/admin/abonados')
    expect(isAdministrativeAbonadosPath('/admin/abonados')).toBe(true)
    expect(isAdministrativeAbonadosPath('/admin/abonados/')).toBe(true)
    expect(isAdministrativeAbonadosPath('/admin/abonados/11')).toBe(true)
    expect(isAdministrativeAbonadosPath('/admin/abonados/nuevo')).toBe(true)
    expect(isAdministrativeAbonadosPath('/admin/usuarios')).toBe(false)
    expect(isAdministrativeAbonadosPath('/admin/perfil')).toBe(false)
  })

  it('no inventa pantallas personales: no existen mis datos ni solicitud de cambios autenticada', () => {
    expect(ABONADO_PERSONAL_NAV_ITEMS).toEqual([])
    expect(ABONADO_PERSONAL_ROUTE_PATHS).toEqual([])
    expect(isAbonadoPersonalRoute('/admin/abonados')).toBe(false)
    expect(isAbonadoPersonalRoute('/admin/abonados/me')).toBe(false)
    expect(isAbonadoPersonalRoute('/admin/perfil')).toBe(false)
    expect(getAbonadoPersonalNavItems({ role: 'Abonado', id: '4' })).toEqual([])
    expect(getAbonadoPersonalNavItems({ role: 'Administradora', id: '1' })).toEqual(
      [],
    )
  })

  it('deniega listado, registro, edición y detalle por URL con o sin ID', () => {
    expect(canAbonadoAccessRoute('/admin/abonados')).toBe(false)
    expect(canAbonadoAccessRoute('/admin/abonados/11')).toBe(false)
    expect(canAbonadoAccessRoute('/admin/abonados/nuevo')).toBe(false)
    expect(canAbonadoAccessRoute('/admin/abonados/11/editar')).toBe(false)
  })

  it('solo autoriza rutas personales que ya existen en el catálogo', () => {
    expect(canAbonadoAccessRoute('/mis-datos')).toBe(false)
    expect(canAbonadoAccessRoute('/mis-datos', ['/mis-datos'])).toBe(true)
    expect(canAbonadoAccessRoute('/admin/abonados', ['/mis-datos'])).toBe(false)
    expect(toAbonadoPersonalRoutePath('/mis-datos')).toBe('mis-datos')
  })
})
