import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AveriasAdminPage from './AveriasAdminPage'
import {
  AVERIAS_ADMIN_UI_FIXTURE,
  AVERIAS_ADMIN_UI_FIXTURE_ITEMS,
} from './fixtures/averiasAdminList.fixture'
import * as averiasAdminApi from '../services/averiasAdminApi'
import {
  AVERIA_UNASSIGNED_LABEL,
  AVERIAS_ADMIN_EMPTY_MESSAGE,
  AVERIAS_ADMIN_LOAD_ERROR,
  AVERIAS_ADMIN_LOADING_MESSAGE,
} from './types'

describe('AveriasAdminPage', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.spyOn(averiasAdminApi, 'getAdminAverias').mockResolvedValue(
      AVERIAS_ADMIN_UI_FIXTURE,
    )
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

  const renderPage = async (
    props: Parameters<typeof AveriasAdminPage>[0] = {},
  ) => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AveriasAdminPage {...props} />
        </MemoryRouter>,
      )
    })
    await flush()
  }

  const setInputValue = (input: HTMLInputElement, value: string) => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set?.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }

  it('muestra el encabezado y el listado de consulta', async () => {
    await renderPage()
    expect(container.querySelector('h1')?.textContent).toBe('Gestión de averías')
    expect(container.textContent).toContain(
      'Consulte y dé seguimiento a las averías reportadas.',
    )
    expect(container.querySelector('table')).toBeTruthy()
    expect(container.textContent).toContain('AV-2026-0001')
  })

  it('muestra loading sin empty ni error', async () => {
    await renderPage({ loading: true, items: [] })
    expect(container.textContent).toContain(AVERIAS_ADMIN_LOADING_MESSAGE)
    expect(container.querySelector('table')).toBeNull()
    expect(container.textContent).not.toContain(AVERIAS_ADMIN_EMPTY_MESSAGE)
    expect(container.textContent).not.toContain(AVERIAS_ADMIN_LOAD_ERROR)
  })

  it('muestra empty cuando no hay items', async () => {
    await renderPage({ items: [], loading: false, error: null, total: 0 })
    expect(container.textContent).toContain(AVERIAS_ADMIN_EMPTY_MESSAGE)
    expect(container.querySelector('table')).toBeNull()
  })

  it('muestra error controlado y oculta detalles técnicos', async () => {
    await renderPage({
      error: 'HTTP 500: QueryFailedError SQL Server TypeORM',
      items: [],
    })
    expect(container.textContent).toContain(AVERIAS_ADMIN_LOAD_ERROR)
    expect(container.textContent).not.toContain('QueryFailedError')
    expect(container.textContent).not.toContain('SQL Server')
    expect(container.textContent).not.toContain('TypeORM')
  })

  it('actualiza la búsqueda visual y limpia filtros', async () => {
    await renderPage()
    const input = container.querySelector(
      '#averias-admin-buscar',
    ) as HTMLInputElement
    expect(input).toBeTruthy()
    expect(
      container.querySelector('label[for="averias-admin-buscar"]'),
    ).toBeTruthy()

    await act(async () => {
      setInputValue(input, 'AV-2026-0001')
    })
    expect(input.value).toBe('AV-2026-0001')
    expect(container.textContent).toContain('AV-2026-0002')

    const clear = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Limpiar filtros',
    )
    expect(clear).toBeTruthy()
    await act(async () => {
      clear?.click()
    })
    expect(
      (container.querySelector('#averias-admin-buscar') as HTMLInputElement)
        .value,
    ).toBe('')
  })

  it('actualiza filtros visuales de estado y prioridad', async () => {
    await renderPage()
    const estado = container.querySelector(
      '#averias-admin-estado',
    ) as HTMLSelectElement
    const prioridad = container.querySelector(
      '#averias-admin-prioridad',
    ) as HTMLSelectElement

    expect([...estado.options].map((option) => option.value)).toEqual([
      '',
      'RECIBIDA',
    ])
    expect([...estado.options].map((option) => option.textContent)).toEqual([
      'Todos',
      'Recibida',
    ])

    await act(async () => {
      estado.value = 'RECIBIDA'
      estado.dispatchEvent(new Event('change', { bubbles: true }))
      prioridad.value = 'ALTA'
      prioridad.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(estado.value).toBe('RECIBIDA')
    expect(prioridad.value).toBe('ALTA')
    expect(container.textContent).toContain('AV-2026-0001')
  })

  it('prepara paginación visual con page y totalPages del contrato', async () => {
    const onPageChange = vi.fn()
    await renderPage({
      items: AVERIAS_ADMIN_UI_FIXTURE_ITEMS,
      page: 2,
      totalPages: 5,
      total: 57,
      onPageChange,
    })
    expect(container.textContent).toContain('Página 2 de 5')
    const next = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Siguiente',
    )
    await act(async () => {
      next?.click()
    })
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('deshabilita Anterior en page=1 y Siguiente en la última página', async () => {
    await renderPage({
      items: AVERIAS_ADMIN_UI_FIXTURE_ITEMS,
      page: 1,
      totalPages: 5,
      total: 57,
    })
    const firstPrevious = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Anterior',
    )
    expect(firstPrevious?.hasAttribute('disabled')).toBe(true)

    await renderPage({
      items: AVERIAS_ADMIN_UI_FIXTURE_ITEMS,
      page: 5,
      totalPages: 5,
      total: 57,
    })
    const lastNext = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Siguiente',
    )
    expect(lastNext?.hasAttribute('disabled')).toBe(true)
  })

  it('enlaza Ver detalle con /admin/averias/:id', async () => {
    const onViewDetail = vi.fn()
    await renderPage({ onViewDetail })
    const detail = [...container.querySelectorAll('a')].find(
      (anchor) => anchor.textContent === 'Ver detalle',
    )
    expect(detail?.getAttribute('href')).toBe('/admin/averias/1')
    await act(async () => {
      detail?.click()
    })
    expect(onViewDetail).toHaveBeenCalledWith(1)
  })

  it('muestra Sin asignar en una avería recién recibida', async () => {
    await renderPage({ items: [AVERIAS_ADMIN_UI_FIXTURE_ITEMS[0]] })
    expect(container.textContent).toContain(AVERIA_UNASSIGNED_LABEL)
    expect(container.textContent).toContain('Recibida')
  })

  it('consulta GET /admin/averias al entrar al listado', async () => {
    await renderPage()
    expect(averiasAdminApi.getAdminAverias).toHaveBeenCalledWith(
      {
        page: 1,
        limit: 20,
        search: undefined,
        estado: undefined,
        prioridad: undefined,
        tipo: undefined,
        fechaDesde: undefined,
        fechaHasta: undefined,
      },
      expect.any(AbortSignal),
    )
    expect(container.querySelector('table')).toBeTruthy()
  })

  it('muestra empty cuando Backend responde 200 con data vacía', async () => {
    vi.mocked(averiasAdminApi.getAdminAverias).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    })
    await renderPage()
    expect(container.textContent).toContain(AVERIAS_ADMIN_EMPTY_MESSAGE)
    expect(container.querySelector('table')).toBeNull()
    expect(container.textContent).not.toContain(AVERIAS_ADMIN_LOAD_ERROR)
  })

  it('muestra error seguro ante un 500', async () => {
    vi.mocked(averiasAdminApi.getAdminAverias).mockRejectedValue(
      new Error('HTTP 500: QueryFailedError SQL Server TypeORM'),
    )
    await renderPage()
    expect(container.textContent).toContain(AVERIAS_ADMIN_LOAD_ERROR)
    expect(container.textContent).not.toContain('QueryFailedError')
    expect(container.textContent).not.toContain('SQL Server')
  })

  it('restaura filtros desde la URL y los envía al Backend', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter
          initialEntries={[
            '/admin/averias?page=2&search=Juan&estado=RECIBIDA&prioridad=ALTA',
          ]}
        >
          <AveriasAdminPage />
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(averiasAdminApi.getAdminAverias).toHaveBeenCalledWith(
      {
        page: 2,
        limit: 20,
        search: 'Juan',
        estado: 'RECIBIDA',
        prioridad: 'ALTA',
        tipo: undefined,
        fechaDesde: undefined,
        fechaHasta: undefined,
      },
      expect.any(AbortSignal),
    )
    expect(
      (container.querySelector('#averias-admin-buscar') as HTMLInputElement)
        .value,
    ).toBe('Juan')
    expect(
      (container.querySelector('#averias-admin-estado') as HTMLSelectElement)
        .value,
    ).toBe('RECIBIDA')
  })

  it('envía search al Backend después del debounce y vuelve a page 1', async () => {
    vi.useFakeTimers()
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/averias?page=5']}>
          <AveriasAdminPage />
        </MemoryRouter>,
      )
    })
    await flush()
    vi.mocked(averiasAdminApi.getAdminAverias).mockClear()

    const input = container.querySelector(
      '#averias-admin-buscar',
    ) as HTMLInputElement
    await act(async () => {
      setInputValue(input, 'AV-2026-0001')
    })
    expect(averiasAdminApi.getAdminAverias).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    await flush()

    expect(averiasAdminApi.getAdminAverias).toHaveBeenCalledWith(
      {
        page: 1,
        limit: 20,
        search: 'AV-2026-0001',
        estado: undefined,
        prioridad: undefined,
      },
      expect.any(AbortSignal),
    )
  })

  it('envía search por Reportante al Backend, no filtra la página local', async () => {
    vi.useFakeTimers()
    await renderPage()
    vi.mocked(averiasAdminApi.getAdminAverias).mockClear()

    const input = container.querySelector(
      '#averias-admin-buscar',
    ) as HTMLInputElement
    await act(async () => {
      setInputValue(input, 'Juan')
    })
    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    await flush()

    expect(averiasAdminApi.getAdminAverias).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'Juan', page: 1 }),
      expect.any(AbortSignal),
    )
    expect(container.textContent).toContain('AV-2026-0002')
  })

  it('envía estado y prioridad reales en la misma consulta y resetea page', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/averias?page=3']}>
          <AveriasAdminPage />
        </MemoryRouter>,
      )
    })
    await flush()
    vi.mocked(averiasAdminApi.getAdminAverias).mockClear()

    const estado = container.querySelector(
      '#averias-admin-estado',
    ) as HTMLSelectElement
    const prioridad = container.querySelector(
      '#averias-admin-prioridad',
    ) as HTMLSelectElement

    await act(async () => {
      estado.value = 'RECIBIDA'
      estado.dispatchEvent(new Event('change', { bubbles: true }))
      prioridad.value = 'ALTA'
      prioridad.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await flush()

    expect(averiasAdminApi.getAdminAverias).toHaveBeenCalledWith(
      {
        page: 1,
        limit: 20,
        search: undefined,
        estado: 'RECIBIDA',
        prioridad: 'ALTA',
        tipo: undefined,
        fechaDesde: undefined,
        fechaHasta: undefined,
      },
      expect.any(AbortSignal),
    )
    expect(estado.value).toBe('RECIBIDA')
    expect(prioridad.value).toBe('ALTA')
  })

  it('envía SIN_ASIGNAR cuando la UI elige Sin asignar', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/averias?prioridad=ALTA']}>
          <AveriasAdminPage />
        </MemoryRouter>,
      )
    })
    await flush()
    vi.mocked(averiasAdminApi.getAdminAverias).mockClear()
    const prioridad = container.querySelector(
      '#averias-admin-prioridad',
    ) as HTMLSelectElement

    await act(async () => {
      prioridad.value = 'SIN_ASIGNAR'
      prioridad.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await flush()

    expect(averiasAdminApi.getAdminAverias).toHaveBeenCalledWith(
      {
        page: 1,
        limit: 20,
        search: undefined,
        estado: undefined,
        prioridad: 'SIN_ASIGNAR',
        tipo: undefined,
        fechaDesde: undefined,
        fechaHasta: undefined,
      },
      expect.any(AbortSignal),
    )
  })

  it('limpia filtros, vuelve a page 1 y consulta el listado general', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter
          initialEntries={[
            '/admin/averias?page=2&search=Juan&estado=RECIBIDA&prioridad=ALTA',
          ]}
        >
          <AveriasAdminPage />
        </MemoryRouter>,
      )
    })
    await flush()
    vi.mocked(averiasAdminApi.getAdminAverias).mockClear()

    const clear = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Limpiar filtros',
    )
    await act(async () => {
      clear?.click()
    })
    await flush()

    expect(
      (container.querySelector('#averias-admin-buscar') as HTMLInputElement)
        .value,
    ).toBe('')
    expect(
      (container.querySelector('#averias-admin-estado') as HTMLSelectElement)
        .value,
    ).toBe('')
    expect(averiasAdminApi.getAdminAverias).toHaveBeenCalledWith(
      {
        page: 1,
        limit: 20,
        search: undefined,
        estado: undefined,
        prioridad: undefined,
        tipo: undefined,
        fechaDesde: undefined,
        fechaHasta: undefined,
      },
      expect.any(AbortSignal),
    )
  })

  it('pagina contra Backend con page+1 y totalPages del listado', async () => {
    vi.mocked(averiasAdminApi.getAdminAverias).mockResolvedValue({
      ...AVERIAS_ADMIN_UI_FIXTURE,
      page: 1,
      total: 40,
      totalPages: 2,
    })
    await renderPage()
    expect(container.textContent).toContain('Página 1 de 2')
    vi.mocked(averiasAdminApi.getAdminAverias).mockClear()
    vi.mocked(averiasAdminApi.getAdminAverias).mockResolvedValue({
      ...AVERIAS_ADMIN_UI_FIXTURE,
      page: 2,
      total: 40,
      totalPages: 2,
    })

    const next = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Siguiente',
    )
    await act(async () => {
      next?.click()
    })
    await flush()

    expect(averiasAdminApi.getAdminAverias).toHaveBeenCalledWith(
      {
        page: 2,
        limit: 20,
        search: undefined,
        estado: undefined,
        prioridad: undefined,
        tipo: undefined,
        fechaDesde: undefined,
        fechaHasta: undefined,
      },
      expect.any(AbortSignal),
    )

    vi.mocked(averiasAdminApi.getAdminAverias).mockClear()
    const previous = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Anterior',
    )
    await act(async () => {
      previous?.click()
    })
    await flush()
    expect(averiasAdminApi.getAdminAverias).toHaveBeenCalledWith(
      {
        page: 1,
        limit: 20,
        search: undefined,
        estado: undefined,
        prioridad: undefined,
        tipo: undefined,
        fechaDesde: undefined,
        fechaHasta: undefined,
      },
      expect.any(AbortSignal),
    )
  })

  it('envía search malicioso al Backend y no filtra en cliente', async () => {
    vi.useFakeTimers()
    await renderPage()
    vi.mocked(averiasAdminApi.getAdminAverias).mockClear()
    const input = container.querySelector(
      '#averias-admin-buscar',
    ) as HTMLInputElement
    await act(async () => {
      setInputValue(input, "' OR 1=1 --")
    })
    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    await flush()
    expect(averiasAdminApi.getAdminAverias).toHaveBeenCalledWith(
      expect.objectContaining({ search: "' OR 1=1 --" }),
      expect.any(AbortSignal),
    )
  })

  it('envía tipo y rango de fechas reales al Backend', async () => {
    await renderPage()
    vi.mocked(averiasAdminApi.getAdminAverias).mockClear()

    const tipo = container.querySelector(
      '#averias-admin-tipo',
    ) as HTMLInputElement
    const desde = container.querySelector(
      '#averias-admin-fecha-desde',
    ) as HTMLInputElement
    const hasta = container.querySelector(
      '#averias-admin-fecha-hasta',
    ) as HTMLInputElement

    const setChangeValue = (input: HTMLInputElement, value: string) => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set?.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }

    await act(async () => {
      setChangeValue(desde, '2026-09-01')
      setChangeValue(hasta, '2026-09-12')
    })
    await flush()

    expect(averiasAdminApi.getAdminAverias).toHaveBeenCalledWith(
      expect.objectContaining({
        fechaDesde: '2026-09-01',
        fechaHasta: '2026-09-12',
        page: 1,
      }),
      expect.any(AbortSignal),
    )

    vi.useFakeTimers()
    vi.mocked(averiasAdminApi.getAdminAverias).mockClear()
    await act(async () => {
      setInputValue(tipo, 'TUBERIA')
    })
    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    await flush()

    expect(averiasAdminApi.getAdminAverias).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'TUBERIA',
        fechaDesde: '2026-09-01',
        fechaHasta: '2026-09-12',
      }),
      expect.any(AbortSignal),
    )
  })
})
