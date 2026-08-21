import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  ABONADO_PERSONAL_ROUTE_PATHS,
  isAdministrativeAbonadosPath,
} from '../../modules/auth/utils/abonadoAccess'
import { getAuthUser, isAuthenticated } from '../../modules/auth/utils/authStorage'
import { clearAccessToken } from '../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../test/authTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from './publicRoutes'

const FOREIGN_ABONADO_IDS = ['11', '99', 'abonado-b-id'] as const

const looksLikeForeignAbonadoRecord = (html: string) =>
  html.includes('cedula') ||
  html.includes('idAbonado') ||
  html.includes('número de medidor') ||
  html.includes('abonado-b@') ||
  html.includes('Abonado Beta')

describe('aislamiento de datos — Abonado no consulta otro registro por ID', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
  })

  it('no hay ruta personal autenticada que reciba un identificador de padrón', () => {
    expect(ABONADO_PERSONAL_ROUTE_PATHS).toEqual([])
    expect(ABONADO_PERSONAL_ROUTE_PATHS.some((path) => path.includes(':id'))).toBe(
      false,
    )
  })

  it.each([...FOREIGN_ABONADO_IDS])(
    'cambiar la URL a /admin/abonados/%s no muestra datos de otro abonado',
    async (foreignId) => {
      loginAsRole('Abonado', 'abonado-a-id')
      const path = `/admin/abonados/${foreignId}`
      const app = await mountAppRoutes(path)

      try {
        expect(isAdministrativeAbonadosPath(path)).toBe(true)
        expect(isAuthenticated()).toBe(true)
        expect(getAuthUser()?.id).toBe('abonado-a-id')
        expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
        expect(app.currentPath()).not.toBe(path)
        expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
        expect(app.container.innerHTML).toContain('Acceso denegado')
        expect(app.container.innerHTML).not.toContain('Gestión de abonados')
        expect(looksLikeForeignAbonadoRecord(app.container.innerHTML)).toBe(false)
      } finally {
        await app.cleanup()
      }
    },
  )
})
