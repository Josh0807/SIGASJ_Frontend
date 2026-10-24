import { describe, expect, it } from 'vitest'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/routePaths'
import { evaluateDirectRouteAccess } from '../../auth/utils/adminAccess'
import { solicitudesAdminHttpStatus } from './useSolicitudesAdminSecurity'

describe('seguridad frontend de solicitudes administrativas', () => {
  const detailPath = '/admin/solicitudes/15'

  it('redirige una URL directa anónima al login conservando el destino', () => {
    expect(evaluateDirectRouteAccess(false, null, detailPath)).toEqual({
      to: LOGIN_ROUTE_PATH,
      state: { from: detailPath },
    })
  })

  it.each(['Abonado', 'Ayudante'])('rechaza acceso directo al rol %s', (role) => {
    expect(evaluateDirectRouteAccess(true, { id: '8', role }, detailPath)).toEqual({ to: UNAUTHORIZED_ROUTE_PATH })
  })

  it.each(['Administradora', 'Secretaria', 'Fontanero'])('permite acceso directo al rol %s', (role) => {
    expect(evaluateDirectRouteAccess(true, { id: '2', role }, detailPath)).toBe('allow')
  })

  it('distingue 401 y 403 sin clasificar otros errores como seguridad', () => {
    expect(solicitudesAdminHttpStatus(new Error('HTTP 401: No autenticado'))).toBe(401)
    expect(solicitudesAdminHttpStatus(new Error('HTTP 403: Acceso denegado'))).toBe(403)
    expect(solicitudesAdminHttpStatus(new Error('HTTP 500: Error interno'))).toBeNull()
  })
})
