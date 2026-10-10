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
  createdAt: '2026-01-15T08:00:00.000Z',
  updatedAt: '2026-01-16T09:30:00.000Z',
}

const luis: Asociado = {
  ...juan,
  id: 2,
  nombre: 'Luis',
  apellidos: 'Mora Castro',
  cedula: '3-0111-0222',
  correoElectronico: 'luis@example.com',
  activo: false,
  fechaInactivacion: '2026-05-02T16:00:00.000Z',
}

const response = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    text: async () => (ok ? '' : JSON.stringify(body)),
    json: async () => body,
  }) as Response

const listado = (data: Asociado[], extra: Partial<AsociadosListado> = {}): AsociadosListado => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: data.length ? 1 : 0,
  ...extra,
})

type Handler = (url: URL, init: RequestInit) => Response | Promise<Response>

function stubApi(handler: Handler) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init: RequestInit = {}) =>
    Promise.resolve(handler(new URL(String(input), 'http://localhost'), init)),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const flush = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)) })
const esperarDebounce = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 400)) })
const ultimaUrl = (fetchMock: ReturnType<typeof vi.fn>) =>
  new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')

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

function setValue(element: HTMLInputElement | HTMLSelectElement, value: string) {
  const prototype = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value)
  element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
}

const byText = (container: ParentNode, selector: string, text: string) =>
  Array.from(container.querySelectorAll<HTMLElement>(selector)).find((node) => node.textContent?.trim() === text)

