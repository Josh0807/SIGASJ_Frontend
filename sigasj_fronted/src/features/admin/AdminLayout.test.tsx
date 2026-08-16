import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from './AdminLayout'

const renderAdminRoute = (path: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/admin/a" element={<p>Pantalla A</p>} />
          <Route path="/admin/b" element={<p>Pantalla B</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )

describe('AdminLayout', () => {
  it('organiza sidebar, encabezado y área de contenido de la ruta', () => {
    const markup = renderAdminRoute('/admin/a')

    expect(markup).toContain('admin-layout')
    expect(markup).toContain('admin-sidebar')
    expect(markup).toContain('admin-main')
    expect(markup).toContain('admin-header')
    expect(markup).toContain('admin-header__actions')
    expect(markup).toContain('admin-main__content')
    expect(markup).toContain('Pantalla A')
  })

  it('reutiliza el mismo layout y deja que el router elija la pantalla', () => {
    const first = renderAdminRoute('/admin/a')
    const second = renderAdminRoute('/admin/b')

    expect(first).toContain('admin-layout')
    expect(first).toContain('Pantalla A')
    expect(first).not.toContain('Pantalla B')

    expect(second).toContain('admin-layout')
    expect(second).toContain('Pantalla B')
    expect(second).not.toContain('Pantalla A')
  })

  it('renderiza las rutas hijas solo en el area de contenido', () => {
    const markup = renderAdminRoute('/admin/a')
    const contentStart = markup.indexOf('admin-main__content')
    const beforeContent = markup.slice(0, contentStart)
    const content = markup.slice(contentStart)

    expect(beforeContent).toContain('admin-sidebar')
    expect(beforeContent).toContain('admin-header')
    expect(beforeContent).not.toContain('Pantalla A')
    expect(content).toContain('Pantalla A')
  })

  it('mantiene los enlaces del sidebar al cambiar la ruta hija', () => {
    const first = renderAdminRoute('/admin/a')
    const second = renderAdminRoute('/admin/b')

    expect(first).toContain('admin-sidebar__link')
    expect(second).toContain('admin-sidebar__link')
    expect(first).toContain('href="/admin/dashboard"')
    expect(second).toContain('href="/admin/dashboard"')
    expect(first).toContain('Pantalla A')
    expect(second).toContain('Pantalla B')
  })

  it('mantiene el orden estructural sidebar, encabezado y contenido', () => {
    const markup = renderAdminRoute('/admin/a')
    const sidebar = markup.indexOf('admin-sidebar')
    const header = markup.indexOf('admin-header')
    const content = markup.indexOf('admin-main__content')

    expect(sidebar).toBeGreaterThan(-1)
    expect(sidebar).toBeLessThan(header)
    expect(header).toBeLessThan(content)
  })

  it('muestra sidebar y encabezado en cualquier ruta hija sin ocultarlos', () => {
    const first = renderAdminRoute('/admin/a')
    const second = renderAdminRoute('/admin/b')

    expect(first).toContain('admin-sidebar')
    expect(first).toContain('admin-header')
    expect(first).toContain('Pantalla A')
    expect(second).toContain('admin-sidebar')
    expect(second).toContain('admin-header')
    expect(second).toContain('Pantalla B')
  })

  it('no emite errores de consola al renderizar el layout', () => {
    const errors: unknown[] = []
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args)
    }

    try {
      renderAdminRoute('/admin/a')
      renderAdminRoute('/admin/b')
    } finally {
      console.error = originalError
    }

    expect(errors).toEqual([])
  })

  it('incluye el boton de menu con atributos de accesibilidad', () => {
    const markup = renderAdminRoute('/admin/a')

    expect(markup).toContain('admin-menu-toggle')
    expect(markup).toContain('aria-controls="admin-navigation"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('id="admin-navigation"')
    expect(markup).toContain('Abrir menú administrativo')
    expect(markup).not.toContain('admin-layout--nav-open')
    expect(markup).not.toContain('admin-nav-backdrop')
  })
})

const mountAdminRoute = async (path: string) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/admin/a" element={<p>Pantalla A</p>} />
            <Route path="/admin/dashboard" element={<p>Dashboard</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
  })

  return {
    container,
    unmount: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

const click = async (element: Element) => {
  await act(async () => {
    element.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
    )
  })
}

describe('AdminLayout menu movil', () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    document.body.style.overflow = ''
  })

  const mockMobileNav = (matches: boolean) => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('760px') ? matches : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia
  }

  it('abre y cierra el menu desde el boton', async () => {
    mockMobileNav(true)
    const app = await mountAdminRoute('/admin/a')
    const toggle = app.container.querySelector<HTMLButtonElement>('.admin-menu-toggle')

    expect(toggle).not.toBeNull()
    expect(toggle?.getAttribute('aria-expanded')).toBe('false')
    expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()

    await click(toggle!)

    expect(toggle?.getAttribute('aria-expanded')).toBe('true')
    expect(app.container.querySelector('.admin-layout--nav-open')).not.toBeNull()
    expect(app.container.querySelector('.admin-nav-backdrop')).not.toBeNull()
    expect(app.container.textContent).toContain('Pantalla A')

    await click(toggle!)

    expect(toggle?.getAttribute('aria-expanded')).toBe('false')
    expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()
    expect(app.container.querySelector('.admin-nav-backdrop')).toBeNull()
    expect(app.container.textContent).toContain('Pantalla A')

    await app.unmount()
  })

  it('cierra el menu al pulsar el fondo exterior', async () => {
    mockMobileNav(true)
    const app = await mountAdminRoute('/admin/a')
    const toggle = app.container.querySelector<HTMLButtonElement>('.admin-menu-toggle')

    await click(toggle!)
    expect(app.container.querySelector('.admin-layout--nav-open')).not.toBeNull()

    await click(app.container.querySelector('.admin-nav-backdrop')!)

    expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()
    expect(app.container.textContent).toContain('Pantalla A')

    await app.unmount()
  })

  it('cierra el menu al seleccionar una opcion', async () => {
    mockMobileNav(true)
    const app = await mountAdminRoute('/admin/a')
    const toggle = app.container.querySelector<HTMLButtonElement>('.admin-menu-toggle')

    await click(toggle!)
    expect(app.container.querySelector('.admin-layout--nav-open')).not.toBeNull()

    const dashboardLink = app.container.querySelector<HTMLAnchorElement>(
      '.admin-sidebar__link[href="/admin/dashboard"]',
    )
    expect(dashboardLink).not.toBeNull()
    await click(dashboardLink!)

    expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()
    expect(app.container.textContent).toContain('Dashboard')

    await app.unmount()
  })

  it('cierra el menu con Escape y mantiene el contenido accesible', async () => {
    mockMobileNav(true)
    const app = await mountAdminRoute('/admin/a')
    const toggle = app.container.querySelector<HTMLButtonElement>('.admin-menu-toggle')

    await click(toggle!)
    expect(app.container.querySelector('.admin-layout--nav-open')).not.toBeNull()

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })

    expect(app.container.querySelector('.admin-layout--nav-open')).toBeNull()
    expect(app.container.textContent).toContain('Pantalla A')
    expect(document.activeElement).toBe(toggle)

    await app.unmount()
  })
})
