import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AveriasAdminPagination from './AveriasAdminPagination'

describe('AveriasAdminPagination', () => {
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

  const renderPagination = async (
    props: Partial<Parameters<typeof AveriasAdminPagination>[0]> = {},
  ) => {
    const onPageChange = props.onPageChange ?? vi.fn()
    await act(async () => {
      root.render(
        <AveriasAdminPagination
          page={2}
          totalPages={5}
          total={57}
          onPageChange={onPageChange}
          {...props}
        />,
      )
    })
    return onPageChange
  }

  it('muestra página actual y habilita anterior/siguiente', async () => {
    await renderPagination()
    expect(container.textContent).toContain('Página 2 de 5')
    const buttons = [...container.querySelectorAll('button')]
    expect(buttons[0]?.textContent).toBe('Anterior')
    expect(buttons[0]?.hasAttribute('disabled')).toBe(false)
    expect(buttons[1]?.textContent).toBe('Siguiente')
    expect(buttons[1]?.hasAttribute('disabled')).toBe(false)
  })

  it('deshabilita Anterior en la primera página', async () => {
    await renderPagination({ page: 1, totalPages: 5 })
    const previous = container.querySelector('button')
    expect(previous?.textContent).toBe('Anterior')
    expect(previous?.hasAttribute('disabled')).toBe(true)
  })

  it('deshabilita Siguiente en la última página', async () => {
    await renderPagination({ page: 5, totalPages: 5 })
    const buttons = [...container.querySelectorAll('button')]
    expect(buttons[1]?.textContent).toBe('Siguiente')
    expect(buttons[1]?.hasAttribute('disabled')).toBe(true)
  })
})
