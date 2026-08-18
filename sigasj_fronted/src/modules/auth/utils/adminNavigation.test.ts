import { describe, expect, it } from 'vitest'
import {
  canAccessAdminRoute,
  getAdminNavItemsForUser,
  getDefaultAdminHomePath,
  hasAnyAdminAccess,
  isInternalAdminRole,
  resolvePostLoginAdminPath,
} from './adminNavigation'

describe('adminNavigation helpers', () => {
  const administradora = { role: 'Administradora', id: '1' }
  const secretaria = { role: 'Secretaria', id: '2' }
  const fontanero = { role: 'Fontanero', id: '3' }
  const abonado = { role: 'Abonado', id: '4' }

  it('identifica roles internos validos', () => {
    expect(isInternalAdminRole('Administradora')).toBe(true)
    expect(isInternalAdminRole('Abonado')).toBe(false)
  })

  it('Administradora accede a todos los modulos administrativos visibles', () => {
    const items = getAdminNavItemsForUser(administradora)
    expect(items.length).toBe(10)
    expect(canAccessAdminRoute(administradora, '/admin/usuarios')).toBe(true)
    expect(canAccessAdminRoute(administradora, '/admin/reportes')).toBe(true)
  })

  it('Secretaria no ve usuarios ni reportes', () => {
    const items = getAdminNavItemsForUser(secretaria)
    expect(items.map((item) => item.path)).not.toContain('/admin/usuarios')
    expect(items.map((item) => item.path)).not.toContain('/admin/reportes')
    expect(canAccessAdminRoute(secretaria, '/admin/usuarios')).toBe(false)
    expect(canAccessAdminRoute(secretaria, '/admin/abonados')).toBe(true)
  })

  it('Fontanero solo ve dashboard y averias', () => {
    const items = getAdminNavItemsForUser(fontanero)
    expect(items.map((item) => item.path)).toEqual([
      '/admin/dashboard',
      '/admin/averias',
    ])
    expect(canAccessAdminRoute(fontanero, '/admin/averias')).toBe(true)
    expect(canAccessAdminRoute(fontanero, '/admin/abonados')).toBe(false)
  })

  it('rol invalido no obtiene acceso administrativo', () => {
    expect(hasAnyAdminAccess(abonado)).toBe(false)
    expect(getAdminNavItemsForUser(abonado)).toEqual([])
    expect(getDefaultAdminHomePath(abonado)).toBeNull()
  })

  it('resuelve destino seguro tras login segun permisos', () => {
    expect(
      resolvePostLoginAdminPath(secretaria, '/admin/usuarios'),
    ).toBe('/admin/dashboard')
    expect(
      resolvePostLoginAdminPath(secretaria, '/admin/abonados'),
    ).toBe('/admin/abonados')
    expect(
      resolvePostLoginAdminPath(fontanero, '/admin/abonados'),
    ).toBe('/admin/dashboard')
  })
})
