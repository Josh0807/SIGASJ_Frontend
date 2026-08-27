import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProyectosAdminRoutes from './ProyectosAdminRoutes'
import type { AdminProyecto, AdminProyectoDetalle, ProyectosAdminListado } from './types'
import * as proyectosApi from '../services/proyectosApi'

const proyecto = (overrides: Partial<AdminProyecto> = {}): AdminProyecto => ({
  id: 7,
  nombre: 'Red de agua potable',
  descripcion: 'Red principal',
  encargadoRealizacion: 'Ing. María',
  duracion: '8 meses',
  estado: 'EN_PROCESO',
  imagenPrincipal: null,
  activo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

const detalle = (
  overrides: Partial<AdminProyectoDetalle> = {},
): AdminProyectoDetalle => ({
  ...proyecto(),
  imagenes: [],
  ...overrides,
})

const listado = (data: AdminProyecto[]): ProyectosAdminListado => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: 1,
})

const setInputValue = (
  input: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) => {
  const proto =
    input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('ProyectosAdmin — edición', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.spyOn(proyectosApi, 'getAdminProyectos').mockResolvedValue(
      listado([proyecto()]),
    )
    vi.spyOn(proyectosApi, 'getAdminProyecto').mockResolvedValue(detalle())
    vi.spyOn(proyectosApi, 'updateAdminProyecto').mockResolvedValue(
      detalle({
        nombre: 'Ampliación de Acueducto',
        descripcion: 'Red principal actualizada',
        duracion: '10 meses',
      }),
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

  const renderEditPage = async (id = '7') => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[`/admin/proyectos/${id}/editar`]}>
          <Routes>
            <Route path="/admin/proyectos/*" element={<ProyectosAdminRoutes />} />
          </Routes>
        </MemoryRouter>,
      )
    })

    await act(async () => {
      await Promise.resolve()
    })
  }

  it('muestra carga mientras consulta GET /admin/proyectos/:id', async () => {
    vi.mocked(proyectosApi.getAdminProyecto).mockReturnValue(
      new Promise(() => undefined),
    )

    await renderEditPage()

    expect(proyectosApi.getAdminProyecto).toHaveBeenCalledWith(7)
    expect(container.textContent).toContain('Cargando proyecto…')
    expect(container.querySelector('.gallery-admin__form')).toBeNull()
    expect(container.querySelector('.admin-layout')).toBeNull()
    expect(container.querySelector('.admin-header')).toBeNull()
    expect(container.querySelector('.admin-sidebar')).toBeNull()
  })

  it('inicializa el formulario con los datos reales del detalle', async () => {
    vi.mocked(proyectosApi.getAdminProyecto).mockResolvedValue(
      detalle({
        nombre: 'Tanque de almacenamiento',
        descripcion: null,
        encargadoRealizacion: null,
        duracion: '12 meses',
        estado: 'COMPLETADO',
      }),
    )

    await renderEditPage()

    expect(container.textContent).toContain('Editar proyecto')
    expect(
      (container.querySelector('#proyectos-form-nombre') as HTMLInputElement).value,
    ).toBe('Tanque de almacenamiento')
    expect(
      (container.querySelector('#proyectos-form-descripcion') as HTMLTextAreaElement)
        .value,
    ).toBe('')
    expect(
      (container.querySelector('#proyectos-form-encargado') as HTMLInputElement)
        .value,
    ).toBe('')
    expect(
      (container.querySelector('#proyectos-form-duracion') as HTMLInputElement).value,
    ).toBe('12 meses')
    expect(
      (container.querySelector('#proyectos-form-estado') as HTMLSelectElement).value,
    ).toBe('COMPLETADO')
    expect(container.innerHTML).not.toContain('undefined')
    expect(proyectosApi.getAdminProyectos).not.toHaveBeenCalled()
  })

  it('envía PATCH sin estado y vuelve al listado con los datos actualizados', async () => {
    await renderEditPage()

    await act(async () => {
      setInputValue(
        container.querySelector('#proyectos-form-nombre') as HTMLInputElement,
        'Ampliación de Acueducto',
      )
      setInputValue(
        container.querySelector('#proyectos-form-descripcion') as HTMLTextAreaElement,
        'Red principal actualizada',
      )
      setInputValue(
        container.querySelector('#proyectos-form-duracion') as HTMLInputElement,
        '10 meses',
      )
      container.querySelector('.gallery-admin__form')?.requestSubmit()
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(proyectosApi.updateAdminProyecto).toHaveBeenCalledTimes(1)
    expect(proyectosApi.updateAdminProyecto).toHaveBeenCalledWith(7, {
      nombre: 'Ampliación de Acueducto',
      descripcion: 'Red principal actualizada',
      encargadoRealizacion: 'Ing. María',
      duracion: '10 meses',
      estado: 'EN_PROCESO',
    })
    expect(container.querySelector('.gallery-admin__form')).toBeNull()
    expect(proyectosApi.getAdminProyectos).toHaveBeenCalledTimes(1)
  })

  it('conserva el formulario abierto si el Backend rechaza la edición', async () => {
    vi.mocked(proyectosApi.updateAdminProyecto).mockRejectedValueOnce(
      new Error('HTTP 400: El nombre del proyecto es obligatorio'),
    )

    await renderEditPage()

    await act(async () => {
      container.querySelector('.gallery-admin__form')?.requestSubmit()
    })

    expect(container.querySelector('.gallery-admin__form')).not.toBeNull()
    expect(container.textContent).toContain('El nombre del proyecto es obligatorio')
    expect(proyectosApi.getAdminProyectos).not.toHaveBeenCalled()
  })

  it('muestra error de carga y permite reintentar el detalle', async () => {
    vi.mocked(proyectosApi.getAdminProyecto)
      .mockRejectedValueOnce(new Error('HTTP 500: Error interno'))
      .mockResolvedValueOnce(detalle())

    await renderEditPage()

    expect(container.textContent).toContain('No fue posible cargar el proyecto.')
    expect(container.querySelector('.gallery-admin__form')).toBeNull()

    const retry = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Reintentar',
    )

    await act(async () => {
      retry?.click()
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(proyectosApi.getAdminProyecto).toHaveBeenCalledTimes(2)
    expect(container.textContent).toContain('Editar proyecto')
    expect(
      (container.querySelector('#proyectos-form-nombre') as HTMLInputElement).value,
    ).toBe('Red de agua potable')
  })

  it('muestra que el proyecto no existe si GET responde 404 y no deja el formulario vacío', async () => {
    vi.mocked(proyectosApi.getAdminProyecto).mockRejectedValueOnce(
      new Error('HTTP 404: Proyecto no encontrado'),
    )

    await renderEditPage()

    expect(container.textContent).toContain('El proyecto no existe.')
    expect(container.querySelector('.gallery-admin__form')).toBeNull()
    expect(container.querySelector('#proyectos-form-nombre')).toBeNull()
    expect(container.textContent).not.toContain('Editar proyecto')
  })

  it('muestra que el proyecto no existe si el id de la ruta no es numérico', async () => {
    await renderEditPage('abc')

    expect(proyectosApi.getAdminProyecto).not.toHaveBeenCalled()
    expect(container.textContent).toContain('El proyecto no existe.')
    expect(container.querySelector('.gallery-admin__form')).toBeNull()
  })

  it('muestra que el proyecto no existe si PATCH responde 404', async () => {
    vi.mocked(proyectosApi.updateAdminProyecto).mockRejectedValueOnce(
      new Error('HTTP 404: Proyecto no encontrado'),
    )

    await renderEditPage()

    await act(async () => {
      container.querySelector('.gallery-admin__form')?.requestSubmit()
    })

    expect(container.querySelector('.gallery-admin__form')).toBeNull()
    expect(container.textContent).toContain('El proyecto no existe.')
    expect(container.textContent).not.toContain('Editar proyecto')
  })
})
