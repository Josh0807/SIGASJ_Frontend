import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GalleryAdminPage from './GalleryAdminPage'
import * as galeriaApi from '../services/galeriaApi'
import type { AdminGalleryPhoto } from './types'

const FIXTURE: AdminGalleryPhoto[] = [
  {
    id: 1,
    titulo: 'Obra de tubería',
    descripcion: 'Trabajo en campo',
    imagenUrl: 'https://example.com/foto.jpg',
    textoAlternativo: 'Fontanero en obra',
    ordenVisualizacion: 0,
    activo: true,
  },
]

describe('GalleryAdminPage (smoke)', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.spyOn(galeriaApi, 'getAdminGaleria').mockResolvedValue(FIXTURE)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  const flush = async () => {
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
  }

  it('renderiza el encabezado y el listado de fotografías', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <GalleryAdminPage />
        </MemoryRouter>,
      )
    })
    await flush()

    expect(container.querySelector('h1')?.textContent).toBe(
      'Galería de fotografías',
    )
    expect(container.textContent).toContain('Obra de tubería')
    expect(container.textContent).toContain('Nueva fotografía')
  })

  it('muestra error controlado si falla la carga', async () => {
    vi.spyOn(galeriaApi, 'getAdminGaleria').mockRejectedValueOnce(
      new Error('fail'),
    )

    await act(async () => {
      root.render(
        <MemoryRouter>
          <GalleryAdminPage />
        </MemoryRouter>,
      )
    })
    await flush()

    expect(container.textContent).toContain(
      'No fue posible cargar la galería.',
    )
  })
})
