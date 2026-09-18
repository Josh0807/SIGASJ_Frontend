import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../auth/components/AuthContext'
import { loginAsRole } from '../../../test/authTestHelpers'
import MovimientosPage from './MovimientosPage'

const movimiento = {
  id: 12,
  tipo: 'ENTRADA',
  cantidad: 30,
  fechaMovimiento: '2026-08-22T14:15:00.000Z',
  idMaterial: 4,
  idUsuario: 1,
  referencia: 'REP-0012',
  material: { id: 4, nombre: 'Tubo PVC', unidadMedida: 'Metro' },
  usuario: { id: 1, nombre: 'Administradora' },
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
      <MemoryRouter initialEntries={['/admin/inventario/movimientos']}>
        <AuthProvider>
          <MovimientosPage />
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

describe('pantalla de historial de movimientos', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('muestra movimientos y enlace al detalle', async () => {
    loginAsRole('Administradora')
    let resolveFetch!: (value: Response) => void
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { resolveFetch = resolve })))
    const view = await mount()
    expect(view.container.textContent).toContain('Cargando historial')

    await act(async () => resolveFetch(response({
      data: [movimiento],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    })))

    expect(view.container.textContent).toContain('Tubo PVC')
    expect(view.container.textContent).toContain('REP-0012')
    expect(view.container.textContent).toContain('Ver detalle')
    await view.cleanup()
  })
})
