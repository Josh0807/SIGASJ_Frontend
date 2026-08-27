import { describe, expect, it } from 'vitest'
import {
  PROYECTOS_ADMIN_NEW_PATH,
  PROYECTOS_ADMIN_PATH,
  PROYECTOS_ADMIN_PENDING_ACTION_ROUTES,
  PROYECTOS_ADMIN_PENDING_INTEGRATIONS,
  proyectosAdminDetailPath,
  proyectosAdminEditPath,
  proyectosAdminImagesPath,
} from './proyectosAdminPaths'

describe('proyectosAdminPaths', () => {
  it('define las rutas administrativas acordadas a partir del id real', () => {
    expect(PROYECTOS_ADMIN_PATH).toBe('/admin/proyectos')
    expect(PROYECTOS_ADMIN_NEW_PATH).toBe('/admin/proyectos/nuevo')
    expect(proyectosAdminDetailPath(12)).toBe('/admin/proyectos/12')
    expect(proyectosAdminEditPath(12)).toBe('/admin/proyectos/12/editar')
    expect(proyectosAdminImagesPath(12)).toBe('/admin/proyectos/12/imagenes')
  })

  it('registra ver e imágenes como pantallas pendientes del router', () => {
    expect(PROYECTOS_ADMIN_PENDING_ACTION_ROUTES).toEqual([
      'ver',
      'imagenes',
    ])
  })

  it('registra el cambio de estado como integración pendiente del Backend', () => {
    expect(PROYECTOS_ADMIN_PENDING_INTEGRATIONS).toEqual(['cambio-estado'])
  })
})
