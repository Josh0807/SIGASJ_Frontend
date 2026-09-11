import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import EntradaCreatePage from './EntradaCreatePage'
import { AuthProvider } from '../../auth/components/AuthContext'

const material = { id: 4, nombre: 'Tubo PVC', descripcion: null, unidadMedida: 'Tubo', ubicacion: null, stockMinimo: 2, stockActual: 8, activo: true, idCategoria: null, categoria: null, idProveedor: null, proveedor: null, createdAt: '2026-01-01', updatedAt: '2026-01-01' }
const proveedor = { id: 7, nombre: 'Ferretería ABC', razonSocial: null, identificacion: null, telefono: null, correo: null, direccion: null, personaContacto: null, activo: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' }
const ok = (body: unknown, status = 200) => ({ ok: true, status, json: async () => body }) as Response

async function mount(node: ReactNode) {
  const container = document.createElement('div'); document.body.appendChild(container); const root = createRoot(container)
  await act(async () => root.render(<MemoryRouter><AuthProvider>{node}</AuthProvider></MemoryRouter>))
  return { container, cleanup: async () => { await act(async () => root.unmount()); container.remove() } }
}

function setValue(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) {
  const prototype = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value)
  element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
}

describe('formulario de entrada', () => {
  afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = '' })

  it('carga solo catálogos activos y muestra la unidad seleccionada', async () => {
    const fetchMock = vi.fn((url: string) => Promise.resolve(String(url).includes('/proveedores') ? ok({ data: [proveedor], total: 1, page: 1, limit: 100, totalPages: 1 }) : ok({ data: [material], total: 1, page: 1, limit: 100, totalPages: 1 })))
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount(<EntradaCreatePage />)
    const selects = view.container.querySelectorAll('select')
    await act(async () => setValue(selects[0], '4'))
    expect((view.container.querySelector('[aria-label="Unidad de medida del material"]') as HTMLInputElement).value).toBe('Tubo')
    expect(view.container.textContent).toContain('Ferretería ABC')
    expect(fetchMock.mock.calls.every(([url]) => String(url).includes('activo=true'))).toBe(true)
    expect(view.container.textContent).not.toContain('Stock final')
    await view.cleanup()
  })

  it('rechaza cantidades no positivas y envía una entrada válida una sola vez', async () => {
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (String(url).endsWith('/entradas') && options?.method === 'POST') return Promise.resolve(ok({ movimiento: { id: 1, tipo: 'ENTRADA' }, material: { id: 4, nombre: 'Tubo PVC', unidadMedida: 'Tubo', stockActual: 13 }, stockAnterior: 8, stockActual: 13, mensaje: 'Entrada física registrada exitosamente.' }, 201))
      if (String(url).endsWith('/entradas/1/documentos') && options?.method === 'POST') return Promise.resolve(ok({ id: 9, nombreOriginal: 'factura.pdf', tipoArchivo: 'application/pdf', rutaReferenciaArchivo: '/api/v1/inventario/movimientos/1/documentos/archivo.pdf', tamanio: 5, idMovimiento: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' }, 201))
      return Promise.resolve(String(url).includes('/proveedores') ? ok({ data: [proveedor], total: 1, page: 1, limit: 100, totalPages: 1 }) : ok({ data: [material], total: 1, page: 1, limit: 100, totalPages: 1 }))
    })
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount(<EntradaCreatePage />)
    const form = view.container.querySelector('form') as HTMLFormElement
    const selects = view.container.querySelectorAll('select'); const quantity = view.container.querySelector('input[type="number"]') as HTMLInputElement
    const fileInput = view.container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['%PDF-'], 'factura.pdf', { type: 'application/pdf' })
    Object.defineProperty(fileInput, 'files', { configurable: true, value: [file] })
    await act(async () => fileInput.dispatchEvent(new Event('change', { bubbles: true })))
    await act(async () => { setValue(selects[0], '4'); setValue(quantity, '0'); form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    expect(view.container.textContent).toContain('mayor a cero')
    await act(async () => { setValue(quantity, '5'); setValue(selects[1], '7'); form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    const posts = fetchMock.mock.calls.filter(([, options]) => (options as RequestInit | undefined)?.method === 'POST')
    expect(posts).toHaveLength(2)
    expect((posts[0][1] as RequestInit).body).toContain('"cantidad":5')
    expect(String(posts[1][0])).toMatch(/entradas\/1\/documentos$/)
    expect((posts[1][1] as RequestInit).body).toBeInstanceOf(FormData)
    expect(view.container.textContent).toContain('Entrada física registrada exitosamente')
    expect(view.container.textContent).toContain('Movimiento ENTRADA #1')
    expect(view.container.textContent).toContain('Stock anterior: 8 → Stock actualizado: 13')
    expect(view.container.textContent).toContain('Documentos adjuntos')
    expect((view.container.querySelector('input[type="number"]') as HTMLInputElement).value).toBe('')
    await view.cleanup()
  })

  it('conserva los datos cuando el backend devuelve un error corregible', async () => {
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (String(url).endsWith('/entradas') && options?.method === 'POST') return Promise.resolve({ ok: false, status: 400, statusText: 'Bad Request', text: async () => JSON.stringify({ message: 'El proveedor seleccionado se encuentra inactivo' }) } as Response)
      return Promise.resolve(String(url).includes('/proveedores') ? ok({ data: [proveedor], total: 1, page: 1, limit: 100, totalPages: 1 }) : ok({ data: [material], total: 1, page: 1, limit: 100, totalPages: 1 }))
    })
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount(<EntradaCreatePage />)
    const form = view.container.querySelector('form') as HTMLFormElement
    const selects = view.container.querySelectorAll('select'); const quantity = view.container.querySelector('input[type="number"]') as HTMLInputElement
    await act(async () => { setValue(selects[0], '4'); setValue(quantity, '5'); setValue(selects[1], '7'); form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    expect(view.container.textContent).toContain('proveedor seleccionado se encuentra inactivo')
    expect(quantity.value).toBe('5')
    expect(selects[0].value).toBe('4')
    expect(selects[1].value).toBe('7')
    await view.cleanup()
  })
})
