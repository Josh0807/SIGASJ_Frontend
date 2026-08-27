import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProyectosAdminPage from './ProyectosAdminPage'
import type { AdminProyecto, ProyectosAdminListado } from './types'
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

describe('ProyectosAdminPage — búsqueda por nombre', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.spyOn(proyectosApi, 'getAdminProyectos').mockResolvedValue(
      listado([proyecto()]),
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

  const searchInput = () =>
    container.querySelector('#proyectos-admin-buscar') as HTMLInputElement

  it('expone un input accesible de búsqueda por nombre', async () => {
    await renderPage()

    const input = searchInput()
    const label = container.querySelector(`label[for="${input.id}"]`)

    expect(input).toBeTruthy()
    expect(input.type).toBe('search')
    expect(input.name).toBe('nombre')
    expect(label?.textContent).toContain('Buscar por nombre')
  })

  it('envía el query param nombre al Backend y no filtra el listado en el cliente', async () => {
    vi.mocked(proyectosApi.getAdminProyectos).mockResolvedValue(
      listado([proyecto({ nombre: 'Tanque de almacenamiento' })]),
    )

    await renderPage()
    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({
        nombre: undefined,
        page: 1,
      }),
    )

    await act(async () => {
      setInputValue(searchInput(), '  acueducto  ')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({
        nombre: 'acueducto',
        page: 1,
        limit: 10,
      }),
    )
    expect(container.textContent).toContain('Tanque de almacenamiento')
  })

  it('vuelve a la página 1 cuando cambia el criterio de búsqueda', async () => {
    vi.mocked(proyectosApi.getAdminProyectos).mockResolvedValue(
      listado([proyecto()], 1, 2),
    )

    await renderPage()

    const nextButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Siguiente',
    )
    await act(async () => {
      nextButton?.click()
    })
    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2, nombre: undefined }),
    )

    await act(async () => {
      setInputValue(searchInput(), 'tanque')
      searchInput().form?.requestSubmit()
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({
        nombre: 'tanque',
        page: 1,
      }),
    )
  })

  it('conserva estado y visibilidad al buscar por nombre', async () => {
    await renderPage()

    const [estadoSelect, visibilidadSelect] = Array.from(
      container.querySelectorAll('select'),
    ) as HTMLSelectElement[]

    await act(async () => {
      estadoSelect.value = 'EN_PROCESO'
      estadoSelect.dispatchEvent(new Event('change', { bubbles: true }))
      visibilidadSelect.value = 'true'
      visibilidadSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    await act(async () => {
      setInputValue(searchInput(), 'tanque')
      searchInput().form?.requestSubmit()
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith({
      nombre: 'tanque',
      estado: 'EN_PROCESO',
      activo: true,
      page: 1,
      limit: 10,
    })
  })

  it('al limpiar la búsqueda omite el filtro nombre y consulta de nuevo', async () => {
    await renderPage()

    await act(async () => {
      setInputValue(searchInput(), 'acueducto')
      await vi.advanceTimersByTimeAsync(400)
    })
    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({ nombre: 'acueducto' }),
    )

    await act(async () => {
      setInputValue(searchInput(), '   ')
      await vi.advanceTimersByTimeAsync(400)
    })
    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({ nombre: undefined, page: 1 }),
    )
  })
})
