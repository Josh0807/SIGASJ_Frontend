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
  cantidadMateriales: 2,
  totalMateriales: 8,
  fontanero: { id: 7, nombre: 'Juan Pérez' },
  averia: { codigo: 'AV-0042' },
  detalles: [
    { id: 1, idSolicitud: 15, idMaterial: 1, cantidad: 5, observacion: null, material: { id: 1, nombre: 'Tubo PVC 1/2"', unidadMedida: 'Metro', stockActual: 50 } },
    { id: 2, idSolicitud: 15, idMaterial: 2, cantidad: 3, observacion: null, material: { id: 2, nombre: 'Unión PVC', unidadMedida: 'Unidad', stockActual: 30 } },
  ],
}

const response = (body: unknown, ok = true, status = 200) => ({
  ok,
  status,
  statusText: ok ? 'OK' : 'Error',
  text: async () => JSON.stringify(body),
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

const detailView = (
  <Routes>
    <Route path="/admin/inventario/solicitudes/:id" element={<SolicitudRevisionDetallePage />} />
  </Routes>
)

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

describe('detalle e integración de revisión de solicitudes', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('carga el detalle con materiales, cantidades y existencia', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(request)))
    const view = await mount(detailView, '/admin/inventario/solicitudes/15')
    expect(view.container.textContent).toContain('SOL-0015')
    expect(view.container.textContent).toContain('Juan Pérez')
    expect(view.container.textContent).toContain('Tubo PVC 1/2"')
    expect(view.container.textContent).toContain('5 Metro')
    expect(view.container.textContent).toContain('Unión PVC')
    expect(view.container.querySelector('.material-review__approve')).not.toBeNull()
    await view.cleanup()
  })

  it('pide confirmación y cancela sin enviar la decisión', async () => {
    loginAsRole('Administradora')
    const fetchMock = vi.fn().mockResolvedValue(response(request))
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount(detailView, '/admin/inventario/solicitudes/15')
    await act(async () => (view.container.querySelector('.material-review__approve') as HTMLButtonElement).click())
    expect(view.container.querySelector('[role="alertdialog"]')).not.toBeNull()
    await act(async () => ([...view.container.querySelectorAll('button')].find((button) => button.textContent === 'Cancelar') as HTMLButtonElement).click())
    expect(view.container.querySelector('[role="alertdialog"]')).toBeNull()
    expect(fetchMock.mock.calls.every((call) => !String(call[1]?.method ?? 'GET').includes('PATCH'))).toBe(true)
    await view.cleanup()
  })

  it('aprueba tras confirmar y evita un segundo envío', async () => {
    loginAsRole('Administradora')
    let resolveApprove!: (value: Response) => void
    const fetchMock = vi.fn((url: string | URL, options?: RequestInit) => {
      if (String(options?.method).toUpperCase() === 'PATCH') {
        return new Promise<Response>((resolve) => { resolveApprove = resolve })
      }
      return Promise.resolve(response(request))
    })
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount(detailView, '/admin/inventario/solicitudes/15')
    await act(async () => (view.container.querySelector('.material-review__approve') as HTMLButtonElement).click())
    const confirm = [...view.container.querySelectorAll('button')].find((button) => button.textContent === 'Aprobar solicitud') as HTMLButtonElement
    await act(async () => { confirm.click(); confirm.click() })
    expect(fetchMock.mock.calls.filter((call) => String(call[1]?.method).toUpperCase() === 'PATCH')).toHaveLength(1)
    await act(async () => resolveApprove(response({ ...request, estado: 'APROBADA', idUsuarioAprobador: 1, fechaRevision: '2026-08-23T12:00:00.000Z' })))
    expect(view.container.textContent).toContain('La solicitud fue aprobada')
    expect(view.container.textContent).toContain('Aprobada')
    expect(view.container.querySelector('.material-review__approve')).toBeNull()
    await view.cleanup()
  })

  it('rechaza tras confirmar y muestra el error si ya no está pendiente', async () => {
    loginAsRole('Administradora')
    const fetchMock = vi.fn((url: string | URL, options?: RequestInit) => {
      if (String(options?.method).toUpperCase() === 'PATCH') {
        return Promise.resolve(response({ message: 'Solo se puede rechazar una solicitud en estado PENDIENTE' }, false, 400))
      }
      return Promise.resolve(response(request))
    })
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount(detailView, '/admin/inventario/solicitudes/15')
    await act(async () => (view.container.querySelector('.material-review__reject') as HTMLButtonElement).click())
    await act(async () => ([...view.container.querySelectorAll('button')].find((button) => button.textContent === 'Rechazar solicitud') as HTMLButtonElement).click())
    expect(view.container.querySelector('[role="alert"]')?.textContent).toMatch(/ya no está pendiente/i)
    await view.cleanup()
  })
})
