import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../auth/components/AuthContext'
import { loginAsRole } from '../../../test/authTestHelpers'
import AlertasReposicionPage from './AlertasReposicionPage'

const alerta = {
  id: 3,
  idMaterial: 4,
  stockActual: 8,
  stockMinimo: 10,
  estado: 'PENDIENTE',
  fechaGeneracion: '2026-08-22T12:00:00.000Z',
  updatedAt: '2026-08-22T12:00:00.000Z',
  idUsuarioGestiona: null,
  material: { id: 4, nombre: 'Tubo PVC 1/2"', unidadMedida: 'Metro' },
  usuarioGestiona: null,
}

const response = (body: unknown, ok = true, status = 200) => ({
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
      <MemoryRouter initialEntries={['/admin/inventario/alertas-reposicion']}>
        <AuthProvider>
          <AlertasReposicionPage />
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

describe('pantalla de alertas de reposición', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('muestra carga y luego material, stocks, estado, fecha y acción de gestionar', async () => {
    loginAsRole('Administradora')
    let resolveFetch!: (value: Response) => void
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { resolveFetch = resolve })))
    const view = await mount()
    expect(view.container.textContent).toContain('Cargando alertas de reposición')
    await act(async () => resolveFetch(response({ data: [alerta], total: 1, page: 1, limit: 10, totalPages: 1 })))
    expect(view.container.textContent).toContain('Tubo PVC 1/2"')
    expect(view.container.textContent).toContain('Metro')
    expect(view.container.textContent).toContain('8')
    expect(view.container.textContent).toContain('10')
    expect(view.container.textContent).toContain('Pendiente')
    expect(view.container.textContent).toContain('Poner en gestión')
    await view.cleanup()
  })

  it('muestra lista vacía cuando no hay alertas', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 })))
    const view = await mount()
    expect(view.container.textContent).toContain('No hay alertas con ese estado')
    await view.cleanup()
  })

  it('presenta error de carga y permite reintentar', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('sin conexión')))
    const view = await mount()
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain('No fue posible cargar las alertas')
    expect(view.container.textContent).toContain('Reintentar')
    await view.cleanup()
  })

  it('confirma y actualiza el estado de la alerta, luego recarga el listado', async () => {
    loginAsRole('Administradora')
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ data: [alerta], total: 1, page: 1, limit: 10, totalPages: 1 }))
      .mockResolvedValueOnce(response({ id: 3, estado: 'EN_GESTION', usuarioGestiona: { id: 1, nombre: 'Ana' } }))
      .mockResolvedValueOnce(response({ data: [{ ...alerta, estado: 'EN_GESTION', usuarioGestiona: { id: 1, nombre: 'Ana' } }], total: 1, page: 1, limit: 10, totalPages: 1 }))
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount()
    const gestionar = Array.from(view.container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Poner en gestión'),
    )
    expect(gestionar).toBeTruthy()
    await act(async () => gestionar?.click())
    expect(confirmSpy).toHaveBeenCalled()
    expect(fetchMock.mock.calls[1][0]).toContain('/admin/inventario/alertas-reposicion/3/estado')
    expect(view.container.textContent).toContain('La alerta quedó en gestión.')
    confirmSpy.mockRestore()
    await view.cleanup()
  })

  it('no llama al backend si se cancela la confirmación', async () => {
    loginAsRole('Administradora')
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const fetchMock = vi.fn().mockResolvedValueOnce(response({ data: [alerta], total: 1, page: 1, limit: 10, totalPages: 1 }))
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount()
    const gestionar = Array.from(view.container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Poner en gestión'),
    )
    await act(async () => gestionar?.click())
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await view.cleanup()
  })
})
