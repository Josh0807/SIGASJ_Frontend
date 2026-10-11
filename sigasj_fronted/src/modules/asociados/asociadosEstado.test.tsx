import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loginAsRole } from '../../test/authTestHelpers'
import { AuthProvider } from '../auth/components/AuthContext'
import AsociadosRoutes from './AsociadosRoutes'
import type { Asociado, AsociadosListado } from './types'

const juan: Asociado = {
  id: 1,
  nombre: 'Juan',
  apellidos: 'Pérez Rodríguez',
  cedula: '1-1234-0567',
  correoElectronico: 'juan@example.com',
  activo: true,
  fechaRegistro: '2026-01-15T14:00:00.000Z',
  fechaInactivacion: null,
  motivoInactivacion: null,
  createdAt: '2026-01-15T08:00:00.000Z',
  updatedAt: '2026-01-16T09:30:00.000Z',
}

const luis: Asociado = {
  ...juan,
  id: 2,
  nombre: 'Luis',
  apellidos: 'Mora Castro',
  cedula: '3-0111-0222',
  activo: false,
  fechaInactivacion: '2026-05-02T16:00:00.000Z',
  motivoInactivacion: 'Venta de la propiedad',
}

const inactivado = (asociado: Asociado, motivo: string): Asociado => ({
  ...asociado,
  activo: false,
  fechaInactivacion: '2026-10-11T18:00:00.000Z',
  motivoInactivacion: motivo,
})

const reactivado = (asociado: Asociado): Asociado => ({
  ...asociado,
  activo: true,
  fechaInactivacion: null,
  motivoInactivacion: null,
})

const response = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    text: async () => (ok ? '' : JSON.stringify(body)),
    json: async () => body,
  }) as Response

const listado = (data: Asociado[]): AsociadosListado => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: data.length ? 1 : 0,
})

type Handler = (url: URL, init: RequestInit) => Response | Promise<Response>

function stubApi(handler: Handler) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init: RequestInit = {}) =>
    Promise.resolve(handler(new URL(String(input), 'http://localhost'), init)),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Responde el listado o el detalle y delega el PATCH /estado al manejador indicado. */
function stubEstado(filas: Asociado[], onPatch: (id: number, body: Record<string, unknown>) => Response) {
  return stubApi((url, init) => {
    const match = /\/asociados\/(\d+)\/estado$/.exec(url.pathname)
    if (match && init.method === 'PATCH') {
      return onPatch(Number(match[1]), JSON.parse(String(init.body)) as Record<string, unknown>)
    }
    const detalle = /\/asociados\/(\d+)$/.exec(url.pathname)
    if (detalle) return response(filas.find((a) => a.id === Number(detalle[1])))
    return response(listado(filas))
  })
}

const patches = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.filter(([url, init]) => String(url).endsWith('/estado') && (init as RequestInit)?.method === 'PATCH')

const flush = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)) })

async function mount(path: string) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <Routes>
            <Route path="/admin/abonados/*" element={<AsociadosRoutes />} />
            <Route path="/login" element={<p>Pantalla de login</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )
  })
  await flush()
  return {
    container,
    cleanup: async () => {
      await act(async () => root.unmount())
      container.remove()
    },
  }
}

function escribir(textarea: HTMLTextAreaElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set?.call(textarea, value)
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
}

const byText = (container: ParentNode, selector: string, text: string) =>
  Array.from(container.querySelectorAll<HTMLElement>(selector)).find((node) => node.textContent?.trim() === text)

const dialogo = () => document.querySelector<HTMLElement>('[role="dialog"]')
const confirmacion = () => document.querySelector<HTMLElement>('[role="alertdialog"]')
const fila = (container: HTMLElement, nombre: string) =>
  Array.from(container.querySelectorAll<HTMLElement>('tbody tr')).find((tr) => tr.textContent?.includes(nombre))!

