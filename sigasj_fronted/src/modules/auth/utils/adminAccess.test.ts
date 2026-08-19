import { describe, expect, it } from 'vitest'
import {
  evaluateAdminAreaAccess,
  evaluateAdminRouteAccess,
  evaluateDirectRouteAccess,
  evaluateRoleAccess,
} from './adminAccess'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { ABONADO_ROLE } from './internalRoles'
import { ABONADOS_ALLOWED_ROLES } from '../config/adminNavigation.config'

describe('adminAccess', () => {
  const administradora = { role: 'Administradora', id: '1' }
  const secretaria = { role: 'Secretaria', id: '2' }
  const abonado = { role: ABONADO_ROLE, id: '4' }
  const personalPaths = ['/mis-datos'] as const

  it('envía al login cuando no hay sesión', () => {
    expect(evaluateAdminAreaAccess(false, null)).toEqual({
      to: LOGIN_ROUTE_PATH,
    })
    expect(evaluateAdminRouteAccess(false, null, '/admin/usuarios')).toEqual({
      to: LOGIN_ROUTE_PATH,
      state: { from: '/admin/usuarios' },
    })
    expect(evaluateAdminRouteAccess(false, null, '/admin/abonados')).toEqual({
      to: LOGIN_ROUTE_PATH,
      state: { from: '/admin/abonados' },
    })
    expect(evaluateDirectRouteAccess(false, null, '/admin/abonados')).toEqual({
      to: LOGIN_ROUTE_PATH,
      state: { from: '/admin/abonados' },
    })
  })

  it('permite el área admin a roles internos válidos', () => {
    expect(evaluateAdminAreaAccess(true, administradora)).toBe('allow')
    expect(evaluateAdminRouteAccess(true, administradora, '/admin/usuarios')).toBe(
      'allow',
    )
    expect(evaluateAdminRouteAccess(true, administradora, '/admin/abonados')).toBe(
      'allow',
    )
    expect(
      evaluateDirectRouteAccess(true, administradora, '/admin/abonados/11'),
    ).toBe('allow')
  })

  it('bloquea rutas no permitidas con pantalla de no autorizado', () => {
    expect(evaluateAdminRouteAccess(true, secretaria, '/admin/usuarios')).toEqual({
      to: UNAUTHORIZED_ROUTE_PATH,
    })
  })

  it('deniega al Abonado las rutas administrativas de Gestión de abonados', () => {
    expect(evaluateAdminAreaAccess(true, abonado)).toEqual({
      to: UNAUTHORIZED_ROUTE_PATH,
    })
    expect(evaluateAdminRouteAccess(true, abonado, '/admin/abonados')).toEqual({
      to: UNAUTHORIZED_ROUTE_PATH,
    })
    expect(evaluateAdminRouteAccess(true, { role: 'ABONADO', id: '9' }, '/admin/abonados')).toEqual(
      { to: UNAUTHORIZED_ROUTE_PATH },
    )
    expect(evaluateAdminRouteAccess(true, abonado, '/admin/abonados/11')).toEqual({
      to: UNAUTHORIZED_ROUTE_PATH,
    })
    expect(evaluateAdminRouteAccess(true, abonado, '/admin/abonados/nuevo')).toEqual({
      to: UNAUTHORIZED_ROUTE_PATH,
    })
    expect(evaluateAdminRouteAccess(true, abonado, '/admin/perfil')).toEqual({
      to: UNAUTHORIZED_ROUTE_PATH,
    })
  })

  it('con sesión válida de Abonado no envía al login al escribir una URL administrativa', () => {
    const deniedPaths = [
      '/admin/abonados',
      '/admin/abonados/11',
      '/admin/abonados/nuevo',
      '/admin/dashboard',
    ]

    for (const path of deniedPaths) {
      expect(evaluateDirectRouteAccess(true, abonado, path)).toEqual({
        to: UNAUTHORIZED_ROUTE_PATH,
      })
    }
  })

  it('sin sesión redirige al login también en una ruta personal del Abonado', () => {
    expect(
      evaluateDirectRouteAccess(
        false,
        null,
        '/mis-datos',
        undefined,
        personalPaths,
      ),
    ).toEqual({
      to: LOGIN_ROUTE_PATH,
      state: { from: '/mis-datos' },
    })
  })

  it('Abonado autenticado entra a una ruta personal autorizada', () => {
    expect(
      evaluateDirectRouteAccess(
        true,
        abonado,
        '/mis-datos',
        [ABONADO_ROLE],
        personalPaths,
      ),
    ).toBe('allow')
  })

  it('Administradora no usa una ruta personal del Abonado', () => {
    expect(
      evaluateDirectRouteAccess(
        true,
        administradora,
        '/mis-datos',
        [ABONADO_ROLE],
        personalPaths,
      ),
    ).toEqual({ to: UNAUTHORIZED_ROUTE_PATH })
  })

  it('evaluateRoleAccess cubre los tres resultados del guard de Gestión de Abonados', () => {
    expect(
      evaluateRoleAccess(false, null, ABONADOS_ALLOWED_ROLES, '/admin/abonados'),
    ).toEqual({
      to: LOGIN_ROUTE_PATH,
      state: { from: '/admin/abonados' },
    })
    expect(
      evaluateRoleAccess(true, administradora, ABONADOS_ALLOWED_ROLES, '/admin/abonados'),
    ).toBe('allow')
    expect(
      evaluateRoleAccess(true, secretaria, ABONADOS_ALLOWED_ROLES, '/admin/abonados'),
    ).toBe('allow')
    expect(
      evaluateRoleAccess(true, abonado, ABONADOS_ALLOWED_ROLES, '/admin/abonados'),
    ).toEqual({ to: UNAUTHORIZED_ROUTE_PATH })
    expect(
      evaluateRoleAccess(
        true,
        { role: 'Fontanero', id: '3' },
        ABONADOS_ALLOWED_ROLES,
        '/admin/abonados',
      ),
    ).toEqual({ to: UNAUTHORIZED_ROUTE_PATH })
  })

  it('acepta la lista de roles declarada en la ruta sin repetir if por rol', () => {
    expect(
      evaluateAdminRouteAccess(
        true,
        administradora,
        '/admin/abonados',
        ABONADOS_ALLOWED_ROLES,
      ),
    ).toBe('allow')
    expect(
      evaluateAdminRouteAccess(true, abonado, '/admin/abonados/11', ABONADOS_ALLOWED_ROLES),
    ).toEqual({ to: UNAUTHORIZED_ROUTE_PATH })
  })
})
