import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProyectosAdminRoutes from './ProyectosAdminRoutes'
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

const changeSelect = (select: HTMLSelectElement, value: string) => {
  select.value = value
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('ProyectosAdmin — registro', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.spyOn(proyectosApi, 'getAdminProyectos').mockResolvedValue(
      listado([proyecto()]),
    )
    vi.spyOn(proyectosApi, 'createAdminProyecto').mockResolvedValue(
      proyecto({
        id: 21,
        nombre: 'Ampliación de Acueducto',
        descripcion: 'Red principal',
        encargadoRealizacion: 'Ing. María',
        duracion: '8 meses',
        estado: 'PENDIENTE',
        activo: false,
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

  const renderCreatePage = async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/proyectos/nuevo']}>
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

  it('abre el formulario de alta con valores iniciales vacíos y sin estado por defecto', async () => {
    await renderCreatePage()

    expect(container.textContent).toContain('Nuevo proyecto')
    expect(container.querySelector('.admin-layout')).toBeNull()
    expect(container.querySelector('.admin-header')).toBeNull()
    expect(container.querySelector('.admin-sidebar')).toBeNull()
    expect(
      (container.querySelector('#proyectos-form-nombre') as HTMLInputElement).value,
    ).toBe('')
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
    ).toBe('')
    expect(
      (container.querySelector('#proyectos-form-estado') as HTMLSelectElement).value,
    ).toBe('')
    expect(proyectosApi.getAdminProyectos).not.toHaveBeenCalled()
  })

  it('envía POST al registrar y vuelve al listado', async () => {
    await renderCreatePage()

    await act(async () => {
      setInputValue(
        container.querySelector('#proyectos-form-nombre') as HTMLInputElement,
        'Ampliación de Acueducto',
      )
      setInputValue(
        container.querySelector('#proyectos-form-descripcion') as HTMLTextAreaElement,
        'Red principal',
      )
      setInputValue(
        container.querySelector('#proyectos-form-encargado') as HTMLInputElement,
        'Ing. María',
      )
      setInputValue(
        container.querySelector('#proyectos-form-duracion') as HTMLInputElement,
        '8 meses',
      )
      changeSelect(
        container.querySelector('#proyectos-form-estado') as HTMLSelectElement,
        'PENDIENTE',
      )
      container.querySelector('.gallery-admin__form')?.requestSubmit()
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(proyectosApi.createAdminProyecto).toHaveBeenCalledTimes(1)
    expect(proyectosApi.createAdminProyecto).toHaveBeenCalledWith({
      nombre: 'Ampliación de Acueducto',
      descripcion: 'Red principal',
      encargadoRealizacion: 'Ing. María',
      duracion: '8 meses',
      estado: 'PENDIENTE',
    })
    expect(container.querySelector('.gallery-admin__form')).toBeNull()
    expect(container.textContent).toContain('Gestión de Proyectos')
    expect(proyectosApi.getAdminProyectos).toHaveBeenCalledTimes(1)
  })

  it('conserva el formulario abierto si el Backend rechaza el alta', async () => {
    vi.mocked(proyectosApi.createAdminProyecto).mockRejectedValueOnce(
      new Error('HTTP 400: El nombre del proyecto es obligatorio'),
    )

    await renderCreatePage()

    await act(async () => {
      setInputValue(
        container.querySelector('#proyectos-form-nombre') as HTMLInputElement,
        'Obra Norte',
      )
      setInputValue(
        container.querySelector('#proyectos-form-encargado') as HTMLInputElement,
        'Ing. María',
      )
      setInputValue(
        container.querySelector('#proyectos-form-duracion') as HTMLInputElement,
        '8 meses',
      )
      changeSelect(
        container.querySelector('#proyectos-form-estado') as HTMLSelectElement,
        'EN_PROCESO',
      )
      container.querySelector('.gallery-admin__form')?.requestSubmit()
    })

    expect(container.querySelector('.gallery-admin__form')).not.toBeNull()
    expect(container.textContent).toContain('El nombre del proyecto es obligatorio')
    expect(proyectosApi.getAdminProyectos).not.toHaveBeenCalled()
  })
})
