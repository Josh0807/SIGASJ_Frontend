import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePublicProyectoDetalle } from './usePublicProyectoDetalle'
import * as proyectosApi from '../services/proyectosApi'

function TestComponent({
  id,
  onValue,
}: {
  id?: string
  onValue: (val: ReturnType<typeof usePublicProyectoDetalle>) => void
}) {
  const value = usePublicProyectoDetalle(id)
  onValue(value)
  return <div>{value.status}</div>
}

describe('usePublicProyectoDetalle', () => {
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

  it('retorna not-found si id es undefined', async () => {
    let latestVal!: ReturnType<typeof usePublicProyectoDetalle>

    await act(async () => {
      root.render(
        <TestComponent
          onValue={(val) => {
            latestVal = val
          }}
        />,
      )
    })

    expect(latestVal.status).toBe('not-found')
    expect(latestVal.proyecto).toBeNull()
  })

  it('carga exitosamente el detalle del proyecto público activo', async () => {
    const detalleMock: proyectosApi.PublicProyectoDetalle = {
      id: 10,
      nombre: 'Acueducto Sector Sur',
      descripcion: 'Construcción de 5km de tubería',
      encargadoRealizacion: 'Ing. Carlos',
      duracion: '6 meses',
      estado: 'EN_PROCESO',
      imagenPrincipal: '/cover.jpg',
      activo: true,
      imagenes: [
        { id: 1, imagenUrl: '/foto1.jpg', textoAlternativo: 'Excavación' },
      ],
    }

    vi.spyOn(proyectosApi, 'getPublicProyectoDetalle').mockResolvedValueOnce(
      detalleMock,
    )

    let latestVal!: ReturnType<typeof usePublicProyectoDetalle>

    await act(async () => {
      root.render(
        <TestComponent
          id="10"
          onValue={(val) => {
            latestVal = val
          }}
        />,
      )
    })

    expect(latestVal.status).toBe('success')
    expect(latestVal.proyecto).toEqual(detalleMock)
  })

  it('marca not-found si la API responde HTTP 404 o proyecto inactivo', async () => {
    vi.spyOn(proyectosApi, 'getPublicProyectoDetalle').mockRejectedValueOnce(
      new Error('HTTP 404: Proyecto no encontrado'),
    )

    let latestVal!: ReturnType<typeof usePublicProyectoDetalle>

    await act(async () => {
      root.render(
        <TestComponent
          id="99"
          onValue={(val) => {
            latestVal = val
          }}
        />,
      )
    })

    expect(latestVal.status).toBe('not-found')
    expect(latestVal.proyecto).toBeNull()
  })
})
