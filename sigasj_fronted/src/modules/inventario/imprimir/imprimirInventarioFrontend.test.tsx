import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../auth/components/AuthContext'
import { loginAsRole } from '../../../test/authTestHelpers'
import ImprimirInventarioPage from './ImprimirInventarioPage'

const material = {
  id: 8,
  nombre: 'Tubo PVC',
  descripcion: 'Tubería de 1/2"',
  unidadMedida: 'Metro',
  ubicacion: 'Estante A',
  stockMinimo: 10,
  stockActual: 4,
  activo: true,
  idCategoria: 1,
  categoria: { id: 1, nombre: 'Tuberías', descripcion: null, activo: true },
  idProveedor: 2,
  proveedor: { id: 2, nombre: 'Proveedor ABC', telefono: null, correo: null, activo: true },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const response = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    text: async () => JSON.stringify(body),
    json: async () => body,
  }) as Response

async function mount() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={['/admin/inventario/imprimir']}>
        <AuthProvider>
          <ImprimirInventarioPage />
        </AuthProvider>
      </MemoryRouter>,
    )
  })
  return {
    container,
    cleanup: async () => {
      await act(async () => root.unmount())
      container.remove()
    },
  }
}

describe('pantalla de imprimir inventario', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('muestra el listado y permite imprimir', async () => {
    loginAsRole('Administradora')
    const print = vi.fn()
    vi.spyOn(window, 'print').mockImplementation(print)
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo) => {
        const url = String(input)
        if (url.includes('/categorias') || url.includes('/proveedores')) {
          return response({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 })
        }
        return response({ data: [material], total: 1, page: 1, limit: 100, totalPages: 1 })
      }),
    )

    const view = await mount()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(view.container.textContent).toContain('Imprimir inventario')
    expect(view.container.textContent).toContain('Tubo PVC')
    expect(view.container.textContent).toContain('Estante A')
    expect(view.container.textContent).toContain('1 con stock bajo')

    const button = Array.from(view.container.querySelectorAll('button')).find(
      (item) => item.textContent?.includes('Imprimir'),
    ) as HTMLButtonElement
    expect(button.disabled).toBe(false)

    await act(async () => {
      button.click()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(print).toHaveBeenCalledTimes(1)
    await view.cleanup()
  })

  it('deshabilita imprimir cuando no hay materiales', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 })),
    )

    const view = await mount()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(view.container.textContent).toContain('Aún no hay materiales')
    const button = Array.from(view.container.querySelectorAll('button')).find(
      (item) => item.textContent?.includes('Imprimir'),
    ) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    await view.cleanup()
  })
})
