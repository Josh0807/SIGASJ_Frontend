import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act, useMemo } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProyectosAdminForm from './ProyectosAdminForm'
import ProyectosAdminPage from './ProyectosAdminPage'
import ProyectosAdminDetailView from './ProyectosAdminDetailView'
import { toProyectoFormValues, type AdminProyecto, type AdminProyectoDetalle, type ProyectosAdminListado, type ProyectoFormValues } from './types'
import { useAdminProyecto } from '../hooks/useAdminProyecto'
import { invalidateAdminProyectosQueries } from '../hooks/proyectosAdminQuery'
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
  totalPages: data.length > 0 ? 1 : 0,
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

const DetailStayProbe = () => {
  const { proyecto: actual, loading } = useAdminProyecto(7)

  if (loading && !actual) {
    return <p>Cargando proyecto…</p>
  }

  if (!actual) {
    return null
  }

  return <ProyectosAdminDetailView proyecto={actual} />
}

const FormStayProbe = () => {
  const { proyecto: actual, loading, replaceProyecto } = useAdminProyecto(7)
  const initialValues = useMemo(
    () => (actual ? toProyectoFormValues(actual) : undefined),
    [actual],
  )

  if (loading && !actual) {
    return <p>Cargando proyecto…</p>
  }

  if (!actual || !initialValues) {
    return null
  }

  const handleSave = async (values: ProyectoFormValues) => {
    const saved = await proyectosApi.updateAdminProyecto(actual.id, values)
    replaceProyecto(saved)
    invalidateAdminProyectosQueries()
  }

  return (
    <ProyectosAdminForm
      mode="edit"
      initialValues={initialValues}
      onSubmit={handleSave}
      onCancel={() => undefined}
    />
  )
}

describe('ProyectosAdmin — actualización automática tras guardar', () => {
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

  const flush = async () => {
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
  }

  it('no recarga la página completa para refrescar listado, detalle o formulario', () => {
    const adminDir = dirname(fileURLToPath(import.meta.url))
    const hooksDir = join(adminDir, '..', 'hooks')
    const files = [
      join(adminDir, 'ProyectosAdminPage.tsx'),
      join(adminDir, 'ProyectosAdminCreatePage.tsx'),
      join(adminDir, 'ProyectosAdminEditPage.tsx'),
      join(adminDir, 'ProyectosAdminDetailPage.tsx'),
      join(adminDir, 'ProyectosAdminForm.tsx'),
      join(hooksDir, 'useAdminProyectos.ts'),
      join(hooksDir, 'useAdminProyecto.ts'),
      join(hooksDir, 'proyectosAdminQuery.ts'),
    ]

    for (const file of files) {
      expect(readFileSync(file, 'utf8')).not.toContain('location.reload')
    }
  })

  it('vuelve a consultar el listado montado y muestra el resultado real', async () => {
    vi.spyOn(proyectosApi, 'getAdminProyectos')
      .mockResolvedValueOnce(listado([proyecto()]))
      .mockResolvedValueOnce(
        listado([proyecto({ nombre: 'Ampliación de Acueducto', duracion: '10 meses' })]),
      )

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProyectosAdminPage />
        </MemoryRouter>,
      )
    })
    await flush()

    expect(container.querySelector('table')?.textContent).toContain(
      'Red de agua potable',
    )

    await act(async () => {
      invalidateAdminProyectosQueries()
    })
    await flush()

    expect(proyectosApi.getAdminProyectos).toHaveBeenCalledTimes(2)
    expect(container.querySelector('table')?.textContent).toContain(
      'Ampliación de Acueducto',
    )
    expect(container.querySelector('table')?.textContent).toContain('10 meses')
    expect(container.querySelector('table')?.textContent).not.toContain(
      'Red de agua potable',
    )
  })

  it('acepta el resultado real si el proyecto deja de cumplir el filtro actual', async () => {
    vi.spyOn(proyectosApi, 'getAdminProyectos')
      .mockResolvedValueOnce(listado([proyecto({ estado: 'PENDIENTE' })]))
      .mockResolvedValueOnce(listado([proyecto({ estado: 'PENDIENTE' })]))
      .mockResolvedValueOnce(listado([]))

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProyectosAdminPage />
        </MemoryRouter>,
      )
    })
    await flush()

    const estadoSelect = container.querySelector(
      '#proyectos-admin-estado',
    ) as HTMLSelectElement

    await act(async () => {
      estadoSelect.value = 'PENDIENTE'
      estadoSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await flush()

    expect(container.querySelector('table')?.textContent).toContain(
      'Red de agua potable',
    )

    await act(async () => {
      invalidateAdminProyectosQueries()
    })
    await flush()

    expect(proyectosApi.getAdminProyectos).toHaveBeenLastCalledWith(
      expect.objectContaining({ estado: 'PENDIENTE' }),
    )
    expect(container.textContent).toContain(
      'No se encontraron proyectos con los filtros seleccionados.',
    )
    expect(container.querySelector('table')).toBeNull()
    expect(container.textContent).not.toContain('Red de agua potable')
  })

  it('actualiza el detalle montado tras invalidar las consultas', async () => {
    vi.spyOn(proyectosApi, 'getAdminProyecto')
      .mockResolvedValueOnce(detalle())
      .mockResolvedValueOnce(
        detalle({
          nombre: 'Ampliación de Acueducto',
          descripcion: 'Red principal actualizada',
          duracion: '10 meses',
        }),
      )

    await act(async () => {
      root.render(<DetailStayProbe />)
    })
    await flush()

    expect(container.textContent).toContain('Red de agua potable')

    await act(async () => {
      invalidateAdminProyectosQueries()
    })
    await flush()

    expect(proyectosApi.getAdminProyecto).toHaveBeenCalledTimes(2)
    expect(container.textContent).toContain('Ampliación de Acueducto')
    expect(container.textContent).toContain('Red principal actualizada')
    expect(container.textContent).toContain('10 meses')
    expect(container.textContent).not.toContain('Red de agua potable')
    expect(container.textContent).not.toContain('Cargando proyecto…')
  })

  it('actualiza el formulario si permanece abierto después del PATCH', async () => {
    const actualizado = detalle({
      nombre: 'Ampliación de Acueducto',
      descripcion: 'Red principal actualizada',
      duracion: '10 meses',
    })
    vi.spyOn(proyectosApi, 'updateAdminProyecto').mockResolvedValue(actualizado)
    vi.spyOn(proyectosApi, 'getAdminProyecto').mockImplementation(async () => {
      if (vi.mocked(proyectosApi.updateAdminProyecto).mock.calls.length > 0) {
        return actualizado
      }

      return detalle()
    })

    await act(async () => {
      root.render(<FormStayProbe />)
    })
    await flush()

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
    await flush()

    expect(proyectosApi.updateAdminProyecto).toHaveBeenCalledTimes(1)
    expect(container.querySelector('.gallery-admin__form')).not.toBeNull()
    expect(container.textContent).not.toContain('Cargando proyecto…')
    expect(
      (container.querySelector('#proyectos-form-nombre') as HTMLInputElement).value,
    ).toBe('Ampliación de Acueducto')
    expect(
      (container.querySelector('#proyectos-form-descripcion') as HTMLTextAreaElement)
        .value,
    ).toBe('Red principal actualizada')
    expect(
      (container.querySelector('#proyectos-form-duracion') as HTMLInputElement).value,
    ).toBe('10 meses')
  })
})
