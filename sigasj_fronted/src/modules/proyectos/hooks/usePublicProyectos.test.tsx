import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePublicProyectos } from './usePublicProyectos'
import * as proyectosApi from '../services/proyectosApi'

function TestComponent({
  onValue,
}: {
  onValue: (val: ReturnType<typeof usePublicProyectos>) => void
}) {
  const value = usePublicProyectos()
  onValue(value)
  return (
    <div>
      <span data-testid="status">{value.status}</span>
      <span data-testid="count">{value.proyectos.length}</span>
      <span data-testid="error">{value.error ?? ''}</span>
      <button type="button" onClick={value.retry}>
        Retry
      </button>
    </div>
  )
}

describe('usePublicProyectos', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.restoreAllMocks()
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('inicia en estado loading y actualiza a success con la lista de proyectos', async () => {
    const list = [
      {
        id: 10,
        nombre: 'Acueducto Sector Sur',
        imagenPrincipal: '/cover.jpg',
        duracion: '6 meses',
        estado: 'EN_PROCESO' as const,
      },
    ]
    vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(list)

    let latestVal!: ReturnType<typeof usePublicProyectos>

    await act(async () => {
      root.render(
        <TestComponent
          onValue={(val) => {
            latestVal = val
          }}
        />,
      )
    })

    expect(latestVal.status).toBe('success')
    expect(latestVal.proyectos).toEqual(list)
    expect(latestVal.error).toBeNull()
  })

  it('maneja el estado de error y permite reintentar la consulta', async () => {
    const spy = vi
      .spyOn(proyectosApi, 'getPublicProyectos')
      .mockRejectedValueOnce(new Error('HTTP 500: Server Error'))
      .mockResolvedValueOnce([])

    let latestVal!: ReturnType<typeof usePublicProyectos>

    await act(async () => {
      root.render(
        <TestComponent
          onValue={(val) => {
            latestVal = val
          }}
        />,
      )
    })

    expect(latestVal.status).toBe('error')
    expect(latestVal.error).toBe('HTTP 500: Server Error')

    const button = container.querySelector('button') as HTMLButtonElement

    await act(async () => {
      button.click()
    })

    expect(spy).toHaveBeenCalledTimes(2)
    expect(latestVal.status).toBe('success')
    expect(latestVal.proyectos).toEqual([])
  })
})
