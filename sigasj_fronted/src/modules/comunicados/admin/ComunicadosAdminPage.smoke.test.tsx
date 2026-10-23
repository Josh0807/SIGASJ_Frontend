import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ComunicadosAdminPage from './ComunicadosAdminPage'
import * as comunicadosApi from '../services/comunicadosApi'
import type { AdminComunicado } from '../services/comunicadosApi'

const FIXTURE: AdminComunicado[] = [
  {
    id: '1',
    titulo: 'Corte programado',
    descripcion: 'Aviso de mantenimiento',
    contenido: 'Detalle del aviso',
    tipo: 'Informativo',
    prioridad: 'Media',
    estado: 'Activo',
    esPublico: true,
    fechaPublicacion: '2026-03-01T12:00:00.000Z',
    fechaExpiracion: null,
    imagenUrl: null,
  },
]

describe('ComunicadosAdminPage (smoke)', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.spyOn(comunicadosApi, 'getAdminComunicados').mockResolvedValue(FIXTURE)
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

  it('renderiza listado y permite abrir el formulario de alta', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ComunicadosAdminPage />
        </MemoryRouter>,
      )
    })
    await flush()

    expect(container.querySelector('h1')?.textContent).toBe(
      'Gestión de Comunicados',
    )
    expect(container.textContent).toContain('Corte programado')

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Nuevo comunicado'),
    )
    expect(createButton).toBeTruthy()

    await act(async () => {
      createButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    await flush()

    expect(container.querySelector('h1')?.textContent).toBe('Nuevo comunicado')
    expect(container.textContent).toContain('Volver al listado')
  })

  it('muestra error controlado si falla la carga', async () => {
    vi.spyOn(comunicadosApi, 'getAdminComunicados').mockRejectedValueOnce(
      new Error('fail'),
    )

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ComunicadosAdminPage />
        </MemoryRouter>,
      )
    })
    await flush()

    expect(container.textContent).toContain(
      'No fue posible cargar los comunicados.',
    )
  })
})
