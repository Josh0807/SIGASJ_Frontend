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
  total = data.length,
): ProyectosAdminListado => ({
  data,
  total,
  page,
  limit: 10,
  totalPages,
})

describe('ProyectosAdminPage — paginación', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.spyOn(proyectosApi, 'getAdminProyectos').mockImplementation(
      async (query) =>
        listado([proyecto()], query.page ?? 1, 3, 22),
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

  const buttonNamed = (label: string) =>
    Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === label,
    )

  it('oculta la paginación cuando total es 0', async () => {
    vi.mocked(proyectosApi.getAdminProyectos).mockResolvedValue(
      listado([], 1, 0, 0),
    )
    await renderPage()

    expect(container.querySelector('[aria-label="Paginación"]')).toBeNull()
    expect(buttonNamed('Anterior')).toBeUndefined()
    expect(buttonNamed('Siguiente')).toBeUndefined()
  })

  it('pide la página siguiente al Backend conservando búsqueda, estado y visibilidad', async () => {
    await renderPage()

    const estadoSelect = container.querySelector(
      '#proyectos-admin-estado',
    ) as HTMLSelectElement
    const activoSelect = container.querySelector(
      '#proyectos-admin-activo',
    ) as HTMLSelectElement
    const searchInput = container.querySelector(
      '#proyectos-admin-buscar',
    ) as HTMLInputElement

    await act(async () => {
      estadoSelect.value = 'EN_PROCESO'
      estadoSelect.dispatchEvent(new Event('change', { bubbles: true }))
      activoSelect.value = 'true'
      activoSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set
      setter?.call(searchInput, 'acueducto')
      searchInput.dispatchEvent(new Event('input', { bubbles: true }))
      searchInput.form?.requestSubmit()
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({
        nombre: 'acueducto',
        estado: 'EN_PROCESO',
        activo: true,
        page: 1,
        limit: 10,
      }),
    )

    await act(async () => {
      buttonNamed('Siguiente')?.click()
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith({
      nombre: 'acueducto',
      estado: 'EN_PROCESO',
      activo: true,
      page: 2,
      limit: 10,
    })
  })

  it('no permite ir antes de la página 1 ni más allá de totalPages', async () => {
    await renderPage()

    expect((buttonNamed('Anterior') as HTMLButtonElement).disabled).toBe(true)

    await act(async () => {
      buttonNamed('Siguiente')?.click()
    })
    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    )

    await act(async () => {
      buttonNamed('Siguiente')?.click()
    })
    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 3 }),
    )
    expect((buttonNamed('Siguiente') as HTMLButtonElement).disabled).toBe(true)

    await act(async () => {
      buttonNamed('Siguiente')?.click()
    })
    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 3 }),
    )
  })

  it('restablece page = 1 al cambiar un filtro', async () => {
    await renderPage()

    await act(async () => {
      buttonNamed('Siguiente')?.click()
    })
    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    )

    const estadoSelect = container.querySelector(
      '#proyectos-admin-estado',
    ) as HTMLSelectElement
    await act(async () => {
      estadoSelect.value = 'COMPLETADO'
      estadoSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({
        estado: 'COMPLETADO',
        page: 1,
      }),
    )
  })
})
