import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loginAsRole } from '../../test/authTestHelpers'
import { AuthProvider } from '../auth/components/AuthContext'
import RecursosHumanosRoutes from './RecursosHumanosRoutes'
import type { Colaborador, PermisoColaborador } from './types'

const juan: Colaborador = {
  id: 1,
  nombre: 'Juan',
  apellidos: 'Pérez',
  cedula: '1-1111-1111',
  correoElectronico: 'juan@example.com',
  cargo: 'Fontanero',
  activo: true,
  usuarioId: null,
  usuario: null,
  createdAt: '2026-01-01T12:00:00.000Z',
  updatedAt: '2026-01-02T12:00:00.000Z',
}

const response = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    text: async () => (ok ? '' : JSON.stringify(body)),
    json: async () => body,
  }) as Response

const listado = (data: Colaborador[]) => ({ data, total: data.length, page: 1, limit: 10, totalPages: data.length ? 1 : 0 })

type Handler = (url: URL, init: RequestInit) => Response | Promise<Response>

function stubApi(handler: Handler) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init: RequestInit = {}) =>
    Promise.resolve(handler(new URL(String(input), 'http://localhost'), init)),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const flush = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)) })

async function mount(path: string, extra?: ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <Routes>
            <Route path="/admin/lecturas/*" element={<RecursosHumanosRoutes />} />
            <Route path="/login" element={<p>Pantalla de login</p>} />
          </Routes>
          {extra}
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

describe('Recursos Humanos: colaboradores', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('muestra carga y luego la tabla Cédula | Colaborador | Cargo | Estado | Acción', async () => {
    loginAsRole('Administradora')
    let resolver!: (value: Response) => void
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { resolver = resolve })))
    const view = await mount('/admin/lecturas')
    expect(view.container.textContent).toContain('Cargando colaboradores')

    await act(async () => resolver(response(listado([juan]))))
    const headers = Array.from(view.container.querySelectorAll('th')).map((th) => th.textContent)
    expect(headers).toEqual(['Cédula', 'Colaborador', 'Cargo', 'Estado', 'Acción'])
    const fila = view.container.querySelector('tbody tr')
    expect(fila?.textContent).toContain('1-1111-1111')
    expect(fila?.textContent).toContain('Juan Pérez')
    expect(fila?.textContent).toContain('Fontanero')
    expect(fila?.textContent).toContain('Activo')
    expect(byText(fila!, 'a', 'Ver')?.getAttribute('href')).toBe('/admin/lecturas/1')
    await view.cleanup()
  })

  it('envía búsqueda y filtro de estado al backend', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubApi(() => response(listado([juan])))
    const view = await mount('/admin/lecturas')

    const buscar = view.container.querySelector<HTMLInputElement>('input[type="search"]')!
    await act(async () => setValue(buscar, 'juan'))
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 400)) })
    await flush()
    const ultimaBusqueda = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')
    expect(ultimaBusqueda.searchParams.get('search')).toBe('juan')

    const estado = view.container.querySelector<HTMLSelectElement>('select')!
    await act(async () => setValue(estado, 'inactivos'))
    await flush()
    const ultimoEstado = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')
    expect(ultimoEstado.searchParams.get('activo')).toBe('false')
    expect(ultimoEstado.searchParams.get('search')).toBe('juan')
    await view.cleanup()
  })

  it('muestra vacío, error y permite reintentar', async () => {
    loginAsRole('Administradora')
    stubApi(() => response(listado([])))
    const vacio = await mount('/admin/lecturas')
    expect(vacio.container.textContent).toContain('Aún no hay colaboradores')
    await vacio.cleanup()

    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce(response(listado([juan])))
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount('/admin/lecturas')
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain('No fue posible conectar')
    await act(async () => byText(view.container, 'button', 'Reintentar')!.click())
    await flush()
    expect(view.container.textContent).toContain('Juan Pérez')
    await view.cleanup()
  })

  it('inactiva un colaborador tras confirmar', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubApi((url, init) =>
      url.pathname.endsWith('/estado')
        ? response({ ...juan, activo: false })
        : init.method ? response({}) : response(listado([juan])),
    )
    const view = await mount('/admin/lecturas')
    await act(async () => byText(view.container, 'tbody button', 'Inactivar')!.click())
    const dialog = document.querySelector('[role="alertdialog"]')!
    expect(dialog.textContent).toContain('Juan Pérez quedará inactivo')
    await act(async () => byText(dialog, 'button', 'Inactivar')!.click())
    await flush()

    const llamada = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/rrhh/colaboradores/1/estado'))
    expect(llamada?.[1]).toMatchObject({ method: 'PATCH', body: JSON.stringify({ activo: false }) })
    expect(view.container.querySelector('tbody tr')?.textContent).toContain('Inactivo')
    expect(view.container.querySelector('[role="status"]')?.textContent).toContain('quedó inactivo')
    await view.cleanup()
  })

  it('valida y registra un colaborador nuevo', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubApi((url, init) => {
      if (url.pathname.endsWith('/usuarios')) return response({ data: [] })
      if (init.method === 'POST') return response({ ...juan, id: 9 }, true, 201)
      return response(listado([juan]))
    })
    const view = await mount('/admin/lecturas/nuevo')
    const form = view.container.querySelector('form')!

    await act(async () => form.requestSubmit())
    expect(view.container.textContent).toContain('Revise los campos señalados.')
    expect(view.container.textContent).toContain('La cédula es obligatoria.')

    const input = (name: string) => view.container.querySelector<HTMLInputElement>(`input[autocomplete="${name}"]`)!
    await act(async () => {
      setValue(input('given-name'), 'Juan')
      setValue(input('family-name'), 'Pérez')
      setValue(input('off'), '1-1111-1111')
      setValue(input('email'), 'juan@example.com')
      setValue(input('organization-title'), 'Fontanero')
    })
    await act(async () => form.requestSubmit())
    await flush()

    const post = fetchMock.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'POST')
    expect(JSON.parse(String((post?.[1] as RequestInit).body))).toEqual({
      nombre: 'Juan',
      apellidos: 'Pérez',
      cedula: '1-1111-1111',
      correoElectronico: 'juan@example.com',
      cargo: 'Fontanero',
    })
    expect(view.container.textContent).toContain('Colaborador registrado correctamente.')
    await view.cleanup()
  })

  it('muestra el conflicto de cédula duplicada', async () => {
    loginAsRole('Administradora')
    stubApi((url, init) => {
      if (url.pathname.endsWith('/usuarios')) return response({ data: [] })
      if (init.method === 'POST') {
        return response({ message: 'Ya existe un colaborador con la cédula 1-1111-1111' }, false, 409)
      }
      return response(listado([]))
    })
    const view = await mount('/admin/lecturas/nuevo')
    const input = (name: string) => view.container.querySelector<HTMLInputElement>(`input[autocomplete="${name}"]`)!
    await act(async () => {
      setValue(input('given-name'), 'Juan')
      setValue(input('family-name'), 'Pérez')
      setValue(input('off'), '1-1111-1111')
      setValue(input('email'), 'juan@example.com')
      setValue(input('organization-title'), 'Fontanero')
    })
    await act(async () => view.container.querySelector('form')!.requestSubmit())
    await flush()
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain('Ya existe un colaborador')
    await view.cleanup()
  })

  it('edita un colaborador existente y vuelve al detalle', async () => {
    loginAsRole('Administradora')
    let actual = juan
    const fetchMock = stubApi((url, init) => {
      if (url.pathname.endsWith('/usuarios')) return response({ data: [] })
      if (init.method === 'PATCH') {
        actual = { ...juan, ...JSON.parse(String(init.body)) }
        return response(actual)
      }
      return response(actual)
    })
    const view = await mount('/admin/lecturas/1/editar')
    const cargo = view.container.querySelector<HTMLInputElement>('input[autocomplete="organization-title"]')!
    expect(cargo.value).toBe('Fontanero')
    await act(async () => setValue(cargo, 'Ayudante de fontanero'))
    await act(async () => view.container.querySelector('form')!.requestSubmit())
    await flush()

    const patch = fetchMock.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'PATCH')
    expect(JSON.parse(String((patch?.[1] as RequestInit).body))).toMatchObject({
      cargo: 'Ayudante de fontanero',
      usuarioId: null,
    })
    expect(view.container.textContent).toContain('Colaborador actualizado correctamente.')
    expect(view.container.querySelector('h1')?.textContent).toBe('Juan Pérez')
    await view.cleanup()
  })

  it('muestra el detalle y el 404 de un colaborador inexistente', async () => {
    loginAsRole('Administradora')
    stubApi((url) =>
      url.pathname.endsWith('/1') ? response(juan) : response({ message: 'Not Found' }, false, 404),
    )
    const view = await mount('/admin/lecturas/1')
    expect(view.container.textContent).toContain('juan@example.com')
    expect(view.container.textContent).toContain('Sin cuenta vinculada')
    expect(byText(view.container, 'a', 'Editar')?.getAttribute('href')).toBe('/admin/lecturas/1/editar')
    await view.cleanup()

    const missing = await mount('/admin/lecturas/99')
    expect(missing.container.querySelector('[role="alert"]')?.textContent).toContain('no existe')
    await missing.cleanup()
  })

  it('no duplica el registro si se envía el formulario dos veces seguidas', async () => {
    loginAsRole('Administradora')
    let resolverPost!: (value: Response) => void
    const fetchMock = vi.fn((input: RequestInfo | URL, init: RequestInit = {}) => {
      const url = String(input)
      if (url.endsWith('/usuarios')) return Promise.resolve(response({ data: [] }))
      if (init.method === 'POST') return new Promise<Response>((resolve) => { resolverPost = resolve })
      return Promise.resolve(response(listado([juan])))
    })
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount('/admin/lecturas/nuevo')
    const input = (name: string) => view.container.querySelector<HTMLInputElement>(`input[autocomplete="${name}"]`)!
    await act(async () => {
      setValue(input('given-name'), 'Juan')
      setValue(input('family-name'), 'Pérez')
      setValue(input('off'), '1-1111-1111')
      setValue(input('email'), 'juan@example.com')
      setValue(input('organization-title'), 'Fontanero')
    })
    const form = view.container.querySelector('form')!
    await act(async () => {
      form.requestSubmit()
      form.requestSubmit()
    })
    expect(view.container.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true)
    await act(async () => resolverPost(response({ ...juan, id: 9 }, true, 201)))
    await flush()
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(1)
    await view.cleanup()
  })

  it('no duplica el cambio de estado ante dos confirmaciones', async () => {
    loginAsRole('Administradora')
    let resolverPatch!: (value: Response) => void
    const fetchMock = vi.fn((input: RequestInfo | URL) =>
      String(input).endsWith('/estado')
        ? new Promise<Response>((resolve) => { resolverPatch = resolve })
        : Promise.resolve(response(listado([juan]))),
    )
    vi.stubGlobal('fetch', fetchMock)
    const view = await mount('/admin/lecturas')
    await act(async () => byText(view.container, 'tbody button', 'Inactivar')!.click())
    const confirmar = byText(document.querySelector('[role="alertdialog"]')!, 'button', 'Inactivar')!
    await act(async () => {
      confirmar.click()
      confirmar.click()
    })
    const botonFila = view.container.querySelector<HTMLButtonElement>('tbody button')!
    expect(botonFila.disabled).toBe(true)
    await act(async () => botonFila.click())
    expect(document.querySelector('[role="alertdialog"]')).toBeNull()
    await act(async () => resolverPatch(response({ ...juan, activo: false })))
    await flush()
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/estado'))).toHaveLength(1)
    await view.cleanup()
  })

  it('ante 403 muestra el permiso sin ofrecer reintentar', async () => {
    loginAsRole('Administradora')
    stubApi(() => response({ message: 'Forbidden resource' }, false, 403))
    const view = await mount('/admin/lecturas')
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain('No tiene permisos')
    expect(byText(view.container, 'button', 'Reintentar')).toBeUndefined()
    await view.cleanup()
  })

  it('ante 404 en el detalle ofrece volver al listado', async () => {
    loginAsRole('Administradora')
    stubApi(() => response({ message: 'Not Found' }, false, 404))
    const view = await mount('/admin/lecturas/99')
    expect(byText(view.container, 'button', 'Reintentar')).toBeUndefined()
    expect(byText(view.container, 'a', 'Volver al listado')?.getAttribute('href')).toBe('/admin/lecturas')
    await view.cleanup()

    const editar = await mount('/admin/lecturas/99/editar')
    expect(editar.container.querySelector('[role="alert"]')?.textContent).toContain('no existe')
    expect(editar.container.querySelector('form')).toBeNull()
    await editar.cleanup()
  })

  it('cierra la sesión ante un 401', async () => {
    loginAsRole('Administradora')
    stubApi(() => response({ message: 'Unauthorized' }, false, 401))
    const view = await mount('/admin/lecturas')
    expect(view.container.textContent).toContain('Pantalla de login')
    await view.cleanup()
  })
})

