import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AveriasAdminTable from './AveriasAdminTable'
import { AVERIAS_ADMIN_UI_FIXTURE_ITEMS } from './fixtures/averiasAdminList.fixture'
import {
  AVERIA_UNASSIGNED_LABEL,
  AVERIA_UNCLASSIFIED_LABEL,
  type AveriaListItem,
} from './types'

describe('AveriasAdminTable', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  const renderTable = async (
    items: AveriaListItem[] = AVERIAS_ADMIN_UI_FIXTURE_ITEMS,
    onViewDetail?: (id: number) => void,
  ) => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AveriasAdminTable items={items} onViewDetail={onViewDetail} />
        </MemoryRouter>,
      )
    })
  }

  it('renderiza columnas semánticas y no expone datos personales', async () => {
    await renderTable()
    expect(container.querySelector('table')).toBeTruthy()
    expect(container.querySelector('th')?.textContent).toBe('Código')
    expect(container.textContent).toContain('AV-2026-0001')
    expect(container.textContent).toContain('María Rodríguez')
    expect(container.textContent).toContain('San Juan')
    expect(container.textContent).not.toContain('1-2345-6789')
    expect(container.textContent).not.toContain('8888-8888')
    expect(container.textContent).not.toContain('@')
  })

  it('muestra Sin asignar y Sin clasificar cuando los opcionales son null', async () => {
    await renderTable([AVERIAS_ADMIN_UI_FIXTURE_ITEMS[0]])
    const unassigned = container.textContent?.match(
      new RegExp(AVERIA_UNASSIGNED_LABEL, 'g'),
    )
    expect(unassigned?.length).toBeGreaterThanOrEqual(2)
    expect(container.textContent).toContain(AVERIA_UNCLASSIFIED_LABEL)
  })

  it('muestra prioridad, tipo y nombre de Fontanero cuando existen', async () => {
    await renderTable([AVERIAS_ADMIN_UI_FIXTURE_ITEMS[1]])
    expect(container.textContent).toContain('Alta')
    expect(container.textContent).toContain('TUBERIA')
    expect(container.textContent).toContain('Luis Campos')
    expect(container.textContent).not.toContain('[object Object]')
  })

  it('muestra fallback del Fontanero cuando solo hay id', async () => {
    await renderTable([AVERIAS_ADMIN_UI_FIXTURE_ITEMS[2]])
    expect(container.textContent).toContain('Fontanero #8')
  })

  it('pasa el search del listado al detalle para conservar filtros', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter
          initialEntries={['/admin/averias?page=2&search=Juan&estado=RECIBIDA']}
        >
          <AveriasAdminTable items={[AVERIAS_ADMIN_UI_FIXTURE_ITEMS[0]]} />
        </MemoryRouter>,
      )
    })
    const link = [...container.querySelectorAll('a')].find(
      (anchor) => anchor.textContent === 'Ver detalle',
    )
    expect(link?.getAttribute('href')).toBe('/admin/averias/1')
  })

  it('navega a /admin/averias/:id desde Ver detalle', async () => {
    const onViewDetail = vi.fn()
    await renderTable([AVERIAS_ADMIN_UI_FIXTURE_ITEMS[0]], onViewDetail)
    const link = [...container.querySelectorAll('a')].find(
      (anchor) => anchor.textContent === 'Ver detalle',
    )
    expect(link?.getAttribute('href')).toBe('/admin/averias/1')
    await act(async () => {
      link?.click()
    })
    expect(onViewDetail).toHaveBeenCalledWith(1)
  })

  it('muestra el estado Recibida con texto visible', async () => {
    await renderTable([AVERIAS_ADMIN_UI_FIXTURE_ITEMS[0]])
    expect(container.textContent).toContain('Recibida')
  })
})
