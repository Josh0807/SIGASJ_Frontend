import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProyectosAdminPage from './ProyectosAdminPage'
import { ESTADOS_PROYECTO, type AdminProyecto, type ProyectosAdminListado } from './types'
import * as proyectosApi from '../services/proyectosApi'

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

const listado = (
  data: AdminProyecto[],
  page = 1,
  totalPages = 1,
): ProyectosAdminListado => ({
  data,
  total: data.length,
  page,
  limit: 10,
  totalPages,
})

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

describe('ProyectosAdminPage — filtros', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.spyOn(proyectosApi, 'getAdminProyectos').mockResolvedValue(
      listado([proyecto()], 1, 2),
    )
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

  const estadoSelect = () =>
    container.querySelector('#proyectos-admin-estado') as HTMLSelectElement
  const activoSelect = () =>
    container.querySelector('#proyectos-admin-activo') as HTMLSelectElement
  const searchInput = () =>
    container.querySelector('#proyectos-admin-buscar') as HTMLInputElement

  it('conserva labels de búsqueda y filtros en el listado administrativo', async () => {
    await renderPage()

    expect(container.querySelector('.proyectos-admin')).toBeTruthy()
    expect(container.querySelector('.table-responsive')).toBeTruthy()
    expect(container.textContent).toContain('Buscar por nombre')
    expect(
      container.querySelector('label[for="proyectos-admin-buscar"]')?.textContent,
    ).toContain('Buscar por nombre')
    expect(
      container.querySelector('label[for="proyectos-admin-estado"]')?.textContent,
    ).toContain('Estado')
    expect(
      container.querySelector('label[for="proyectos-admin-activo"]')?.textContent,
    ).toContain('Visibilidad')
  })

  it('ofrece solo los estados reales del Backend y Todos los estados', async () => {
    await renderPage()

    const values = Array.from(estadoSelect().options).map((option) => option.value)
    const labels = Array.from(estadoSelect().options).map((option) => option.textContent)

    expect(labels[0]).toBe('Todos los estados')
    expect(values.slice(1)).toEqual([...ESTADOS_PROYECTO])
    expect(values).not.toContain('EN_EJECUCION')
    expect(labels).toEqual([
      'Todos los estados',
      'Pendiente',
      'En proceso',
      'Completado',
    ])
  })

  it('envía activo=false al consultar inactivos', async () => {
    await renderPage()

    await act(async () => {
      changeSelect(activoSelect(), 'false')
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({
        activo: false,
        page: 1,
      }),
    )
  })

  it('combina nombre, estado y activo en la misma consulta', async () => {
    await renderPage()

    await act(async () => {
      changeSelect(estadoSelect(), 'COMPLETADO')
      changeSelect(activoSelect(), 'false')
      setInputValue(searchInput(), 'tanque')
      searchInput().form?.requestSubmit()
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith({
      nombre: 'tanque',
      estado: 'COMPLETADO',
      activo: false,
      page: 1,
      limit: 10,
    })
  })

  it('al cambiar un filtro vuelve a la página 1 y conserva los demás', async () => {
    await renderPage()

    await act(async () => {
      changeSelect(estadoSelect(), 'PENDIENTE')
    })

    const nextButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Siguiente',
    )
    await act(async () => {
      nextButton?.click()
    })
    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({
        estado: 'PENDIENTE',
        page: 2,
      }),
    )

    await act(async () => {
      changeSelect(activoSelect(), 'true')
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith({
      nombre: undefined,
      estado: 'PENDIENTE',
      activo: true,
      page: 1,
      limit: 10,
    })
  })

  it('limpia todos los filtros y vuelve a consultar sin ellos', async () => {
    await renderPage()

    await act(async () => {
      changeSelect(estadoSelect(), 'EN_PROCESO')
      changeSelect(activoSelect(), 'false')
      setInputValue(searchInput(), 'acueducto')
      searchInput().form?.requestSubmit()
    })

    const clearButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Limpiar filtros',
    )
    expect(clearButton).toBeTruthy()

    await act(async () => {
      clearButton?.click()
    })

    expect(searchInput().value).toBe('')
    expect(estadoSelect().value).toBe('')
    expect(activoSelect().value).toBe('')
    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith({
      nombre: undefined,
      estado: undefined,
      activo: undefined,
      page: 1,
      limit: 10,
    })
  })
})
