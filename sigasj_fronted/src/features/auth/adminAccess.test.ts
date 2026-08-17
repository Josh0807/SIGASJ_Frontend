import { describe, expect, it } from 'vitest'
import {
  evaluateAdminAreaAccess,
  evaluateAdminRouteAccess,
} from './adminAccess'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../routes/routePaths'

describe('adminAccess', () => {
  const administradora = { rol: 'Administradora', idUsuario: 1 }
  const secretaria = { rol: 'Secretaria', idUsuario: 2 }

  it('envía al login cuando no hay sesión', () => {
    expect(evaluateAdminAreaAccess(false, null)).toEqual({
      to: LOGIN_ROUTE_PATH,
    })
    expect(evaluateAdminRouteAccess(false, null, '/admin/usuarios')).toEqual({
      to: LOGIN_ROUTE_PATH,
      state: { from: '/admin/usuarios' },
    })
  })

  it('permite el área admin a roles internos válidos', () => {
    expect(evaluateAdminAreaAccess(true, administradora)).toBe('allow')
    expect(evaluateAdminRouteAccess(true, administradora, '/admin/usuarios')).toBe(
      'allow',
    )
  })

  it('bloquea rutas no permitidas con pantalla de no autorizado', () => {
    expect(evaluateAdminRouteAccess(true, secretaria, '/admin/usuarios')).toEqual({
      to: UNAUTHORIZED_ROUTE_PATH,
    })
  })
})
