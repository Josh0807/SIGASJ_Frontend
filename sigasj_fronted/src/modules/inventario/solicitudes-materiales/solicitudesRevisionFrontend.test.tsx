import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../auth/components/AuthContext'
import { loginAsRole } from '../../../test/authTestHelpers'
import SolicitudesRevisionPage from './SolicitudesRevisionPage'
import SolicitudRevisionDetallePage from './SolicitudRevisionDetallePage'

const request = {
  id: 15,
  codigo: 'SOL-0015',
  fechaSolicitud: '2026-08-22T12:00:00.000Z',
  estado: 'PENDIENTE',
  idFontanero: 7,
  idAveria: 42,
  observacion: null,
  cantidadMateriales: 3,
  fontanero: { id: 7, nombre: 'Juan Pérez' },
  averia: { codigo: 'AV-0042' },
}

const response = (body: unknown, ok = true, status = 200) => ({
  ok,
  status,
  statusText: ok ? 'OK' : 'Error',
  text: async () => (ok ? '' : JSON.stringify(body)),
  json: async () => body,
}) as Response

async function mount(
  node: React.ReactNode,
  entry: string | { pathname: string; state?: unknown } = '/admin/inventario/solicitudes',
) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[entry]}>
        <AuthProvider>{node}</AuthProvider>
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

describe('pantalla de revisión de solicitudes', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('muestra carga y luego las solicitudes pendientes con fontanero y avería', async () => {
    loginAsRole('Administradora')
    let resolveFetch!: (value: Response) => void
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { resolveFetch = resolve })))
    const view = await mount(<SolicitudesRevisionPage />)
    expect(view.container.textContent).toContain('Cargando solicitudes pendientes')
    await act(async () => resolveFetch(response({ data: [request], total: 1, page: 1, limit: 10, totalPages: 1 })))
    expect(view.container.textContent).toContain('SOL-0015')
    expect(view.container.textContent).toContain('Juan Pérez')
    expect(view.container.textContent).toContain('AV-0042')
    expect(view.container.textContent).toContain('Pendiente')
    expect(view.container.textContent).toContain('Ver detalle')
    await view.cleanup()
  })

  it('muestra lista vacía cuando no hay pendientes', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 })))
    const view = await mount(<SolicitudesRevisionPage />)
    expect(view.container.textContent).toContain('No hay solicitudes pendientes')
    await view.cleanup()
  })

  it('presenta error de carga y permite reintentar', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('sin conexión')))
    const view = await mount(<SolicitudesRevisionPage />)
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain('No fue posible cargar')
    expect(view.container.textContent).toContain('Reintentar')
    await view.cleanup()
  })
})

describe('detalle de revisión de solicitudes', () => {
  afterEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('muestra el resumen y deja Aprobar y Rechazar preparados pero deshabilitados', async () => {
    loginAsRole('Administradora')
    const view = await mount(
      <Routes>
        <Route path="/admin/inventario/solicitudes/:id" element={<SolicitudRevisionDetallePage />} />
      </Routes>,
      { pathname: '/admin/inventario/solicitudes/15', state: { solicitud: request } },
    )
    expect(view.container.textContent).toContain('SOL-0015')
    expect(view.container.textContent).toContain('Juan Pérez')
    expect(view.container.textContent).toContain('AV-0042')
    const approve = [...view.container.querySelectorAll('button')].find((button) => button.textContent === 'Aprobar') as HTMLButtonElement
    const reject = [...view.container.querySelectorAll('button')].find((button) => button.textContent === 'Rechazar') as HTMLButtonElement
    expect(approve.disabled).toBe(true)
    expect(reject.disabled).toBe(true)
    await view.cleanup()
  })
})
