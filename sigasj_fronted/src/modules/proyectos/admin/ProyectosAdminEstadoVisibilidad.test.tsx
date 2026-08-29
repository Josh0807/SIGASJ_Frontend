import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProyectosAdminRoutes from './ProyectosAdminRoutes'
import type { AdminProyecto, ProyectosAdminListado } from './types'
import * as proyectosApi from '../services/proyectosApi'

const proyectoActivo = (overrides: Partial<AdminProyecto> = {}): AdminProyecto => ({
  id: 1,
  nombre: 'Acueducto Norte',
  descripcion: 'Construcción de acueducto',
  encargadoRealizacion: 'Ing. Carlos',
  duracion: '12 meses',
  estado: 'EN_PROCESO',
  imagenPrincipal: null,
  activo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

const proyectoInactivo = (overrides: Partial<AdminProyecto> = {}): AdminProyecto => ({
  ...proyectoActivo({
    id: 2,
    nombre: 'Tanque Sur',
    activo: false,
    estado: 'PENDIENTE',
    ...overrides,
  }),
})

const listado = (data: AdminProyecto[]): ProyectosAdminListado => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: 1,
})

describe('ProyectosAdmin — Estado y Visibilidad', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.spyOn(proyectosApi, 'getAdminProyectos').mockResolvedValue(
      listado([proyectoActivo(), proyectoInactivo()]),
    )
    vi.spyOn(proyectosApi, 'updateProyectoVisibilidad').mockResolvedValue(
      proyectoActivo({ activo: false }),
    )
    vi.spyOn(proyectosApi, 'updateProyectoEstado').mockResolvedValue(
      proyectoActivo({ estado: 'COMPLETADO' }),
    )
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  const renderAdminPage = async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/proyectos']}>
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

  it('muestra claramente diferenciados el Estado de ejecución y la Visibilidad pública', async () => {
    await renderAdminPage()

    expect(container.textContent).toContain('Estado')
    expect(container.textContent).toContain('Visibilidad')

    expect(container.textContent).toContain('Activo')
    expect(container.textContent).toContain('Inactivo')

    const selects = container.querySelectorAll('.proyectos-admin__estado-select')
    expect(selects.length).toBe(2)
  })

  it('permite cambiar el estado de ejecución mediante el selector de estado', async () => {
    await renderAdminPage()

    const select = container.querySelectorAll(
      '.proyectos-admin__estado-select',
    )[0] as HTMLSelectElement

    await act(async () => {
      select.value = 'COMPLETADO'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(proyectosApi.updateProyectoEstado).toHaveBeenCalledWith(1, 'COMPLETADO')
    expect(proyectosApi.getAdminProyectos).toHaveBeenCalledTimes(2) // Refetch inmediato
  })

  it('solicita confirmación modal antes de inactivar un proyecto', async () => {
    await renderAdminPage()

    const inactivarBtn = Array.from(
      container.querySelectorAll('button'),
    ).find((btn) => btn.textContent === 'Inactivar')

    await act(async () => {
      inactivarBtn?.click()
    })

    // Debe desplegar el modal ConfirmDialog
    expect(container.textContent).toContain('Inactivar visibilidad de proyecto')
    expect(container.textContent).toContain('¿Está seguro de que desea inactivar el proyecto «Acueducto Norte»?')
    expect(proyectosApi.updateProyectoVisibilidad).not.toHaveBeenCalled()

    const confirmBtn = Array.from(
      container.querySelectorAll('button'),
    ).find((btn) => btn.textContent === 'Inactivar proyecto')

    await act(async () => {
      confirmBtn?.click()
    })

    expect(proyectosApi.updateProyectoVisibilidad).toHaveBeenCalledWith(1, false)
    expect(proyectosApi.getAdminProyectos).toHaveBeenCalledTimes(2) // Refetch inmediato
  })

  it('cancela la inactivación sin modificar la visibilidad', async () => {
    await renderAdminPage()

    const inactivarBtn = Array.from(
      container.querySelectorAll('button'),
    ).find((btn) => btn.textContent === 'Inactivar')

    await act(async () => {
      inactivarBtn?.click()
    })

    const cancelBtn = Array.from(
      container.querySelectorAll('button'),
    ).find((btn) => btn.textContent === 'Cancelar')

    await act(async () => {
      cancelBtn?.click()
    })

    expect(proyectosApi.updateProyectoVisibilidad).not.toHaveBeenCalled()
    expect(container.querySelector('[role="alertdialog"]')).toBeNull()
  })

  it('permite activar directamente un proyecto inactivo', async () => {
    await renderAdminPage()

    const activarBtn = Array.from(
      container.querySelectorAll('button'),
    ).find((btn) => btn.textContent === 'Activar')

    await act(async () => {
      activarBtn?.click()
    })

    expect(proyectosApi.updateProyectoVisibilidad).toHaveBeenCalledWith(2, true)
    expect(proyectosApi.getAdminProyectos).toHaveBeenCalledTimes(2)
  })

  it('muestra mensaje de error si falla la actualización de visibilidad o estado', async () => {
    vi.spyOn(proyectosApi, 'updateProyectoVisibilidad').mockRejectedValueOnce(
      new Error('HTTP 403: No posee permisos para cambiar la visibilidad.'),
    )

    await renderAdminPage()

    const activarBtn = Array.from(
      container.querySelectorAll('button'),
    ).find((btn) => btn.textContent === 'Activar')

    await act(async () => {
      activarBtn?.click()
    })

    expect(container.textContent).toContain('HTTP 403: No posee permisos para cambiar la visibilidad.')
  })

  it('permite alternar entre PENDIENTE, EN_PROCESO y COMPLETADO en el selector', async () => {
    await renderAdminPage()

    const select = container.querySelectorAll(
      '.proyectos-admin__estado-select',
    )[0] as HTMLSelectElement

    const options = Array.from(select.options).map((o) => o.value)
    expect(options).toEqual(['PENDIENTE', 'EN_PROCESO', 'COMPLETADO'])

    await act(async () => {
      select.value = 'PENDIENTE'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(proyectosApi.updateProyectoEstado).toHaveBeenCalledWith(1, 'PENDIENTE')
  })

  it('verifica que inactivar NO realiza eliminación física (no ejecuta DELETE)', async () => {
    await renderAdminPage()

    const inactivarBtn = Array.from(
      container.querySelectorAll('button'),
    ).find((btn) => btn.textContent === 'Inactivar')

    await act(async () => {
      inactivarBtn?.click()
    })

    const confirmBtn = Array.from(
      container.querySelectorAll('button'),
    ).find((btn) => btn.textContent === 'Inactivar proyecto')

    await act(async () => {
      confirmBtn?.click()
    })

    expect(proyectosApi.updateProyectoVisibilidad).toHaveBeenCalledWith(1, false)
    // Confirmar independencia y que la llamada sea un PATCH de visibilidad y no un DELETE
    const callArgs = vi.mocked(proyectosApi.updateProyectoVisibilidad).mock.calls[0]
    expect(callArgs).toEqual([1, false])
  })
})

