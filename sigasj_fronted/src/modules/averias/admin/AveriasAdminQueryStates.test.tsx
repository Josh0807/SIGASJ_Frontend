import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AveriasAdminQueryStates from './AveriasAdminQueryStates'
import {
  AVERIAS_ADMIN_EMPTY_MESSAGE,
  AVERIAS_ADMIN_LOAD_ERROR,
  AVERIAS_ADMIN_LOADING_MESSAGE,
} from './types'

describe('AveriasAdminQueryStates', () => {
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

  const renderStates = async (
    props: Partial<Parameters<typeof AveriasAdminQueryStates>[0]>,
  ) => {
    await act(async () => {
      root.render(
        <AveriasAdminQueryStates
          loading={false}
          error={null}
          hasResults={false}
          {...props}
        >
          <p>listado-visible</p>
        </AveriasAdminQueryStates>,
      )
    })
  }

  it('muestra loading sin empty ni error', async () => {
    await renderStates({ loading: true })
    expect(container.textContent).toContain(AVERIAS_ADMIN_LOADING_MESSAGE)
    expect(container.querySelector('.gallery-admin__skeleton')).toBeTruthy()
    expect(container.textContent).not.toContain(AVERIAS_ADMIN_EMPTY_MESSAGE)
    expect(container.textContent).not.toContain(AVERIAS_ADMIN_LOAD_ERROR)
    expect(container.textContent).not.toContain('listado-visible')
  })

  it('muestra error comprensible y no detalles técnicos', async () => {
    await renderStates({ error: AVERIAS_ADMIN_LOAD_ERROR, onRetry: vi.fn() })
    expect(container.textContent).toContain(AVERIAS_ADMIN_LOAD_ERROR)
    expect(container.textContent).not.toContain('SQL Server')
    expect(container.textContent).not.toContain('TypeORM')
    expect(container.textContent).not.toContain(AVERIAS_ADMIN_EMPTY_MESSAGE)
  })

  it('muestra empty cuando no hay resultados', async () => {
    await renderStates({ hasResults: false })
    expect(container.textContent).toContain(AVERIAS_ADMIN_EMPTY_MESSAGE)
    expect(container.textContent).not.toContain('listado-visible')
  })

  it('muestra el listado cuando hay resultados', async () => {
    await renderStates({ hasResults: true })
    expect(container.textContent).toContain('listado-visible')
  })

  it('conserva el listado anterior mientras actualiza', async () => {
    await renderStates({ loading: true, hasResults: true })
    expect(container.textContent).toContain('listado-visible')
    expect(container.textContent).not.toContain(AVERIAS_ADMIN_EMPTY_MESSAGE)
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
  })
})
