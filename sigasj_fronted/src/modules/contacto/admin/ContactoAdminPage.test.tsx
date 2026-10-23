import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ContactoAdminPage from './ContactoAdminPage'
import * as contactoApi from '../services/contactoApi'
import { DEFAULT_CONTACTO_UBICACION } from '../services/contactoApi'

describe('ContactoAdminPage', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.spyOn(contactoApi, 'getAdminContacto').mockResolvedValue({
      ...DEFAULT_CONTACTO_UBICACION,
      telefono: '2222-3333',
      email: 'contacto@asada.test',
    })
    vi.spyOn(contactoApi, 'updateAdminContacto').mockImplementation(
      async (payload) => payload,
    )
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

  const renderPage = async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ContactoAdminPage />
        </MemoryRouter>,
      )
    })
    await flush()
  }

  it('carga el formulario con los datos de contacto', async () => {
    await renderPage()

    expect(container.querySelector('h1')?.textContent).toBe(
      'Información de Contacto y Ubicación',
    )
    expect(
      (container.querySelector('input[type="email"]') as HTMLInputElement | null)
        ?.value,
    ).toBe('contacto@asada.test')
    expect(container.textContent).toContain('Guardar cambios')
  })

  it('muestra error controlado si falla la carga', async () => {
    vi.spyOn(contactoApi, 'getAdminContacto').mockRejectedValueOnce(
      new Error('network'),
    )

    await renderPage()

    expect(container.textContent).toContain(
      'No fue posible cargar la información de contacto.',
    )
  })

  it('guarda cambios y muestra confirmación', async () => {
    await renderPage()

    const form = container.querySelector('form')
    expect(form).toBeTruthy()

    await act(async () => {
      form?.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      )
    })
    await flush()

    expect(contactoApi.updateAdminContacto).toHaveBeenCalled()
    expect(container.textContent).toContain(
      'La información de contacto y ubicación se guardó correctamente.',
    )
  })
})
