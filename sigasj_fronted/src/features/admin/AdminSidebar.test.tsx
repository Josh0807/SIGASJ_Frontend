import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { ADMIN_NAV_ITEMS } from '../../routes/privateRoutes'
import AdminSidebar from './AdminSidebar'

const renderSidebar = (
  path = '/',
  items?: Parameters<typeof AdminSidebar>[0]['items'],
) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <AdminSidebar items={items} />
    </MemoryRouter>,
  )

describe('AdminSidebar', () => {
  it('muestra la identificacion visual de SIGASJ', () => {
    const markup = renderSidebar()

    expect(markup).toContain('admin-sidebar__brand')
    expect(markup).toContain('admin-sidebar__logo')
    expect(markup).toContain('SIGASJ')
    expect(markup).toContain('ASADA San Juan')
  })

  it('renderiza el contenedor de opciones con multiples enlaces', () => {
    const markup = renderSidebar()

    expect(markup).toContain('admin-sidebar__nav')
    expect(ADMIN_NAV_ITEMS.length).toBeGreaterThan(1)
    for (const { path, title } of ADMIN_NAV_ITEMS) {
      expect(markup).toContain(`href="${path}"`)
      expect(markup).toContain(title)
    }
  })

  it('soporta texto e iconos en cada opcion', () => {
    const markup = renderSidebar()
    const iconCount = markup.split('admin-sidebar__icon').length - 1
    const labelCount = markup.split('admin-sidebar__label').length - 1

    expect(iconCount).toBe(ADMIN_NAV_ITEMS.length)
    expect(labelCount).toBe(ADMIN_NAV_ITEMS.length)
    for (const { path, icon } of ADMIN_NAV_ITEMS) {
      expect(markup).toContain(`href="${path}"`)
      expect(markup).toContain(`data-icon="${icon}"`)
    }
  })

  it('usa NavLink internos y no recarga la aplicacion', () => {
    const markup = renderSidebar()

    expect(markup).toContain('admin-sidebar__link')
    expect(markup).not.toContain('target="_blank"')
    expect(markup).not.toContain('http://')
  })

  it('puede recibir un conjunto distinto de opciones segun el usuario', () => {
    const markup = renderSidebar('/', [
      { path: '/admin/dashboard', title: 'Dashboard', icon: 'dashboard' },
      { path: '/admin/abonados', title: 'Abonados', icon: 'abonados' },
    ])

    expect(markup).toContain('href="/admin/dashboard"')
    expect(markup).toContain('href="/admin/abonados"')
    expect(markup).toContain('Dashboard')
    expect(markup).toContain('Abonados')
    expect(markup).not.toContain('href="/admin/inventario"')
    expect(markup).not.toContain('Gestión de inventario')
  })

  it('permite agregar un modulo nuevo desde la configuracion', () => {
    const markup = renderSidebar('/', [
      ...ADMIN_NAV_ITEMS,
      { path: '/admin/nuevo-modulo', title: 'Nuevo módulo', icon: 'dashboard' },
    ])

    expect(markup).toContain('href="/admin/nuevo-modulo"')
    expect(markup).toContain('Nuevo módulo')
  })

  it('no incluye el area de contenido del panel', () => {
    const markup = renderSidebar()

    expect(markup).toContain('admin-sidebar')
    expect(markup).not.toContain('admin-main__content')
    expect(markup).not.toContain('admin-header')
  })

  it('marca visualmente la opcion de la ruta activa', () => {
    const markup = renderSidebar('/admin/abonados')
    const abonadosStart = markup.indexOf('href="/admin/abonados"')
    const dashboardStart = markup.indexOf('href="/admin/dashboard"')
    const abonadosLink = markup.slice(abonadosStart - 180, abonadosStart + 220)
    const dashboardLink = markup.slice(dashboardStart - 180, dashboardStart + 220)

    expect(markup).toContain('admin-sidebar__link--active')
    expect(markup).toContain('admin-sidebar__active-mark')
    expect(abonadosLink).toContain('aria-current="page"')
    expect(abonadosLink).toContain('admin-sidebar__link--active')
    expect(dashboardLink).not.toContain('aria-current="page"')
    expect(dashboardLink).not.toContain('admin-sidebar__link--active')
  })

  it('cambia el indicador al navegar a otro modulo', () => {
    const abonados = renderSidebar('/admin/abonados')
    const averias = renderSidebar('/admin/averias')

    expect(abonados).toContain('href="/admin/abonados"')
    expect(abonados).toContain('aria-current="page"')
    expect(averias).toContain('href="/admin/averias"')
    expect(averias).toContain('aria-current="page"')
    expect(abonados.split('aria-current="page"').length - 1).toBe(1)
    expect(averias.split('aria-current="page"').length - 1).toBe(1)
  })

  it('mantiene activo el modulo en rutas secundarias', () => {
    const markup = renderSidebar('/admin/galeria/foto-12')
    const galeriaStart = markup.indexOf('href="/admin/galeria"')
    const galeriaLink = markup.slice(galeriaStart - 180, galeriaStart + 260)

    expect(galeriaLink).toContain('admin-sidebar__link--active')
    expect(galeriaLink).toContain('aria-current="page"')
    expect(markup).toContain('admin-sidebar__active-mark')
  })

  it('permite enfocar los enlaces con teclado', () => {
    const markup = renderSidebar('/admin/dashboard')

    expect(markup).toContain('admin-sidebar__link')
    expect(markup).not.toContain('tabindex="-1"')
  })
})
