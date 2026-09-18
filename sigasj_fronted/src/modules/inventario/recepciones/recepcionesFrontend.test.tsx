import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../auth/components/AuthContext'
import { loginAsRole } from '../../../test/authTestHelpers'
import RecepcionesPage from './RecepcionesPage'

const reposicionPendiente = {
  id: 8,
  codigo: 'REP-0008',
  fechaGeneracion: '2026-09-15T10:00:00.000Z',
  origen: 'ADMINISTRATIVA',
  estado: 'PENDIENTE_RECEPCION',
  idAlertaReposicion: null,
  idSolicitudMaterial: null,
  idUsuarioResponsable: 1,
  idProveedor: 2,
  fechaCompra: '2026-09-14T12:00:00.000Z',
  fechaRecepcion: null,
  observacion: null,
  proveedor: { id: 2, nombre: 'Ferretería ABC' },
  usuarioResponsable: { id: 1, nombre: 'Ana' },
  alertaReposicion: null,
  solicitudMaterial: null,
  detalles: [
    {
      id: 1,
      idMaterial: 4,
      cantidad: 30,
      material: { id: 4, nombre: 'Tubo PVC', unidadMedida: 'Metro', stockActual: 8 },
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
      <MemoryRouter initialEntries={['/admin/inventario/recepciones']}>
        <AuthProvider>
          <RecepcionesPage />
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

describe('pantalla de recepción de materiales', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('muestra compras pendientes y enlace para registrar recepción', async () => {
    loginAsRole('Administradora')
    let resolveFetch!: (value: Response) => void
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { resolveFetch = resolve })))
    const view = await mount()
    expect(view.container.textContent).toContain('Cargando compras pendientes')
    await act(async () => resolveFetch(response({
      data: [reposicionPendiente],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    })))
    expect(view.container.textContent).toContain('REP-0008')
    expect(view.container.textContent).toContain('Ferretería ABC')
    expect(view.container.textContent).toContain('Registrar recepción')
    await view.cleanup()
  })

  it('muestra lista vacía cuando no hay pendientes', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    })))
    const view = await mount()
    await act(async () => { await Promise.resolve() })
    expect(view.container.textContent).toContain('No hay compras pendientes de recepción')
    await view.cleanup()
  })
})