describe('Asociados: consulta y búsqueda (5.2)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('muestra carga y luego la tabla Cédula | Asociado | Fecha de registro | Estado | Acción', async () => {
    loginAsRole('Secretaria')
    let resolver!: (value: Response) => void
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { resolver = resolve })))
    const view = await mount('/admin/abonados')
    expect(view.container.textContent).toContain('Cargando asociados')

    await act(async () => resolver(response(listado([juan, luis]))))
    const headers = Array.from(view.container.querySelectorAll('th')).map((th) => th.textContent)
    expect(headers).toEqual(['Cédula', 'Asociado', 'Fecha de registro', 'Estado', 'Acción'])
    const [fila1, fila2] = Array.from(view.container.querySelectorAll('tbody tr'))
    expect(fila1.textContent).toContain('1-1234-0567')
    expect(fila1.textContent).toContain('Juan Pérez Rodríguez')
    expect(fila1.textContent).toContain('juan@example.com')
    expect(fila1.textContent).toContain('15 ene 2026')
    expect(fila1.textContent).toContain('Activo')
    expect(fila2.textContent).toContain('Inactivo')
    expect(byText(fila1, 'a', 'Ver')?.getAttribute('href')).toBe('/admin/abonados/1')
    expect(view.container.textContent).toContain('Mostrando 1–2 de 2 asociados')
    await view.cleanup()
  })

  it('conserva el botón para registrar un asociado', async () => {
    loginAsRole('Administradora')
    stubApi(() => response(listado([juan])))
    const view = await mount('/admin/abonados')
    expect(byText(view.container, 'a', 'Registrar asociado')?.getAttribute('href')).toBe('/admin/abonados/nuevo')
    await view.cleanup()
  })

  it('consulta la primera página por defecto', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubApi(() => response(listado([juan])))
    const view = await mount('/admin/abonados')
    const url = ultimaUrl(fetchMock)
    expect(url.pathname).toMatch(/\/asociados$/)
    expect(url.searchParams.get('page')).toBe('1')
    expect(url.searchParams.get('limit')).toBe('10')
    expect(url.searchParams.has('search')).toBe(false)
    expect(url.searchParams.has('activo')).toBe(false)
    await view.cleanup()
  })

  it('envía búsqueda (con debounce) y filtro de estado al backend', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubApi(() => response(listado([juan])))
    const view = await mount('/admin/abonados')
    const llamadasIniciales = fetchMock.mock.calls.length

    const buscar = view.container.querySelector<HTMLInputElement>('input[type="search"]')!
    await act(async () => setValue(buscar, 'Pér'))
    expect(fetchMock.mock.calls.length).toBe(llamadasIniciales)
    await esperarDebounce()
    await flush()
    expect(ultimaUrl(fetchMock).searchParams.get('search')).toBe('Pér')

    const estado = view.container.querySelector<HTMLSelectElement>('select')!
    await act(async () => setValue(estado, 'inactivos'))
    await flush()
    const url = ultimaUrl(fetchMock)
    expect(url.searchParams.get('activo')).toBe('false')
    expect(url.searchParams.get('search')).toBe('Pér')

    await act(async () => setValue(estado, 'activos'))
    await flush()
    expect(ultimaUrl(fetchMock).searchParams.get('activo')).toBe('true')
    await view.cleanup()
  })

  it('limpia la búsqueda y el filtro', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubApi(() => response(listado([juan])))
    const view = await mount('/admin/abonados?search=Juan&estado=inactivos')
    expect(view.container.querySelector<HTMLInputElement>('input[type="search"]')!.value).toBe('Juan')
    expect(view.container.querySelector<HTMLSelectElement>('select')!.value).toBe('inactivos')

    await act(async () => byText(view.container, 'button', 'Limpiar filtros')!.click())
    await flush()
    const url = ultimaUrl(fetchMock)
    expect(url.searchParams.has('search')).toBe(false)
    expect(url.searchParams.has('activo')).toBe(false)
    expect(view.container.querySelector<HTMLInputElement>('input[type="search"]')!.value).toBe('')
    expect(byText(view.container, 'button', 'Limpiar filtros')).toHaveProperty('disabled', true)
    await view.cleanup()
  })

  it('pagina con Anterior y Siguiente', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubApi((url) => {
      const page = Number(url.searchParams.get('page'))
      return response(listado([page === 2 ? luis : juan], { total: 12, page, totalPages: 2 }))
    })
    const view = await mount('/admin/abonados')
    expect(view.container.textContent).toContain('Mostrando 1–10 de 12 asociados')
    expect(view.container.textContent).toContain('Página 1 de 2')
    expect(byText(view.container, 'button', 'Anterior')).toHaveProperty('disabled', true)

    await act(async () => byText(view.container, 'button', 'Siguiente')!.click())
    await flush()
    expect(ultimaUrl(fetchMock).searchParams.get('page')).toBe('2')
    expect(view.container.textContent).toContain('Página 2 de 2')
    expect(view.container.textContent).toContain('Mostrando 11–12 de 12 asociados')
    expect(view.container.textContent).toContain('Luis Mora Castro')
    expect(byText(view.container, 'button', 'Siguiente')).toHaveProperty('disabled', true)

    await act(async () => byText(view.container, 'button', 'Anterior')!.click())
    await flush()
    expect(ultimaUrl(fetchMock).searchParams.get('page')).toBe('1')
    await view.cleanup()
  })

  it('vuelve a la primera página al cambiar la búsqueda', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubApi((url) =>
      response(listado([juan], { total: 12, page: Number(url.searchParams.get('page')), totalPages: 2 })),
    )
    const view = await mount('/admin/abonados?page=2')
    expect(ultimaUrl(fetchMock).searchParams.get('page')).toBe('2')
    await act(async () => setValue(view.container.querySelector<HTMLInputElement>('input[type="search"]')!, 'Ana'))
    await esperarDebounce()
    await flush()
    expect(ultimaUrl(fetchMock).searchParams.get('page')).toBe('1')
    await view.cleanup()
  })

  it('ajusta la página si queda fuera de rango', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubApi((url) => {
      const page = Number(url.searchParams.get('page'))
      return response(listado(page > 2 ? [] : [juan], { total: 12, page, totalPages: 2 }))
    })
    const view = await mount('/admin/abonados?page=9')
    await flush()
    expect(ultimaUrl(fetchMock).searchParams.get('page')).toBe('2')
    await view.cleanup()
  })

  it('distingue padrón vacío de búsqueda sin resultados', async () => {
    loginAsRole('Administradora')
    stubApi(() => response(listado([])))
    const vacio = await mount('/admin/abonados')
    expect(vacio.container.textContent).toContain('Aún no hay asociados')
    await vacio.cleanup()

    const sinResultados = await mount('/admin/abonados?search=Zzz')
    expect(sinResultados.container.textContent).toContain('Sin resultados')
    expect(sinResultados.container.textContent).toContain('Ningún asociado coincide')
    await sinResultados.cleanup()
  })

  it('muestra error de conexión y permite reintentar', async () => {
    loginAsRole('Administradora')
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce(response(listado([juan])))
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount('/admin/abonados')
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain('No fue posible conectar')
    await act(async () => byText(view.container, 'button', 'Reintentar')!.click())
    await flush()
    expect(view.container.textContent).toContain('Juan Pérez Rodríguez')
    await view.cleanup()
  })

  it('ante 403 muestra el permiso sin ofrecer reintentar', async () => {
    loginAsRole('Administradora')
    stubApi(() => response({ message: 'Forbidden resource' }, false, 403))
    const view = await mount('/admin/abonados')
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain('No tiene permisos para consultar asociados')
    expect(byText(view.container, 'button', 'Reintentar')).toBeUndefined()
    await view.cleanup()
  })

  it('cierra la sesión ante un 401', async () => {
    loginAsRole('Administradora')
    stubApi(() => response({ message: 'Unauthorized' }, false, 401))
    const view = await mount('/admin/abonados')
    expect(view.container.textContent).toContain('Pantalla de login')
    await view.cleanup()
  })

  it('muestra el detalle completo del asociado', async () => {
    loginAsRole('Secretaria')
    const fetchMock = stubApi(() => response(luis))
    const view = await mount('/admin/abonados/2')
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/asociados\/2$/)
    expect(view.container.querySelector('h1')?.textContent).toBe('Luis Mora Castro')
    const texto = view.container.textContent ?? ''
    expect(texto).toContain('3-0111-0222')
    expect(texto).toContain('luis@example.com')
    expect(texto).toContain('Inactivo')
    expect(texto).toContain('Fecha de registro')
    expect(texto).toContain('15 ene 2026')
    expect(texto).toContain('Fecha de inactivación')
    expect(texto).toContain('2 may 2026')
    expect(byText(view.container, 'a', 'Volver a Gestión de asociados')?.getAttribute('href')).toBe('/admin/abonados')
    await view.cleanup()
  })

  it('omite la fecha de inactivación de un asociado activo', async () => {
    loginAsRole('Administradora')
    stubApi(() => response(juan))
    const view = await mount('/admin/abonados/1')
    expect(view.container.textContent).toContain('Activo')
    expect(view.container.textContent).not.toContain('Fecha de inactivación')
    await view.cleanup()
  })

  it('abre el detalle desde el listado y vuelve conservando los filtros', async () => {
    loginAsRole('Administradora')
    stubApi((url) => (url.pathname.endsWith('/asociados/1') ? response(juan) : response(listado([juan]))))
    const view = await mount('/admin/abonados?search=Juan&estado=activos')
    await act(async () => byText(view.container, 'a', 'Ver')!.click())
    await flush()
    expect(view.container.querySelector('h1')?.textContent).toBe('Juan Pérez Rodríguez')
    expect(byText(view.container, 'a', 'Volver a Gestión de asociados')?.getAttribute('href')).toBe(
      '/admin/abonados?search=Juan&estado=activos',
    )
    await view.cleanup()
  })

  it('ante 404 en el detalle ofrece volver al listado sin reintentar', async () => {
    loginAsRole('Administradora')
    stubApi(() => response({ message: 'Not Found' }, false, 404))
    const view = await mount('/admin/abonados/99')
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain('no existe')
    expect(byText(view.container, 'button', 'Reintentar')).toBeUndefined()
    expect(byText(view.container, 'a', 'Volver al listado')?.getAttribute('href')).toBe('/admin/abonados')
    await view.cleanup()
  })

  it('no consulta el backend con un id inválido', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubApi(() => response(juan))
    const view = await mount('/admin/abonados/abc')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain('no existe')
    await view.cleanup()
  })

  it('carga el formulario de edición sin permitir modificar el estado', async () => {
    loginAsRole('Secretaria')
    const fetchMock = stubApi(() => response(juan))
    const view = await mount('/admin/abonados/1/editar')
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/asociados\/1$/)
    expect(view.container.querySelector('h1')?.textContent).toBe('Editar asociado')
    expect((view.container.querySelector('input[autocomplete="given-name"]') as HTMLInputElement).value).toBe('Juan')
    expect((view.container.querySelector('input[autocomplete="email"]') as HTMLInputElement).value).toBe('juan@example.com')
    expect(view.container.querySelector('[name="activo"]')).toBeNull()
    expect(view.container.textContent).toContain('El estado no se modifica desde este formulario')
    await view.cleanup()
  })

  it('no muestra el formulario de edición cuando el asociado no existe', async () => {
    loginAsRole('Administradora')
    stubApi(() => response({ message: 'Not Found' }, false, 404))
    const view = await mount('/admin/abonados/999/editar')
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain('no existe')
    expect(view.container.querySelector('form')).toBeNull()
    expect(view.container.querySelector('input')).toBeNull()
    await view.cleanup()
  })

  it('envía por PATCH únicamente los campos modificados', async () => {
    loginAsRole('Administradora')
    let almacenado = juan
    const fetchMock = stubApi((_url, init) => {
      if (init.method === 'PATCH') {
        almacenado = { ...almacenado, ...(JSON.parse(String(init.body)) as Partial<Asociado>) }
      }
      return response(almacenado)
    })
    const view = await mount('/admin/abonados/1/editar')
    const nombre = view.container.querySelector('input[autocomplete="given-name"]') as HTMLInputElement
    await act(async () => setValue(nombre, 'Juan Carlos'))
    await act(async () => {
      const guardar = byText(view.container, 'button', 'Guardar cambios') as HTMLButtonElement
      guardar.click()
      guardar.click()
    })
    await flush()
    const patchCall = fetchMock.mock.calls.find((call) => (call[1] as RequestInit | undefined)?.method === 'PATCH')
    expect(patchCall).toBeDefined()
    expect((patchCall?.[1] as RequestInit).body).toBe('{"nombre":"Juan Carlos"}')
    expect(view.container.textContent).toContain('Asociado actualizado correctamente.')
    expect(view.container.querySelector('h1')?.textContent).toBe('Juan Carlos Pérez Rodríguez')
    expect(fetchMock.mock.calls.filter((call) => (call[1] as RequestInit | undefined)?.method === 'PATCH')).toHaveLength(1)
    await view.cleanup()
  })

  it('mantiene el formulario y resalta la cédula ante un 409', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubApi((_url, init) =>
      init.method === 'PATCH'
        ? response({ message: 'La cédula ya está registrada' }, false, 409)
        : response(juan),
    )
    const view = await mount('/admin/abonados/1/editar')
    const cedula = view.container.querySelector('input[autocomplete="off"]') as HTMLInputElement
    await act(async () => setValue(cedula, '2-2222-2222'))
    await act(async () => (byText(view.container, 'button', 'Guardar cambios') as HTMLButtonElement).click())
    await flush()
    expect(fetchMock.mock.calls.filter((call) => (call[1] as RequestInit | undefined)?.method === 'PATCH')).toHaveLength(1)
    expect(view.container.querySelector('form')).not.toBeNull()
    expect(cedula.getAttribute('aria-invalid')).toBe('true')
    expect(view.container.textContent).toContain('Ya existe un asociado registrado con esta cédula.')
    await view.cleanup()
  })

  it('el detalle cierra la sesión ante un 401', async () => {
    loginAsRole('Administradora')
    stubApi(() => response({ message: 'Unauthorized' }, false, 401))
    const view = await mount('/admin/abonados/1')
    expect(view.container.textContent).toContain('Pantalla de login')
    await view.cleanup()
  })
})
