import { beforeEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { clearAccessToken, setAccessToken } from '../features/auth/authStorage'
import AppRoutes from './AppRoutes'
import { PRIVATE_ROUTE_PATHS } from './privateRoutes'
import { PUBLIC_ROUTE_PATHS } from './publicRoutes'

const renderPath = (path: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )

describe('AppRoutes y AdminLayout', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('mantiene las rutas públicas fuera de AdminLayout', () => {
    for (const path of PUBLIC_ROUTE_PATHS) {
      expect(renderPath(path)).not.toContain('admin-layout')
    }

    expect(renderPath('/')).toContain('hero')
    expect(renderPath('/')).toContain('header__inner')
    expect(renderPath('/')).not.toContain('admin-header')
    expect(renderPath('/')).not.toContain('admin-sidebar')
    expect(renderPath('/login')).toContain('auth-page')
    expect(renderPath('/login')).not.toContain('admin-layout')
    expect(renderPath('/login')).not.toContain('admin-sidebar')
  })

  it('no muestra el panel administrativo sin el guard actual', () => {
    expect(renderPath('/dashboard')).not.toContain('admin-layout')
    expect(renderPath('/admin/abonados')).not.toContain('admin-layout')
  })

  it('reutiliza AdminLayout en todas las rutas privadas existentes', () => {
    setAccessToken('token-de-prueba')

    for (const path of PRIVATE_ROUTE_PATHS) {
      const markup = renderPath(path)
      expect(markup).toContain('admin-layout')
      expect(markup).toContain('admin-sidebar')
      expect(markup).toContain('admin-header')
      expect(markup).toContain('admin-main__content')
    }
  })
})
