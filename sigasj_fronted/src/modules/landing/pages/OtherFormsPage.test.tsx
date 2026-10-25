import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as publicApi from '../../solicitudes-publicas/formularios-descargables/formulariosDescargablesPublicApi'
import OtherFormsPage from './OtherFormsPage'

vi.mock('../../solicitudes-publicas/formularios-descargables/formulariosDescargablesPublicApi', async () => {
  const actual = await vi.importActual<typeof publicApi>(
    '../../solicitudes-publicas/formularios-descargables/formulariosDescargablesPublicApi',
  )
  return {
    ...actual,
    listFormulariosDescargablesPublicos: vi.fn(),
    downloadFormularioDescargablePublico: vi.fn(),
  }
})

async function mount() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(
      <MemoryRouter>
        <OtherFormsPage />
      </MemoryRouter>,
    )
  })
  await act(async () => {
    await Promise.resolve()
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
  return {
    container,
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

beforeEach(() => {
  vi.mocked(publicApi.listFormulariosDescargablesPublicos).mockResolvedValue([])
  vi.mocked(publicApi.downloadFormularioDescargablePublico).mockReset()
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('OtherFormsPage', () => {
  it('explica que los formularios son solo descargables y muestra empty state', async () => {
    const view = await mount()
    expect(view.container.textContent).toContain('Formularios descargables')
    expect(view.container.textContent).toContain('no se completan en línea')
    expect(view.container.textContent).toContain(
      'No hay formularios adicionales disponibles en este momento.',
    )
    expect(view.container.textContent).not.toContain('Realizar solicitud')
    expect(view.container.textContent).not.toContain('Iniciar trámite')
    expect(view.container.textContent).not.toContain('Llenar formulario')
    await view.cleanup()
  })

  it('muestra activos con nombre, descripción y Descargar; oculta inactivos', async () => {
    vi.mocked(publicApi.listFormulariosDescargablesPublicos).mockResolvedValue([
      {
        id: 1,
        nombre: 'Formulario A',
        descripcion: 'Propósito A',
        nombreArchivoOriginal: 'a.pdf',
        activo: true,
      },
      {
        id: 2,
        nombre: 'Formulario B',
        descripcion: 'Propósito B',
        nombreArchivoOriginal: 'b.pdf',
        activo: true,
      },
    ])
    const view = await mount()
    expect(view.container.textContent).toContain('Formulario A')
    expect(view.container.textContent).toContain('Propósito A')
    expect(view.container.textContent).toContain('Formulario B')
    expect(view.container.textContent).toContain('Descargar')
    expect(view.container.textContent).not.toMatch(/storageKey|uploads\//i)
    expect(view.container.querySelector('input')).toBeNull()
    expect(view.container.querySelector('textarea')).toBeNull()
    await view.cleanup()
  })

  it('muestra error de listado con reintentar', async () => {
    vi.mocked(publicApi.listFormulariosDescargablesPublicos).mockRejectedValue(
      new Error('HTTP 500: fail'),
    )
    const view = await mount()
    expect(view.container.querySelector('[role="alert"]')?.textContent).toMatch(
      /No fue posible cargar/i,
    )
    const callsBeforeRetry =
      vi.mocked(publicApi.listFormulariosDescargablesPublicos).mock.calls.length
    vi.mocked(publicApi.listFormulariosDescargablesPublicos).mockResolvedValue(
      [],
    )
    const retry = [...view.container.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Reintentar'),
    ) as HTMLButtonElement
    await act(async () => {
      retry.click()
    })
    await act(async () => {
      await Promise.resolve()
    })
    expect(
      vi.mocked(publicApi.listFormulariosDescargablesPublicos).mock.calls
        .length,
    ).toBeGreaterThan(callsBeforeRetry)
    expect(view.container.textContent).toContain(
      'No hay formularios adicionales disponibles en este momento.',
    )
    await view.cleanup()
  })

  it('Descargar obtiene el PDF y no crea solicitud', async () => {
    vi.mocked(publicApi.listFormulariosDescargablesPublicos).mockResolvedValue([
      {
        id: 9,
        nombre: 'Conexión',
        descripcion: 'Nueva conexión',
        nombreArchivoOriginal: 'conexion.pdf',
        activo: true,
      },
    ])
    vi.mocked(publicApi.downloadFormularioDescargablePublico).mockResolvedValue(
      'conexion.pdf',
    )
    const view = await mount()
    const download = [...view.container.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Descargar'),
    ) as HTMLButtonElement
    await act(async () => {
      download.click()
    })
    await act(async () => {
      await Promise.resolve()
    })
    expect(publicApi.downloadFormularioDescargablePublico).toHaveBeenCalledWith(
      9,
      'conexion.pdf',
    )
    expect(view.container.textContent).not.toContain('código de seguimiento')
    await view.cleanup()
  })

  it('error de descarga no rompe el listado', async () => {
    vi.mocked(publicApi.listFormulariosDescargablesPublicos).mockResolvedValue([
      {
        id: 9,
        nombre: 'Conexión',
        descripcion: 'Nueva conexión',
        nombreArchivoOriginal: 'conexion.pdf',
        activo: true,
      },
    ])
    vi.mocked(publicApi.downloadFormularioDescargablePublico).mockRejectedValue(
      new Error('El formulario ya no está disponible para descarga.'),
    )
    const view = await mount()
    const download = [...view.container.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Descargar'),
    ) as HTMLButtonElement
    await act(async () => {
      download.click()
    })
    await act(async () => {
      await Promise.resolve()
    })
    expect(view.container.textContent).toContain('Conexión')
    expect(view.container.querySelector('[role="alert"]')?.textContent).toMatch(
      /no está disponible/i,
    )
    await view.cleanup()
  })
})
