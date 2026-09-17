import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../auth/components/AuthContext'
import { loginAsRole } from '../../../test/authTestHelpers'
import ReposicionesPage from './ReposicionesPage'

const reposicion = {
  id: 5,
  codigo: 'REP-0005',
  fechaGeneracion: '2026-09-15T10:00:00.000Z',
  origen: 'ALERTA_STOCK_MINIMO',
  estado: 'PENDIENTE',
  idAlertaReposicion: 2,
  idSolicitudMaterial: null,
  idUsuarioResponsable: 1,
  idProveedor: null,
  fechaCompra: null,
  observacion: null,
  proveedor: null,
  usuarioResponsable: { id: 1, nombre: 'Ana' },
  alertaReposicion: { id: 2 },
  solicitudMaterial: null,
  detalles: [
    {
      id: 1,
      idMaterial: 4,
      cantidad: 10,
      material: { id: 4, nombre: 'Tubo PVC', unidadMedida: 'Metro', stockActual: 2 },
    },
  ],
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
      <MemoryRouter initialEntries={['/admin/inventario/reposiciones']}>
        <AuthProvider>
          <ReposicionesPage />
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

describe('pantalla de reposiciones de materiales', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('muestra carga y luego código, origen, estado y enlace al detalle', async () => {
    loginAsRole('Administradora')
    let resolveFetch!: (value: Response) => void
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { resolveFetch = resolve })))
    const view = await mount()
    expect(view.container.textContent).toContain('Cargando reposiciones')
    await act(async () => resolveFetch(response({ data: [reposicion], total: 1, page: 1, limit: 10, totalPages: 1 })))
    expect(view.container.textContent).toContain('REP-0005')
    expect(view.container.textContent).toContain('Stock mínimo')
    expect(view.container.textContent).toContain('Pendiente')
    expect(view.container.textContent).toContain('Ver detalle')
    await view.cleanup()
  })

  it('muestra lista vacía cuando no hay reposiciones', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 })))
    const view = await mount()
    expect(view.container.textContent).toContain('No hay reposiciones registradas')
    await view.cleanup()
  })
})
