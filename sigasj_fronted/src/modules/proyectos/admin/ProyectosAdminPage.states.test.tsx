import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProyectosAdminPage from './ProyectosAdminPage'
import type { AdminProyecto, ProyectosAdminListado } from './types'
import * as proyectosApi from '../services/proyectosApi'

const proyecto = (): AdminProyecto => ({
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
})

const listado = (data: AdminProyecto[]): ProyectosAdminListado => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: data.length > 0 ? 1 : 0,
})

describe('ProyectosAdminPage — estados de consulta', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const renderPage = async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProyectosAdminPage />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      await Promise.resolve()
    })
  }

  it('muestra carga sin tabla vacía', async () => {
    vi.spyOn(proyectosApi, 'getAdminProyectos').mockReturnValue(
      new Promise(() => undefined),
    )

    await renderPage()

    expect(container.textContent).toContain('Cargando proyectos…')
    expect(container.querySelector('.gallery-admin__skeleton')).toBeTruthy()
    expect(container.querySelector('table')).toBeNull()
    expect(container.textContent).not.toContain('No hay proyectos registrados.')
  })

  it('muestra error con reintento y no un 404 de filtros', async () => {
    const fetchSpy = vi
      .spyOn(proyectosApi, 'getAdminProyectos')
      .mockRejectedValueOnce(new Error('HTTP 500: Error interno'))
      .mockResolvedValueOnce(listado([proyecto()]))

    await renderPage()

    expect(container.textContent).toContain('No fue posible cargar los proyectos.')
    expect(container.textContent).toContain('Reintentar')
    expect(container.textContent).not.toContain('404')
    expect(container.querySelector('table')).toBeNull()

    const retry = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Reintentar',
    )
    await act(async () => {
      retry?.click()
    })

    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(container.textContent).toContain('Red de agua potable')
  })

  it('muestra lista vacía general cuando no hay proyectos', async () => {
    vi.spyOn(proyectosApi, 'getAdminProyectos').mockResolvedValue(listado([]))

    await renderPage()

    expect(container.textContent).toContain('No hay proyectos registrados.')
    expect(container.textContent).not.toContain(
      'No se encontraron proyectos con los filtros seleccionados.',
    )
    expect(container.querySelector('table')).toBeNull()
  })

  it('muestra vacío por filtros cuando la consulta no tiene coincidencias', async () => {
    vi.spyOn(proyectosApi, 'getAdminProyectos').mockResolvedValue(listado([]))

    await renderPage()

    const estadoSelect = container.querySelector(
      '#proyectos-admin-estado',
    ) as HTMLSelectElement
    await act(async () => {
      estadoSelect.value = 'COMPLETADO'
      estadoSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(container.textContent).toContain(
      'No se encontraron proyectos con los filtros seleccionados.',
    )
    expect(container.textContent).not.toContain('No hay proyectos registrados.')
    expect(container.textContent).not.toContain('404')
    expect(container.querySelector('table')).toBeNull()
  })
})
