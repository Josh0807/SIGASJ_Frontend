import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../auth/components/AuthContext'
import { clearAccessToken } from '../../auth/utils/authStorage'
import { loginWithAdminSession } from '../../../test/authTestHelpers'
import { setViewportWidth } from '../../../test/viewportHelpers'
import AppRoutes from '../../../app/router/AppRoutes'
import { PRIVATE_ROUTE_PATHS } from '../../../app/router/privateRoutes'
import ProyectosAdminPage from './ProyectosAdminPage'
import {
  PROYECTOS_ADMIN_NEW_PATH,
  PROYECTOS_ADMIN_PENDING_ACTION_ROUTES,
  proyectosAdminDetailPath,
  proyectosAdminEditPath,
  proyectosAdminImagesPath,
} from './proyectosAdminPaths'
import type { AdminProyecto, ProyectosAdminListado, QueryProyectosAdmin } from './types'
import * as proyectosApi from '../services/proyectosApi'

const cssPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../index.css',
)

const LocationProbe = ({ onPath }: { onPath: (path: string) => void }) => {
  const location = useLocation()

  useEffect(() => {
    onPath(location.pathname)
  }, [location.pathname, onPath])

  return null
}

const proyecto = (overrides: Partial<AdminProyecto> = {}): AdminProyecto => ({
  id: 7,
  nombre: 'Red de agua potable',
  descripcion: null,
  encargadoRealizacion: null,
  duracion: '8 meses',
  estado: 'EN_PROCESO',
  imagenPrincipal: null,
  activo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

const catalog: AdminProyecto[] = [
  proyecto(),
  proyecto({
    id: 8,
    nombre: 'Tanque de almacenamiento',
    estado: 'PENDIENTE',
    duracion: null,
    activo: false,
  }),
  proyecto({
    id: 9,
    nombre: 'Acueducto Sur',
    estado: 'COMPLETADO',
    duracion: '6 meses',
    activo: true,
  }),
]

const listado = (
  data: AdminProyecto[],
  page = 1,
  totalPages = data.length > 0 ? 1 : 0,
  total = data.length,
): ProyectosAdminListado => ({
  data,
  total,
  page,
  limit: 10,
  totalPages,
})

const filterCatalog = (query: QueryProyectosAdmin) => {
  let rows = [...catalog]

  if (query.nombre) {
    const needle = query.nombre.toLowerCase()
    rows = rows.filter((item) => item.nombre.toLowerCase().includes(needle))
  }

  if (query.estado) {
    rows = rows.filter((item) => item.estado === query.estado)
  }

  if (query.activo !== undefined) {
    rows = rows.filter((item) => item.activo === query.activo)
  }

  return rows
}

const respondToQuery = (query: QueryProyectosAdmin): ProyectosAdminListado => {
  const filtered = filterCatalog(query)
  const page = query.page ?? 1
  const unfiltered =
    !query.nombre && !query.estado && query.activo === undefined

  if (unfiltered) {
    const pageData =
      page === 1
        ? catalog
        : [
            proyecto({
              id: 100 + page,
              nombre: `Proyecto página ${page}`,
              estado: 'COMPLETADO',
              duracion: '4 meses',
              activo: true,
            }),
          ]

    return listado(pageData, page, 3, 22)
  }

  return listado(filtered, 1, filtered.length > 0 ? 1 : 0, filtered.length)
}

const setInputValue = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

const changeSelect = (select: HTMLSelectElement, value: string) => {
  select.value = value
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

const captureConsole = () => {
  const errors: unknown[] = []
  const warnings: unknown[] = []
  const originalError = console.error
  const originalWarn = console.warn

  console.error = (...args: unknown[]) => {
    errors.push(args)
  }
  console.warn = (...args: unknown[]) => {
    warnings.push(args)
  }

  return {
    errors,
    warnings,
    restore: () => {
      console.error = originalError
      console.warn = originalWarn
    },
  }
}

const clickElement = async (element: Element) => {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    button: 0,
  })

  await act(async () => {
    element.dispatchEvent(event)
  })

  return event
}

describe('Pruebas funcionales — /admin/proyectos', () => {
  let container: HTMLDivElement
  let root: Root
  const originalMatchMedia = window.matchMedia
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    vi.spyOn(proyectosApi, 'getAdminProyectos').mockImplementation(
      async (query) => respondToQuery(query),
    )
    vi.spyOn(proyectosApi, 'getAdminProyecto').mockImplementation(async (id) => {
      const found = catalog.find((item) => item.id === id) ?? proyecto({ id })
      return { ...found, imagenes: [] }
    })
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    clearAccessToken()
    loginWithAdminSession()
    setViewportWidth(1280)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    window.matchMedia = originalMatchMedia
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: originalInnerWidth,
    })
    vi.useRealTimers()
    vi.restoreAllMocks()
    clearAccessToken()
  })

  const flush = async () => {
    await act(async () => {
      await Promise.resolve()
    })
  }

  const renderPage = async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProyectosAdminPage />
        </MemoryRouter>,
      )
    })
    await flush()
  }

  const renderApp = async (path: string) => {
    let pathname = path

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[path]}>
          <LocationProbe
            onPath={(nextPath) => {
              pathname = nextPath
            }}
          />
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </MemoryRouter>,
      )
    })
    await flush()

    return {
      currentPath: () => pathname,
    }
  }

  const searchInput = () =>
    container.querySelector('#proyectos-admin-buscar') as HTMLInputElement
  const estadoSelect = () =>
    container.querySelector('#proyectos-admin-estado') as HTMLSelectElement
  const activoSelect = () =>
    container.querySelector('#proyectos-admin-activo') as HTMLSelectElement
  const buttonNamed = (label: string) =>
    Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === label,
    )

  it('Prueba 1 — Acceso: Administradora ve AdminLayout sin recarga completa', async () => {
    const consoleProbe = captureConsole()
    const app = await renderApp('/admin/dashboard')

    try {
      const sidebar = container.querySelector('.admin-sidebar')
      const header = container.querySelector('.admin-header')
      const content = container.querySelector('.admin-main__content')
      const link = container.querySelector<HTMLAnchorElement>(
        '.admin-sidebar__link[href="/admin/proyectos"]',
      )

      expect(sidebar).not.toBeNull()
      expect(header).not.toBeNull()
      expect(link).not.toBeNull()
      expect(link?.textContent).toContain('Gestión de Proyectos')

      const click = await clickElement(link!)
      await flush()

      expect(click.defaultPrevented).toBe(true)
      expect(app.currentPath()).toBe('/admin/proyectos')
      expect(container.querySelector('.admin-sidebar')).toBe(sidebar)
      expect(container.querySelector('.admin-header')).toBe(header)
      expect(container.querySelector('.admin-main__content')).toBe(content)
      expect(container.querySelector('.admin-layout')).not.toBeNull()
      expect(container.textContent).toContain('Gestión de Proyectos')
      expect(container.querySelector('.proyectos-admin')).not.toBeNull()
      expect(consoleProbe.errors).toEqual([])
      expect(consoleProbe.warnings).toEqual([])
    } finally {
      consoleProbe.restore()
    }
  })

  it('Prueba 2 — Datos: muestra nombre, estado, duración, visibilidad y acciones', async () => {
    await renderPage()

    expect(container.textContent).toContain('Proyecto')
    expect(container.textContent).toContain('Estado')
    expect(container.textContent).toContain('Duración')
    expect(container.textContent).toContain('Visibilidad')
    expect(container.textContent).toContain('Acciones')
    expect(container.textContent).toContain('Red de agua potable')
    expect(container.textContent).toContain('En proceso')
    expect(container.textContent).toContain('8 meses')
    expect(container.textContent).toContain('Activo')
    expect(container.textContent).toContain('Tanque de almacenamiento')
    expect(container.textContent).toContain('Pendiente')
    expect(container.textContent).toContain('Inactivo')
    expect(container.textContent).toContain('Ver')
    expect(container.textContent).toContain('Editar')
    expect(container.textContent).toContain('Gestionar imágenes')
    expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
  })

  it('Prueba 3 — Búsqueda: consulta al Backend, muestra resultados y limpia el listado', async () => {
    await renderPage()
    expect(proyectosApi.getAdminProyectos).toHaveBeenCalledTimes(1)

    await act(async () => {
      setInputValue(searchInput(), 'tanque')
      await vi.advanceTimersByTimeAsync(400)
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({ nombre: 'tanque', page: 1, limit: 10 }),
    )
    expect(container.textContent).toContain('Tanque de almacenamiento')
    expect(container.textContent).not.toContain('Red de agua potable')
    expect(container.textContent).not.toContain('Acueducto Sur')

    await act(async () => {
      buttonNamed('Limpiar filtros')?.click()
    })

    expect(searchInput().value).toBe('')
    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith({
      nombre: undefined,
      estado: undefined,
      activo: undefined,
      page: 1,
      limit: 10,
    })
    expect(container.textContent).toContain('Red de agua potable')
    expect(container.textContent).toContain('Tanque de almacenamiento')
  })

  it('Prueba 4 — Estado: filtra por el estado enviado al Backend', async () => {
    await renderPage()

    await act(async () => {
      changeSelect(estadoSelect(), 'COMPLETADO')
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({ estado: 'COMPLETADO', page: 1 }),
    )
    expect(container.textContent).toContain('Acueducto Sur')
    expect(container.textContent).toContain('Completado')
    expect(container.textContent).not.toContain('Red de agua potable')
    expect(container.textContent).not.toContain('Tanque de almacenamiento')
  })

  it('Prueba 5 — Activos: envía activo=true y muestra solo activos', async () => {
    await renderPage()

    await act(async () => {
      changeSelect(activoSelect(), 'true')
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({ activo: true, page: 1 }),
    )
    const tableText = container.querySelector('table')?.textContent ?? ''
    expect(tableText).toContain('Red de agua potable')
    expect(tableText).toContain('Acueducto Sur')
    expect(tableText).toContain('Activo')
    expect(tableText).not.toContain('Tanque de almacenamiento')
    expect(tableText).not.toContain('Inactivo')
  })

  it('Prueba 6 — Inactivos: envía activo=false y muestra solo inactivos', async () => {
    await renderPage()

    await act(async () => {
      changeSelect(activoSelect(), 'false')
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({ activo: false, page: 1 }),
    )
    const tableText = container.querySelector('table')?.textContent ?? ''
    expect(tableText).toContain('Tanque de almacenamiento')
    expect(tableText).toContain('Inactivo')
    expect(tableText).not.toContain('Red de agua potable')
    expect(tableText).not.toContain('Acueducto Sur')
  })

  it('Prueba 7 — Filtros combinados: envía nombre, estado y activo juntos', async () => {
    await renderPage()

    await act(async () => {
      changeSelect(estadoSelect(), 'EN_PROCESO')
      changeSelect(activoSelect(), 'true')
      setInputValue(searchInput(), 'agua')
      searchInput().form?.requestSubmit()
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith({
      nombre: 'agua',
      estado: 'EN_PROCESO',
      activo: true,
      page: 1,
      limit: 10,
    })
    expect(container.textContent).toContain('Red de agua potable')
    expect(container.textContent).not.toContain('Tanque de almacenamiento')
    expect(container.textContent).not.toContain('Acueducto Sur')
  })

  it('Prueba 8 — Paginación: pide otra página, conserva filtros y muestra metadata', async () => {
    vi.mocked(proyectosApi.getAdminProyectos).mockImplementation(
      async (query) => {
        if ((query.page ?? 1) === 2) {
          return listado(
            [
              proyecto({
                id: 21,
                nombre: 'Tanque página 2',
                estado: 'PENDIENTE',
                activo: false,
              }),
            ],
            2,
            3,
            22,
          )
        }

        return listado(
          [
            proyecto({
              id: 8,
              nombre: 'Tanque de almacenamiento',
              estado: 'PENDIENTE',
              activo: false,
            }),
          ],
          1,
          3,
          22,
        )
      },
    )

    await renderPage()
    expect(container.textContent).toContain('Página 1 de 3')

    await act(async () => {
      changeSelect(estadoSelect(), 'PENDIENTE')
      changeSelect(activoSelect(), 'false')
      setInputValue(searchInput(), 'tanque')
      searchInput().form?.requestSubmit()
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith({
      nombre: 'tanque',
      estado: 'PENDIENTE',
      activo: false,
      page: 1,
      limit: 10,
    })

    await act(async () => {
      buttonNamed('Siguiente')?.click()
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith({
      nombre: 'tanque',
      estado: 'PENDIENTE',
      activo: false,
      page: 2,
      limit: 10,
    })
    expect(container.textContent).toContain('Tanque página 2')
    expect(container.textContent).toContain('Página 2 de 3')
    expect(container.textContent).not.toContain('Red de agua potable')
  })

  it('Prueba 9, 10 y 11 — Ver e imágenes no navegan; Editar y Nuevo proyecto usan las rutas reales', async () => {
    const app = await renderApp('/admin/proyectos')

    expect(PRIVATE_ROUTE_PATHS).toContain('/admin/proyectos')
    expect(PRIVATE_ROUTE_PATHS).not.toContain(PROYECTOS_ADMIN_NEW_PATH)
    expect(PRIVATE_ROUTE_PATHS).not.toContain(proyectosAdminDetailPath(7))
    expect(PRIVATE_ROUTE_PATHS).not.toContain(proyectosAdminEditPath(7))
    expect(PRIVATE_ROUTE_PATHS).not.toContain(proyectosAdminImagesPath(7))
    expect(PROYECTOS_ADMIN_PENDING_ACTION_ROUTES).toEqual([
      'ver',
      'imagenes',
    ])

    const nuevo = Array.from(container.querySelectorAll('a')).find(
      (item) => item.textContent === 'Nuevo proyecto',
    ) as HTMLAnchorElement
    const ver = container.querySelector(
      '[aria-label="Ver Red de agua potable"]',
    ) as HTMLButtonElement
    const editar = container.querySelector(
      '[aria-label="Editar Red de agua potable"]',
    ) as HTMLAnchorElement
    const imagenes = container.querySelector(
      '[aria-label="Gestionar imágenes de Red de agua potable"]',
    ) as HTMLButtonElement

    expect(nuevo.tagName).toBe('A')
    expect(nuevo.getAttribute('href')).toBe('/admin/proyectos/nuevo')
    expect(ver.tagName).toBe('BUTTON')
    expect(editar.tagName).toBe('A')
    expect(editar.getAttribute('href')).toBe('/admin/proyectos/7/editar')
    expect(imagenes.tagName).toBe('BUTTON')
    expect(imagenes.getAttribute('href')).toBeNull()
    expect(ver.getAttribute('href')).toBeNull()

    const sidebar = container.querySelector('.admin-sidebar')
    const header = container.querySelector('.admin-header')

    await clickElement(ver)
    await clickElement(imagenes)

    expect(app.currentPath()).toBe('/admin/proyectos')
    expect(container.querySelector('.gallery-admin__form')).toBeNull()

    await clickElement(editar)
    await flush()

    expect(app.currentPath()).toBe('/admin/proyectos/7/editar')
    expect(container.querySelector('.admin-layout')).not.toBeNull()
    expect(container.querySelector('.admin-sidebar')).toBe(sidebar)
    expect(container.querySelector('.admin-header')).toBe(header)
    expect(container.querySelector('.proyectos-admin')).not.toBeNull()
    expect(container.textContent).toContain('Gestión de Proyectos')
    expect(container.textContent).toContain('Editar proyecto')
    expect(container.querySelector('.gallery-admin__form')).not.toBeNull()
    expect(container.querySelector('#proyectos-form-nombre')).not.toBeNull()
  })

  it('Nuevo proyecto abre el formulario de alta en /admin/proyectos/nuevo dentro de AdminLayout', async () => {
    const app = await renderApp('/admin/proyectos')
    const sidebar = container.querySelector('.admin-sidebar')
    const header = container.querySelector('.admin-header')
    const nuevo = Array.from(container.querySelectorAll('a')).find(
      (item) => item.textContent === 'Nuevo proyecto',
    ) as HTMLAnchorElement

    await clickElement(nuevo)
    await flush()

    expect(app.currentPath()).toBe('/admin/proyectos/nuevo')
    expect(container.querySelector('.admin-layout')).not.toBeNull()
    expect(container.querySelector('.admin-sidebar')).toBe(sidebar)
    expect(container.querySelector('.admin-header')).toBe(header)
    expect(container.textContent).toContain('Nuevo proyecto')
    expect(container.querySelector('.gallery-admin__form')).not.toBeNull()
    expect(
      (container.querySelector('#proyectos-form-nombre') as HTMLInputElement).value,
    ).toBe('')
  })

  it('Prueba 12 — Loading: skeleton visible sin tabla vacía', async () => {
    vi.mocked(proyectosApi.getAdminProyectos).mockReturnValue(
      new Promise(() => undefined),
    )

    await renderPage()

    expect(container.textContent).toContain('Cargando proyectos…')
    expect(container.querySelector('.gallery-admin__skeleton')).not.toBeNull()
    expect(container.querySelector('table')).toBeNull()
    expect(container.querySelector('[aria-label="Paginación"]')).toBeNull()
  })

  it('Prueba 13 — Error: mensaje de consulta y reintento', async () => {
    vi.mocked(proyectosApi.getAdminProyectos)
      .mockRejectedValueOnce(new Error('HTTP 500: Error interno'))
      .mockResolvedValueOnce(listado([proyecto()]))

    await renderPage()

    expect(container.textContent).toContain('No fue posible cargar los proyectos.')
    expect(container.textContent).toContain('Reintentar')
    expect(container.textContent).not.toContain('404')
    expect(container.querySelector('table')).toBeNull()

    await act(async () => {
      buttonNamed('Reintentar')?.click()
    })

    expect(container.textContent).toContain('Red de agua potable')
  })

  it('Prueba 14 — Vacío: lista general y filtros sin coincidencias', async () => {
    vi.mocked(proyectosApi.getAdminProyectos).mockResolvedValue(listado([]))

    await renderPage()
    expect(container.textContent).toContain('No hay proyectos registrados.')

    await act(async () => {
      changeSelect(estadoSelect(), 'PENDIENTE')
    })

    expect(container.textContent).toContain(
      'No se encontraron proyectos con los filtros seleccionados.',
    )
    expect(container.textContent).not.toContain('No hay proyectos registrados.')
    expect(container.querySelector('table')).toBeNull()
  })

  it('Prueba 15 — Responsive: tabla con scroll y filtros usables en desktop, tablet y celular', async () => {
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('.proyectos-admin__table')
    expect(css).toContain('overflow-x: auto')
    expect(css).toContain('@media (max-width: 1199px)')
    expect(css).toContain('@media (max-width: 760px)')
    expect(css).toContain('grid-template-columns: minmax(0, 1fr)')

    for (const width of [1280, 900, 390] as const) {
      setViewportWidth(width)
      await renderPage()

      expect(container.querySelector('.proyectos-admin')).not.toBeNull()
      expect(container.querySelector('.table-responsive')).not.toBeNull()
      expect(searchInput()).not.toBeNull()
      expect(estadoSelect()).not.toBeNull()
      expect(activoSelect()).not.toBeNull()
      expect(
        container.querySelector('label[for="proyectos-admin-buscar"]')
          ?.textContent,
      ).toContain('Buscar por nombre')
      expect(
        container.querySelector('label[for="proyectos-admin-estado"]')
          ?.textContent,
      ).toContain('Estado')
      expect(
        container.querySelector('[aria-label="Ver Red de agua potable"]'),
      ).not.toBeNull()
      expect(
        container.querySelector(
          '[aria-label="Gestionar imágenes de Red de agua potable"]',
        ),
      ).not.toBeNull()

      await act(async () => {
        root.unmount()
      })
      root = createRoot(container)
    }
  })

  it('Prueba 16 — Teclado: búsqueda, filtros, paginación y acciones son enfocables', async () => {
    await renderPage()

    searchInput().focus()
    expect(document.activeElement).toBe(searchInput())

    await act(async () => {
      setInputValue(searchInput(), 'agua')
      searchInput().dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      )
      searchInput().form?.requestSubmit()
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({ nombre: 'agua' }),
    )

    estadoSelect().focus()
    expect(document.activeElement).toBe(estadoSelect())
    activoSelect().focus()
    expect(document.activeElement).toBe(activoSelect())

    await act(async () => {
      buttonNamed('Limpiar filtros')?.click()
    })

    const siguiente = buttonNamed('Siguiente') as HTMLButtonElement
    siguiente.focus()
    expect(document.activeElement).toBe(siguiente)
    expect(siguiente.disabled).toBe(false)

    const ver = container.querySelector(
      '[aria-label="Ver Red de agua potable"]',
    ) as HTMLButtonElement
    const editar = container.querySelector(
      '[aria-label="Editar Red de agua potable"]',
    ) as HTMLAnchorElement
    const imagenes = container.querySelector(
      '[aria-label="Gestionar imágenes de Red de agua potable"]',
    ) as HTMLButtonElement

    for (const control of [ver, editar, imagenes, siguiente, searchInput()]) {
      expect(control.tabIndex).toBeGreaterThanOrEqual(0)
      control.focus()
      expect(document.activeElement).toBe(control)
    }
  })

  it('Consola: sin errores de React, keys, rutas ni consultas duplicadas al montar', async () => {
    const consoleProbe = captureConsole()

    try {
      await renderPage()

      expect(proyectosApi.getAdminProyectos).toHaveBeenCalledTimes(1)
      expect(proyectosApi.getAdminProyectos).toHaveBeenCalledWith({
        nombre: undefined,
        estado: undefined,
        activo: undefined,
        page: 1,
        limit: 10,
      })
      expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
      expect(consoleProbe.errors).toEqual([])
      expect(consoleProbe.warnings).toEqual([])
      expect(container.innerHTML).not.toContain('Warning: Each child in a list')
      expect(container.innerHTML).not.toContain('No routes matched')
    } finally {
      consoleProbe.restore()
    }
  })
})