describe('Asociados: activación e inactivación (5.4)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('ofrece Inactivar a los activos y Reactivar a los inactivos', async () => {
    loginAsRole('Secretaria')
    stubEstado([juan, luis], () => response({}))
    const view = await mount('/admin/abonados')
    expect(byText(fila(view.container, 'Juan'), 'button', 'Inactivar')).toBeDefined()
    expect(byText(fila(view.container, 'Luis'), 'button', 'Reactivar')).toBeDefined()
    expect(byText(fila(view.container, 'Juan'), 'button', 'Reactivar')).toBeUndefined()
    await view.cleanup()
  })

  it('inactiva desde el listado pidiendo un motivo obligatorio', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubEstado([juan], (_id, body) => response(inactivado(juan, String(body.motivo))))
    const view = await mount('/admin/abonados')

    await act(async () => byText(fila(view.container, 'Juan'), 'button', 'Inactivar')!.click())
    const dlg = dialogo()!
    expect(dlg.textContent).toContain('Inactivar asociado')
    expect(dlg.textContent).toContain('Juan Pérez Rodríguez quedará inactivo')
    const textarea = dlg.querySelector('textarea')!
    expect(document.activeElement).toBe(textarea)

    await act(async () => byText(dlg, 'button', 'Inactivar')!.click())
    expect(dlg.textContent).toContain('Indique el motivo de la inactivación.')
    await act(async () => escribir(textarea, '    '))
    await act(async () => byText(dlg, 'button', 'Inactivar')!.click())
    expect(patches(fetchMock)).toHaveLength(0)

    await act(async () => escribir(textarea, '  Venta de la propiedad  '))
    await act(async () => byText(dlg, 'button', 'Inactivar')!.click())
    await flush()

    const [[url, init]] = patches(fetchMock)
    expect(String(url)).toMatch(/\/asociados\/1\/estado$/)
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({ activo: false, motivo: 'Venta de la propiedad' })
    expect(dialogo()).toBeNull()
    const actualizada = fila(view.container, 'Juan')
    expect(actualizada.textContent).toContain('Inactivo')
    expect(byText(actualizada, 'button', 'Reactivar')).toBeDefined()
    expect(view.container.querySelector('[role="status"]')?.textContent).toContain(
      'Juan Pérez Rodríguez fue inactivado correctamente.',
    )
    await view.cleanup()
  })

  it('limita el motivo a 500 caracteres', async () => {
    loginAsRole('Administradora')
    stubEstado([juan], () => response({}))
    const view = await mount('/admin/abonados')
    await act(async () => byText(fila(view.container, 'Juan'), 'button', 'Inactivar')!.click())
    const textarea = dialogo()!.querySelector('textarea')!
    expect(textarea.maxLength).toBe(500)
    expect(textarea.getAttribute('aria-required')).toBe('true')
    await view.cleanup()
  })

  it('Cancelar y Escape cierran sin cambiar el estado', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubEstado([juan], () => response({}))
    const view = await mount('/admin/abonados')

    await act(async () => byText(fila(view.container, 'Juan'), 'button', 'Inactivar')!.click())
    await act(async () => byText(dialogo()!, 'button', 'Cancelar')!.click())
    expect(dialogo()).toBeNull()

    await act(async () => byText(fila(view.container, 'Juan'), 'button', 'Inactivar')!.click())
    await act(async () => {
      dialogo()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })
    expect(dialogo()).toBeNull()
    expect(patches(fetchMock)).toHaveLength(0)
    expect(fila(view.container, 'Juan').textContent).toContain('Activo')
    await view.cleanup()
  })

  it('reactiva desde el listado tras confirmar', async () => {
    loginAsRole('Secretaria')
    const fetchMock = stubEstado([luis], () => response(reactivado(luis)))
    const view = await mount('/admin/abonados')

    await act(async () => byText(fila(view.container, 'Luis'), 'button', 'Reactivar')!.click())
    const confirm = confirmacion()!
    expect(confirm.textContent).toContain('Luis Mora Castro volverá a quedar activo')
    await act(async () => byText(confirm, 'button', 'Reactivar')!.click())
    await flush()

    const [[, init]] = patches(fetchMock)
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({ activo: true })
    const actualizada = fila(view.container, 'Luis')
    expect(actualizada.textContent).toContain('Activo')
    expect(byText(actualizada, 'button', 'Inactivar')).toBeDefined()
    expect(view.container.querySelector('[role="status"]')?.textContent).toContain('fue reactivado correctamente')
    await view.cleanup()
  })

  it('cancelar la reactivación no llama al backend', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubEstado([luis], () => response(reactivado(luis)))
    const view = await mount('/admin/abonados')
    await act(async () => byText(fila(view.container, 'Luis'), 'button', 'Reactivar')!.click())
    await act(async () => byText(confirmacion()!, 'button', 'Cancelar')!.click())
    expect(patches(fetchMock)).toHaveLength(0)
    expect(fila(view.container, 'Luis').textContent).toContain('Inactivo')
    await view.cleanup()
  })

  it('ante un 400 mantiene el diálogo, el motivo escrito y muestra el mensaje del backend', async () => {
    loginAsRole('Administradora')
    stubEstado([juan], () => response({ message: ['El motivo de inactivación es obligatorio'] }, false, 400))
    const view = await mount('/admin/abonados')
    await act(async () => byText(fila(view.container, 'Juan'), 'button', 'Inactivar')!.click())
    const textarea = dialogo()!.querySelector('textarea')!
    await act(async () => escribir(textarea, 'Mudanza'))
    await act(async () => byText(dialogo()!, 'button', 'Inactivar')!.click())
    await flush()

    expect(dialogo()).not.toBeNull()
    expect(dialogo()!.querySelector('textarea')!.value).toBe('Mudanza')
    expect(dialogo()!.textContent).toContain('El motivo de inactivación es obligatorio')
    expect(fila(view.container, 'Juan').textContent).toContain('Activo')
    await view.cleanup()
  })

  it('ante un 403 al reactivar informa que no tiene permisos', async () => {
    loginAsRole('Administradora')
    stubEstado([luis], () => response({ message: 'Forbidden resource' }, false, 403))
    const view = await mount('/admin/abonados')
    await act(async () => byText(fila(view.container, 'Luis'), 'button', 'Reactivar')!.click())
    await act(async () => byText(confirmacion()!, 'button', 'Reactivar')!.click())
    await flush()
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain(
      'No tiene permisos para cambiar el estado de asociados.',
    )
    expect(fila(view.container, 'Luis').textContent).toContain('Inactivo')
    await view.cleanup()
  })

  it('cierra la sesión ante un 401 al cambiar el estado', async () => {
    loginAsRole('Administradora')
    stubEstado([juan], () => response({ message: 'Unauthorized' }, false, 401))
    const view = await mount('/admin/abonados')
    await act(async () => byText(fila(view.container, 'Juan'), 'button', 'Inactivar')!.click())
    await act(async () => escribir(dialogo()!.querySelector('textarea')!, 'Mudanza'))
    await act(async () => byText(dialogo()!, 'button', 'Inactivar')!.click())
    await flush()
    expect(view.container.textContent).toContain('Pantalla de login')
    await view.cleanup()
  })

  it('no duplica la inactivación ante dos envíos seguidos', async () => {
    loginAsRole('Administradora')
    let resolver!: (value: Response) => void
    const fetchMock = vi.fn((input: RequestInfo | URL, init: RequestInit = {}) =>
      String(input).endsWith('/estado') && init.method === 'PATCH'
        ? new Promise<Response>((resolve) => { resolver = resolve })
        : Promise.resolve(response(listado([juan]))),
    )
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount('/admin/abonados')
    await act(async () => byText(fila(view.container, 'Juan'), 'button', 'Inactivar')!.click())
    await act(async () => escribir(dialogo()!.querySelector('textarea')!, 'Mudanza'))
    const form = dialogo()!.querySelector('form')!
    await act(async () => {
      form.requestSubmit()
      form.requestSubmit()
    })
    expect(byText(dialogo()!, 'button', 'Inactivando…')).toHaveProperty('disabled', true)
    await act(async () => resolver(response(inactivado(juan, 'Mudanza'))))
    await flush()
    expect(patches(fetchMock)).toHaveLength(1)
    await view.cleanup()
  })

  it('el detalle muestra fecha y motivo de inactivación y permite reactivar', async () => {
    loginAsRole('Secretaria')
    const fetchMock = stubEstado([luis], () => response(reactivado(luis)))
    const view = await mount('/admin/abonados/2')
    const texto = view.container.textContent ?? ''
    expect(texto).toContain('Fecha de inactivación')
    expect(texto).toContain('2 may 2026')
    expect(texto).toContain('Motivo de la inactivación')
    expect(texto).toContain('Venta de la propiedad')

    await act(async () => byText(view.container, 'button', 'Reactivar')!.click())
    await act(async () => byText(confirmacion()!, 'button', 'Reactivar')!.click())
    await flush()

    expect(patches(fetchMock)).toHaveLength(1)
    const despues = view.container.textContent ?? ''
    expect(despues).toContain('El asociado fue reactivado correctamente.')
    expect(despues).not.toContain('Motivo de la inactivación')
    expect(despues).not.toContain('Fecha de inactivación')
    expect(byText(view.container, 'button', 'Inactivar')).toBeDefined()
    await view.cleanup()
  })

  it('el detalle inactiva y muestra el motivo registrado', async () => {
    loginAsRole('Administradora')
    stubEstado([juan], (_id, body) => response(inactivado(juan, String(body.motivo))))
    const view = await mount('/admin/abonados/1')
    expect(view.container.textContent).not.toContain('Motivo de la inactivación')

    await act(async () => byText(view.container, 'button', 'Inactivar')!.click())
    await act(async () => escribir(dialogo()!.querySelector('textarea')!, 'Fallecimiento'))
    await act(async () => byText(dialogo()!, 'button', 'Inactivar')!.click())
    await flush()

    const texto = view.container.textContent ?? ''
    expect(texto).toContain('El asociado fue inactivado correctamente.')
    expect(texto).toContain('Motivo de la inactivación')
    expect(texto).toContain('Fallecimiento')
    expect(view.container.querySelector('h1')?.parentElement?.textContent).toContain('Inactivo')
    await view.cleanup()
  })

  it('la consulta filtrada por Inactivos sigue funcionando (5.4.5)', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubEstado([luis], () => response({}))
    const view = await mount('/admin/abonados?estado=inactivos')
    const url = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')
    expect(url.searchParams.get('activo')).toBe('false')
    expect(fila(view.container, 'Luis').textContent).toContain('Inactivo')
    await view.cleanup()
  })
})
