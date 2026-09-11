import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../auth/components/AuthContext'
import { loginAsRole } from '../../../test/authTestHelpers'
import ProveedorForm from './ProveedorForm'
import ProveedoresPage from './ProveedoresPage'
import ProveedorStateAction from './ProveedorStateAction'
import type { Proveedor } from './types'

const proveedor: Proveedor = { id: 10, nombre: 'Ferretería El Lagar', razonSocial: 'El Lagar S.A.', identificacion: '3-101-123456', telefono: '2680-1122', correo: 'ventas@ellagar.cr', direccion: 'Nicoya', personaContacto: 'Ana Pérez', activo: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' }
const response = (body: unknown, ok = true, status = 200) => ({ ok, status, statusText: ok ? 'OK' : 'Error', text: async () => ok ? '' : JSON.stringify(body), json: async () => body }) as Response

async function mount(node: React.ReactNode) {
  const container = document.createElement('div'); document.body.appendChild(container); const root = createRoot(container)
  await act(async () => { root.render(<MemoryRouter><AuthProvider>{node}</AuthProvider></MemoryRouter>) })
  return { container, cleanup: async () => { await act(async () => root.unmount()); container.remove() } }
}

describe('pantalla de proveedores', () => {
  afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); document.body.innerHTML = '' })

  it('muestra carga y luego los datos y acciones a la Administradora', async () => {
    loginAsRole('Administradora')
    let resolveFetch!: (value: Response) => void
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { resolveFetch = resolve })))
    const view = await mount(<ProveedoresPage />)
    expect(view.container.textContent).toContain('Cargando proveedores')
    await act(async () => resolveFetch(response({ data: [proveedor], total: 1, page: 1, limit: 10, totalPages: 1 })))
    expect(view.container.textContent).toContain('Ferretería El Lagar')
    expect(view.container.textContent).toContain('ventas@ellagar.cr')
    expect(view.container.textContent).toContain('Editar')
    expect(view.container.textContent).toContain('Desactivar')
    await view.cleanup()
  })

  it('muestra lista vacía y limita a solo lectura para Fontanero', async () => {
    loginAsRole('Fontanero')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 })))
    const empty = await mount(<ProveedoresPage />)
    expect(empty.container.textContent).toContain('Aún no hay proveedores')
    expect(empty.container.textContent).not.toContain('Nuevo proveedor')
    await empty.cleanup()

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response({ data: [proveedor], total: 1, page: 1, limit: 10, totalPages: 1 })))
    const readonly = await mount(<ProveedoresPage />)
    expect(readonly.container.textContent).toContain('Solo lectura')
    expect(readonly.container.textContent).not.toContain('Desactivar')
    await readonly.cleanup()
  })

  it('presenta error de carga y permite reintentar', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('sin conexión')))
    const view = await mount(<ProveedoresPage />)
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain('No fue posible cargar')
    expect(view.container.textContent).toContain('Reintentar')
    await view.cleanup()
  })
})

describe('interacciones administrativas de proveedores', () => {
  afterEach(() => { localStorage.clear(); document.body.innerHTML = '' })

  it('valida el formulario y evita el doble envío', async () => {
    const onSubmit = vi.fn(() => new Promise<void>(() => undefined))
    const view = await mount(<ProveedorForm mode="create" onSubmit={onSubmit} />)
    const form = view.container.querySelector('form') as HTMLFormElement
    await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
    expect(view.container.textContent).toContain('El nombre es obligatorio')
    const name = view.container.querySelector('input') as HTMLInputElement
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    await act(async () => { valueSetter?.call(name, 'Ferretería ABC'); name.dispatchEvent(new Event('input', { bubbles: true })) })
    await act(async () => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect((view.container.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true)
    await view.cleanup()
  })

  it('solicita confirmación antes de desactivar', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined)
    const view = await mount(<ProveedorStateAction proveedor={proveedor} disabled={false} onChange={onChange} />)
    await act(async () => (view.container.querySelector('.is-deactivate') as HTMLButtonElement).click())
    expect(view.container.querySelector('[role="alertdialog"]')).not.toBeNull()
    const confirm = [...view.container.querySelectorAll('button')].find((button) => button.textContent === 'Desactivar proveedor') as HTMLButtonElement
    await act(async () => confirm.click())
    expect(onChange).toHaveBeenCalledWith(proveedor, false)
    await view.cleanup()
  })
})
