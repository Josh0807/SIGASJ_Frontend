import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../auth/components/AuthContext'
import { clearAccessToken, setAuthSession } from '../../auth/utils/authStorage'
import SalidaCreatePage from './SalidaCreatePage'

const material = { id: 4, nombre: 'Tubo PVC', descripcion: null, unidadMedida: 'metro', ubicacion: null, stockMinimo: 2, stockActual: 8, activo: true, idCategoria: null, categoria: null, idProveedor: null, proveedor: null, createdAt: '2026-01-01', updatedAt: '2026-01-01' }
const agotado = { ...material, id: 5, nombre: 'Codo PVC', stockActual: 0 }
const inactive = { ...material, id: 6, nombre: 'Material inactivo', activo: false }
const catalog = { data: [material, agotado, inactive], total: 3, page: 1, limit: 100, totalPages: 1 }
const availability = { idMaterial: 4, nombreMaterial: 'Tubo PVC', disponible: true, stockActual: 8, stockMinimo: 2, cantidadSolicitada: 4, stockResultante: 4, esAgotamientoTotal: false, esBajoMinimo: false, mensaje: 'Stock suficiente. Quedarán 4 unidades disponibles.' }
const ok = (body: unknown, status = 200) => ({ ok: true, status, json: async () => body }) as Response
const waitForPrecheck = () => new Promise((resolve) => window.setTimeout(resolve, 400))

async function mount(path = '/admin/inventario/salidas') {
  const container = document.createElement('div'); document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => root.render(<MemoryRouter initialEntries={[path]}><AuthProvider><SalidaCreatePage /></AuthProvider></MemoryRouter>))
  return { container, cleanup: async () => { await act(async () => root.unmount()); container.remove() } }
}

function setValue(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) {
  const prototype = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value)
  element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
}

describe('integración del formulario de salida', () => {
  beforeEach(() => setAuthSession({ accessToken: 'token-fontanero', user: { id: '3', name: 'Luis', lastName: 'Mora', role: 'Fontanero' } }))
  afterEach(() => { vi.unstubAllGlobals(); clearAccessToken(); document.body.innerHTML = '' })

  it('consulta activos con stock, verifica disponibilidad y registra una sola salida con la avería', async () => {
    const response = { movimiento: { id: 45, tipo: 'SALIDA', cantidad: 4, idMaterial: 4, idUsuario: 3, idAveria: 42, idSolicitud: null, observacion: 'Reparación', fechaMovimiento: '2026-09-11' }, stockAnterior: 8, stockActual: 4, diferencia: -4, agotadoTotal: false, bajoStockMinimo: false, mensaje: 'Salida física registrada exitosamente.' }
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (String(url).includes('/disponibilidad')) return Promise.resolve(ok(availability))
      if (String(url).endsWith('/inventario/salidas') && options?.method === 'POST') return new Promise<Response>((resolve) => window.setTimeout(() => resolve(ok(response, 201)), 20))
      return Promise.resolve(ok(catalog))
    })
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount('/admin/inventario/salidas?idAveria=42')
    const select = view.container.querySelector('select') as HTMLSelectElement
    expect(select.textContent).toContain('Tubo PVC')
    expect(select.textContent).not.toContain('Codo PVC')
    expect(select.textContent).not.toContain('Material inactivo')
    const quantity = view.container.querySelector('input[type="number"]') as HTMLInputElement
    const observation = view.container.querySelector('textarea') as HTMLTextAreaElement
    await act(async () => { setValue(select, '4'); setValue(quantity, '4'); setValue(observation, 'Reparación'); await waitForPrecheck() })
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/materiales/4/disponibilidad?cantidad=4'))).toBe(true)
    expect(view.container.textContent).toContain('Avería relacionada: #42')
    expect(view.container.textContent).toContain('Luis Mora · obtenido de la sesión activa')
    const form = view.container.querySelector('form') as HTMLFormElement
    await act(async () => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); await new Promise((resolve) => window.setTimeout(resolve, 30)) })
    const posts = fetchMock.mock.calls.filter(([, options]) => (options as RequestInit | undefined)?.method === 'POST')
    expect(posts).toHaveLength(1)
    expect(JSON.parse(String((posts[0][1] as RequestInit).body))).toEqual({ idMaterial: 4, cantidad: 4, idAveria: 42, idSolicitud: null, observacion: 'Reparación' })
    expect(view.container.textContent).toContain('Movimiento SALIDA #45')
    expect(view.container.textContent).toContain('Stock anterior: 8 → Stock actualizado: 4')
    expect(select.value).toBe('')
    expect(quantity.value).toBe('')
    await view.cleanup()
  })

  it('muestra el 400 del backend y conserva los datos para corregirlos', async () => {
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (String(url).includes('/disponibilidad')) return Promise.resolve(ok(availability))
      if (String(url).endsWith('/inventario/salidas') && options?.method === 'POST') return Promise.resolve({ ok: false, status: 400, statusText: 'Bad Request', text: async () => JSON.stringify({ message: 'Stock insuficiente para realizar la salida. Existencias disponibles: 3, cantidad solicitada: 4' }) } as Response)
      return Promise.resolve(ok(catalog))
    })
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount()
    const select = view.container.querySelector('select') as HTMLSelectElement
    const quantity = view.container.querySelector('input[type="number"]') as HTMLInputElement
    await act(async () => { setValue(select, '4'); setValue(quantity, '4'); await waitForPrecheck() })
    await act(async () => (view.container.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
    expect(view.container.textContent).toContain('Existencias disponibles: 3')
    expect(select.value).toBe('4')
    expect(quantity.value).toBe('4')
    await view.cleanup()
  })
})
