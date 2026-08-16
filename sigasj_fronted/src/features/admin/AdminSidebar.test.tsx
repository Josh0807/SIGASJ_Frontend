import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { ADMIN_NAV_ITEMS } from '../../routes/privateRoutes'
import AdminSidebar from './AdminSidebar'

const renderSidebar = (items?: Parameters<typeof AdminSidebar>[0]['items']) =>
  renderToStaticMarkup(
    <MemoryRouter>
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
  })

  it('puede recibir un conjunto distinto de opciones segun el usuario', () => {
    const markup = renderSidebar([
      { path: '/admin/dashboard', title: 'Dashboard' },
      { path: '/admin/abonados', title: 'Abonados' },
    ])

    expect(markup).toContain('href="/admin/dashboard"')
    expect(markup).toContain('href="/admin/abonados"')
    expect(markup).toContain('Dashboard')
    expect(markup).toContain('Abonados')
    expect(markup).not.toContain('href="/admin/inventario"')
    expect(markup).not.toContain('Gestión de inventario')
  })

  it('permite agregar un modulo nuevo desde la configuracion', () => {
    const markup = renderSidebar([
      ...ADMIN_NAV_ITEMS,
      { path: '/admin/nuevo-modulo', title: 'Nuevo módulo' },
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
})
