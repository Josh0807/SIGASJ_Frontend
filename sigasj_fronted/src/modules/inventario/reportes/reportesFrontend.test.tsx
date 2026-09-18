import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../auth/components/AuthContext'
import { loginAsRole } from '../../../test/authTestHelpers'
import ReportesInventarioPage from './ReportesInventarioPage'

const reporte = {
  indicadores: {
    totalMateriales: 48,
    materialesActivos: 45,
    materialesStockBajo: 7,
    entradasRegistradas: 15,
    salidasRegistradas: 29,
  },
  porCategoria: [{ idCategoria: 1, nombre: 'Tuberías', totalMateriales: 10, materialesStockBajo: 2 }],
  materiales: [],
  movimientos: [],
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
      <MemoryRouter initialEntries={['/admin/inventario/reportes']}>
        <AuthProvider>
          <ReportesInventarioPage />
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

describe('pantalla de reportes de inventario', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('muestra indicadores del reporte', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo) => {
      const url = String(input)
      if (url.includes('/reportes/resumen')) {
        return response(reporte)
      }
      if (url.includes('/categorias')) {
        return response({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 })
      }
      return response({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 })
    }))
    const view = await mount()

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(view.container.textContent).toContain('Total de materiales')
    expect(view.container.textContent).toContain('48')
    expect(view.container.textContent).toContain('Stock bajo')
    expect(view.container.textContent).toContain('7')
    await view.cleanup()
  })
})
