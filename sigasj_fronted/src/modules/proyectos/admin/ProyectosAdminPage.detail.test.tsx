import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProyectosAdminRoutes from './ProyectosAdminRoutes'
import type { AdminProyecto, AdminProyectoDetalle, ProyectosAdminListado } from './types'
import * as proyectosApi from '../services/proyectosApi'

const proyecto = (overrides: Partial<AdminProyecto> = {}): AdminProyecto => ({
  id: 12,
  nombre: 'Ampliación de Acueducto',
  descripcion: 'Red principal de la ASADA',
  encargadoRealizacion: 'Ing. María Rodríguez',
  duracion: '8 meses',
  estado: 'EN_PROCESO',
  imagenPrincipal: 'https://ejemplo.com/tanque.jpg',
  activo: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-03-15T00:00:00.000Z',
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

describe('ProyectosAdmin — detalle', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.spyOn(proyectosApi, 'getAdminProyectos').mockResolvedValue(
      listado([proyecto()]),
    )
    vi.spyOn(proyectosApi, 'getAdminProyecto').mockResolvedValue(detalle())
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

  const renderDetailPage = async (id = '12') => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[`/admin/proyectos/${id}`]}>
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

    await renderDetailPage()

    expect(proyectosApi.getAdminProyecto).toHaveBeenCalledWith(12)
    expect(container.textContent).toContain('Cargando proyecto…')
    expect(container.querySelector('.proyectos-admin__detail')).toBeNull()
    expect(container.querySelector('.gallery-admin__form')).toBeNull()
  })

  it('carga el detalle real del Backend con el id de la ruta', async () => {
    await renderDetailPage()

    expect(proyectosApi.getAdminProyecto).toHaveBeenCalledTimes(1)
    expect(proyectosApi.getAdminProyecto).toHaveBeenCalledWith(12)
    expect(container.textContent).toContain('Detalle del proyecto')
    expect(container.textContent).toContain('12')
    expect(container.textContent).toContain('Ampliación de Acueducto')
    expect(container.textContent).toContain('Red principal de la ASADA')
    expect(container.textContent).toContain('Ing. María Rodríguez')
    expect(container.textContent).toContain('8 meses')
    expect(container.textContent).toContain('En proceso')
    expect(container.textContent).toContain('Inactivo')
    expect(container.textContent).toContain('01/01/2026')
    expect(container.textContent).toContain('15/03/2026')
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://ejemplo.com/tanque.jpg',
    )
    expect(container.textContent).toContain('No hay imágenes en la galería.')
    expect(container.querySelector('.gallery-admin__form')).toBeNull()
    expect(container.textContent).not.toContain('createdBy')
  })

  it('muestra la galería cuando el Backend envía imágenes', async () => {
    vi.mocked(proyectosApi.getAdminProyecto).mockResolvedValue(
      detalle({
        imagenes: [
          {
            id: 4,
            url: 'https://ejemplo.com/propia-1.jpg',
            descripcion: 'Galería propia 1',
            orden: 1,
            createdAt: '2026-02-01T00:00:00.000Z',
          },
        ],
      }),
    )

    await renderDetailPage()

    expect(container.textContent).toContain('Galería propia 1')
    expect(container.textContent).toContain('Orden 1')
    expect(container.textContent).not.toContain('No hay imágenes en la galería.')
  })

  it('muestra que el proyecto no existe si GET responde 404 y no deja un detalle vacío', async () => {
    vi.mocked(proyectosApi.getAdminProyecto).mockRejectedValueOnce(
      new Error('HTTP 404: Proyecto no encontrado'),
    )

    await renderDetailPage('99')

    expect(proyectosApi.getAdminProyecto).toHaveBeenCalledWith(99)
    expect(container.textContent).toContain('El proyecto no existe.')
    expect(container.querySelector('.proyectos-admin__detail')).toBeNull()
    expect(container.querySelector('.gallery-admin__form')).toBeNull()
    expect(container.textContent).not.toContain('Detalle del proyecto')
    expect(container.textContent).not.toContain('HTTP 404')
  })

  it('muestra que el proyecto no existe si el id de la ruta no es numérico', async () => {
    await renderDetailPage('abc')

    expect(proyectosApi.getAdminProyecto).not.toHaveBeenCalled()
    expect(container.textContent).toContain('El proyecto no existe.')
    expect(container.querySelector('.proyectos-admin__detail')).toBeNull()
  })
})