const permiso: PermisoColaborador = {
  id: 8,
  colaboradorId: 1,
  fechaInicio: '2026-10-12',
  fechaFin: '2026-10-14',
  motivo: 'Cita médica',
  observaciones: null,
  colaborador: {
    id: 1,
    nombre: 'Juan',
    apellidos: 'Pérez',
    cedula: '1-1111-1111',
    cargo: 'Fontanero',
    activo: true,
  },
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-01T12:00:00.000Z',
}

const listadoPermisos = (data: PermisoColaborador[]) => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: data.length ? 1 : 0,
})

describe('Recursos Humanos: permisos', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('lista permisos con colaborador, fechas y motivo', async () => {
    loginAsRole('Administradora')
    stubApi((url) => {
      if (url.pathname.includes('/rrhh/permisos')) return response(listadoPermisos([permiso]))
      return response(listado([juan]))
    })
    const view = await mount('/admin/lecturas/permisos')
    expect(view.container.textContent).toContain('Permisos del personal')
    const headers = Array.from(view.container.querySelectorAll('th')).map((th) => th.textContent)
    expect(headers).toEqual(['Colaborador', 'Inicio', 'Fin', 'Motivo', 'Acción'])
    expect(view.container.textContent).toContain('Juan Pérez')
    expect(view.container.textContent).toContain('Cita médica')
    expect(byText(view.container, 'a', 'Ver')?.getAttribute('href')).toBe('/admin/lecturas/permisos/8')
    await view.cleanup()
  })

  it('envía filtros de colaborador y fechas al backend', async () => {
    loginAsRole('Administradora')
    const fetchMock = stubApi((url) => {
      if (url.pathname.includes('/rrhh/permisos')) return response(listadoPermisos([permiso]))
      return response(listado([juan]))
    })
    const view = await mount('/admin/lecturas/permisos')
    const colaborador = view.container.querySelector<HTMLSelectElement>('select')!
    await act(async () => setValue(colaborador, '1'))
    await flush()
    const conColaborador = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')
    expect(conColaborador.searchParams.get('colaboradorId')).toBe('1')

    const fechas = view.container.querySelectorAll<HTMLInputElement>('input[type="date"]')
    await act(async () => setValue(fechas[0], '2026-10-01'))
    await flush()
    const conFecha = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')
    expect(conFecha.searchParams.get('fechaInicio')).toBe('2026-10-01')
    await view.cleanup()
  })

  it('registra un permiso y muestra el aviso de éxito', async () => {
    loginAsRole('Administradora')
    stubApi((url, init) => {
      if (url.pathname.endsWith('/rrhh/permisos') && init.method === 'POST') {
        return response(permiso, true, 201)
      }
      if (url.pathname.includes('/rrhh/permisos')) return response(listadoPermisos([]))
      return response(listado([juan]))
    })
    const view = await mount('/admin/lecturas/permisos/nuevo')
    await act(async () => setValue(view.container.querySelector('select')!, '1'))
    const fechas = view.container.querySelectorAll<HTMLInputElement>('input[type="date"]')
    await act(async () => setValue(fechas[0], '2026-10-12'))
    await act(async () => setValue(fechas[1], '2026-10-14'))
    await act(async () =>
      setValue(view.container.querySelector<HTMLInputElement>('input[placeholder^="Ej."]')!, 'Cita médica'),
    )
    await act(async () => view.container.querySelector('form')!.requestSubmit())
    await flush()
    expect(view.container.textContent).toContain('Permiso registrado correctamente')
    await view.cleanup()
  })
})
