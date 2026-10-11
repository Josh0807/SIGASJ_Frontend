import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loginAsRole } from '../../test/authTestHelpers'
import { AuthProvider } from '../auth/components/AuthContext'
import RecursosHumanosRoutes from './RecursosHumanosRoutes'
import type { BalanceVacaciones, Colaborador, MovimientoVacaciones } from './types'

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

const resumenJuan = {
  id: 1,
  nombre: 'Juan',
  apellidos: 'Pérez',
  cedula: '1-1111-1111',
  cargo: 'Fontanero',
  activo: true,
}

const balanceJuan: BalanceVacaciones = {
  colaboradorId: 1,
  colaborador: resumenJuan,
  diasAcumulados: 20,
  diasDisfrutados: 8,
  diasDisponibles: 12,
  totalMovimientos: 2,
}

const movimientos: MovimientoVacaciones[] = [
  {
    id: 2,
    colaboradorId: 1,
    tipo: 'DISFRUTADO',
    cantidadDias: 3,
    fecha: '2026-08-15',
    observaciones: 'Semana Santa',
    colaborador: resumenJuan,
    createdAt: '2026-08-15T12:00:00.000Z',
  },
  {
    id: 1,
    colaboradorId: 1,
    tipo: 'ACUMULADO',
    cantidadDias: 2,
    fecha: '2026-08-01',
    observaciones: null,
    colaborador: resumenJuan,
    createdAt: '2026-08-01T12:00:00.000Z',
  },
]

const response = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    text: async () => (ok ? '' : JSON.stringify(body)),
    json: async () => body,
  }) as Response

const listado = <T,>(data: T[], extra: Partial<{ total: number; page: number; totalPages: number }> = {}) => ({
  data,
  total: extra.total ?? data.length,
  page: extra.page ?? 1,
  limit: 10,
  totalPages: extra.totalPages ?? (data.length ? 1 : 0),
})

type Handler = (url: URL, init: RequestInit) => Response | Promise<Response>

function stubApi(handler: Handler) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init: RequestInit = {}) =>
    Promise.resolve(handler(new URL(String(input), 'http://localhost'), init)),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** API simulada con balance e historial coherentes con los movimientos registrados. */
function stubVacacionesApi(opciones: { rechazarPost?: { status: number; message: unknown } } = {}) {
  const registrados: MovimientoVacaciones[] = [...movimientos]
  let balance: BalanceVacaciones = { ...balanceJuan }
  const fetchMock = stubApi((url, init) => {
    if (url.pathname.endsWith('/rrhh/vacaciones/movimientos') && init.method === 'POST') {
      if (opciones.rechazarPost) {
        return response({ statusCode: opciones.rechazarPost.status, message: opciones.rechazarPost.message }, false, opciones.rechazarPost.status)
      }
      const body = JSON.parse(String(init.body)) as MovimientoVacaciones
      const creado: MovimientoVacaciones = { ...body, id: 99, colaborador: resumenJuan, createdAt: '2026-09-01T12:00:00.000Z' }
      registrados.unshift(creado)
      const delta = creado.tipo === 'ACUMULADO' ? creado.cantidadDias : -creado.cantidadDias
      balance = {
        ...balance,
        diasAcumulados: balance.diasAcumulados + (creado.tipo === 'ACUMULADO' ? creado.cantidadDias : 0),
        diasDisfrutados: balance.diasDisfrutados + (creado.tipo === 'DISFRUTADO' ? creado.cantidadDias : 0),
        diasDisponibles: balance.diasDisponibles + delta,
        totalMovimientos: balance.totalMovimientos + 1,
      }
      return response(creado, true, 201)
    }
    if (/\/rrhh\/vacaciones\/colaboradores\/\d+\/balance$/.test(url.pathname)) {
      return url.pathname.includes('/colaboradores/1/')
        ? response(balance)
        : response({ statusCode: 404, message: 'El colaborador con id 7 no existe' }, false, 404)
    }
    if (url.pathname.endsWith('/rrhh/vacaciones/movimientos')) {
      const page = Number(url.searchParams.get('page') ?? '1')
      const inicio = (page - 1) * 10
      return response(
        listado(registrados.slice(inicio, inicio + 10), {
          total: registrados.length,
          page,
          totalPages: Math.ceil(registrados.length / 10),
        }),
      )
    }
    return response(listado([juan]))
  })
  return { fetchMock, registrados }
}

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
            <Route path="/admin/lecturas/*" element={<RecursosHumanosRoutes />} />
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

function setValue(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) {
  const prototype =
    element instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value)
  element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
}

const byText = (container: ParentNode, selector: string, text: string) =>
  Array.from(container.querySelectorAll<HTMLElement>(selector)).find((node) => node.textContent?.trim() === text)

/** Texto legible de una tarjeta de saldo: "Disponibles 12 días". */
const tarjeta = (container: ParentNode, label: string) => {
  const dt = Array.from(container.querySelectorAll<HTMLElement>('dt')).find(
    (node) => node.textContent?.trim() === label,
  )
  const dd = dt?.nextElementSibling
  if (!dt || !dd) return undefined
  return [dt.textContent, ...Array.from(dd.children).map((n) => n.textContent)]
    .map((t) => t?.trim())
    .filter(Boolean)
    .join(' ')
}

const q = <T extends Element>(container: ParentNode, selector: string) => container.querySelector<T>(selector)!

async function llenarFormulario(container: ParentNode, tipo: 'ACUMULADO' | 'DISFRUTADO', dias: string, fecha: string) {
  await act(async () => q<HTMLInputElement>(container, `input[type="radio"][value="${tipo}"]`).click())
  await act(async () => setValue(q<HTMLInputElement>(container, 'input[type="number"]'), dias))
  await act(async () => setValue(q<HTMLInputElement>(container, 'form input[type="date"]'), fecha))
}

describe('Recursos Humanos: vacaciones', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('aparece en el subnav de Recursos Humanos', async () => {
    loginAsRole('Administradora')
    stubVacacionesApi()
    const view = await mount('/admin/lecturas')
    expect(byText(view.container, 'nav a', 'Vacaciones')?.getAttribute('href')).toBe('/admin/lecturas/vacaciones')
    await view.cleanup()
  })

  it('pide seleccionar un colaborador y no consulta saldo hasta hacerlo', async () => {
    loginAsRole('Administradora')
    const { fetchMock } = stubVacacionesApi()
    const view = await mount('/admin/lecturas/vacaciones')
    expect(view.container.textContent).toContain('Vacaciones del personal')
    expect(view.container.textContent).toContain('Seleccione un colaborador')
    const rutas = fetchMock.mock.calls.map(([url]) => new URL(String(url), 'http://localhost').pathname)
    expect(rutas.some((ruta) => ruta.includes('/rrhh/vacaciones'))).toBe(false)

    await act(async () => setValue(q<HTMLSelectElement>(view.container, 'select'), '1'))
    await flush()
    expect(view.container.textContent).toContain('Saldo de vacaciones')
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/rrhh/vacaciones/colaboradores/1/balance'))).toBe(true)
    await view.cleanup()
  })

  it('muestra acumulados, disfrutados y disponibles del colaborador', async () => {
    loginAsRole('Administradora')
    stubVacacionesApi()
    const view = await mount('/admin/lecturas/vacaciones?colaboradorId=1')
    expect(view.container.querySelector('h2')?.textContent).toContain('Juan Pérez')
    expect(tarjeta(view.container, 'Acumulados')).toBe('Acumulados 20 días')
    expect(tarjeta(view.container, 'Disfrutados')).toBe('Disfrutados 8 días')
    expect(tarjeta(view.container, 'Disponibles')).toBe('Disponibles 12 días')
    expect(view.container.textContent).toContain('Calculado a partir de 2 movimientos')
    await view.cleanup()
  })

  it('muestra el historial Fecha | Tipo | Días con signo', async () => {
    loginAsRole('Administradora')
    stubVacacionesApi()
    const view = await mount('/admin/lecturas/vacaciones?colaboradorId=1')
    const headers = Array.from(view.container.querySelectorAll('th')).map((th) => th.textContent)
    expect(headers).toEqual(['Fecha', 'Tipo', 'Días', 'Observaciones'])
    const filas = Array.from(view.container.querySelectorAll('tbody tr')).map((tr) =>
      tr.textContent?.replace(/\s+/g, ' ').trim(),
    )
    expect(filas[0]).toContain('15/08/2026')
    expect(filas[0]).toContain('Disfrutado')
    expect(filas[0]).toContain('-3')
    expect(filas[0]).toContain('Semana Santa')
    expect(filas[1]).toContain('01/08/2026')
    expect(filas[1]).toContain('Acumulado')
    expect(filas[1]).toContain('+2')
    expect(view.container.textContent).toContain('Mostrando 1–2 de 2 movimientos')
    await view.cleanup()
  })

  it('registra un movimiento acumulado y refresca saldo e historial desde el servidor', async () => {
    loginAsRole('Administradora')
    const { fetchMock } = stubVacacionesApi()
    const view = await mount('/admin/lecturas/vacaciones?colaboradorId=1')
    await llenarFormulario(view.container, 'ACUMULADO', '5', '2026-09-01')
    await act(async () => setValue(q<HTMLTextAreaElement>(view.container, 'textarea'), 'Periodo 2026'))
    await act(async () => q<HTMLFormElement>(view.container, 'form').requestSubmit())
    await flush()

    const post = fetchMock.mock.calls.find(([, init]) => (init as RequestInit).method === 'POST')!
    expect(JSON.parse(String((post[1] as RequestInit).body))).toEqual({
      colaboradorId: 1,
      tipo: 'ACUMULADO',
      cantidadDias: 5,
      fecha: '2026-09-01',
      observaciones: 'Periodo 2026',
    })
    expect(view.container.querySelector('[role="status"]')?.textContent).toContain('Se registraron 5 días acumulados')
    expect(tarjeta(view.container, 'Acumulados')).toBe('Acumulados 25 días')
    expect(tarjeta(view.container, 'Disponibles')).toBe('Disponibles 17 días')
    expect(view.container.querySelector('tbody tr')?.textContent).toContain('+5')
    expect(q<HTMLInputElement>(view.container, 'input[type="number"]').value).toBe('')

    const balances = fetchMock.mock.calls.filter(([url]) => String(url).includes('/balance')).length
    expect(balances).toBeGreaterThanOrEqual(2)
    await view.cleanup()
  })

  it('registra un movimiento disfrutado y descuenta del saldo', async () => {
    loginAsRole('Administradora')
    stubVacacionesApi()
    const view = await mount('/admin/lecturas/vacaciones?colaboradorId=1')
    await llenarFormulario(view.container, 'DISFRUTADO', '2', '2026-09-10')
    await act(async () => q<HTMLFormElement>(view.container, 'form').requestSubmit())
    await flush()
    expect(view.container.querySelector('[role="status"]')?.textContent).toContain('Se registraron 2 días disfrutados')
    expect(tarjeta(view.container, 'Disfrutados')).toBe('Disfrutados 10 días')
    expect(tarjeta(view.container, 'Disponibles')).toBe('Disponibles 10 días')
    expect(view.container.querySelector('tbody tr')?.textContent).toContain('-2')
    await view.cleanup()
  })

  it('bloquea en el cliente disfrutar más días que los disponibles', async () => {
    loginAsRole('Administradora')
    const { fetchMock } = stubVacacionesApi()
    const view = await mount('/admin/lecturas/vacaciones?colaboradorId=1')
    await llenarFormulario(view.container, 'DISFRUTADO', '13', '2026-09-10')
    await act(async () => q<HTMLFormElement>(view.container, 'form').requestSubmit())
    await flush()
    expect(view.container.textContent).toContain('Solo hay 12 días disponibles.')
    expect(fetchMock.mock.calls.some(([, init]) => (init as RequestInit).method === 'POST')).toBe(false)
    expect(tarjeta(view.container, 'Disponibles')).toBe('Disponibles 12 días')
    await view.cleanup()
  })

  it('valida campos obligatorios sin llamar al backend', async () => {
    loginAsRole('Administradora')
    const { fetchMock } = stubVacacionesApi()
    const view = await mount('/admin/lecturas/vacaciones?colaboradorId=1')
    await act(async () => q<HTMLFormElement>(view.container, 'form').requestSubmit())
    await flush()
    expect(view.container.textContent).toContain('Seleccione el tipo de movimiento.')
    expect(view.container.textContent).toContain('Indique la cantidad de días.')
    expect(view.container.textContent).toContain('La fecha es obligatoria.')
    expect(fetchMock.mock.calls.some(([, init]) => (init as RequestInit).method === 'POST')).toBe(false)
    await view.cleanup()
  })

  it('muestra el error del backend cuando rechaza el movimiento', async () => {
    loginAsRole('Administradora')
    stubVacacionesApi({
      rechazarPost: {
        status: 400,
        message: 'El colaborador no tiene saldo suficiente de vacaciones: dispone de 1 día(s) y se intentan disfrutar 2',
      },
    })
    const view = await mount('/admin/lecturas/vacaciones?colaboradorId=1')
    await llenarFormulario(view.container, 'DISFRUTADO', '2', '2026-09-10')
    await act(async () => q<HTMLFormElement>(view.container, 'form').requestSubmit())
    await flush()
    const alerta = Array.from(view.container.querySelectorAll('[role="alert"]')).map((n) => n.textContent).join(' ')
    expect(alerta).toContain('saldo suficiente')
    expect(tarjeta(view.container, 'Disponibles')).toBe('Disponibles 12 días')
    await view.cleanup()
  })

  it('pagina el historial', async () => {
    loginAsRole('Administradora')
    const muchos: MovimientoVacaciones[] = Array.from({ length: 12 }, (_, i) => ({
      id: 100 + i,
      colaboradorId: 1,
      tipo: 'ACUMULADO',
      cantidadDias: 1,
      fecha: `2026-01-${String(i + 1).padStart(2, '0')}`,
      observaciones: null,
      colaborador: resumenJuan,
      createdAt: '2026-01-01T12:00:00.000Z',
    }))
    const fetchMock = stubApi((url) => {
      if (url.pathname.includes('/balance')) return response(balanceJuan)
      if (url.pathname.endsWith('/rrhh/vacaciones/movimientos')) {
        const page = Number(url.searchParams.get('page') ?? '1')
        return response(listado(muchos.slice((page - 1) * 10, page * 10), { total: 12, page, totalPages: 2 }))
      }
      return response(listado([juan]))
    })
    const view = await mount('/admin/lecturas/vacaciones?colaboradorId=1')
    expect(view.container.textContent).toContain('Mostrando 1–10 de 12 movimientos')
    expect(view.container.textContent).toContain('Página 1 de 2')

    await act(async () => byText(view.container, 'button', 'Siguiente')!.click())
    await flush()
    const ultima = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')
    expect(ultima.searchParams.get('page')).toBe('2')
    expect(ultima.searchParams.get('colaboradorId')).toBe('1')
    expect(view.container.textContent).toContain('Mostrando 11–12 de 12 movimientos')
    expect(view.container.textContent).toContain('Página 2 de 2')
    await view.cleanup()
  })

  it('muestra error y permite reintentar si falla el saldo', async () => {
    loginAsRole('Administradora')
    let fallar = true
    stubApi((url) => {
      if (url.pathname.includes('/balance')) {
        if (fallar) throw new Error('Failed to fetch')
        return response(balanceJuan)
      }
      if (url.pathname.endsWith('/rrhh/vacaciones/movimientos')) return response(listado(movimientos))
      return response(listado([juan]))
    })
    const view = await mount('/admin/lecturas/vacaciones?colaboradorId=1')
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain('No fue posible conectar')
    fallar = false
    await act(async () => byText(view.container, 'button', 'Reintentar')!.click())
    await flush()
    expect(tarjeta(view.container, 'Disponibles')).toBe('Disponibles 12 días')
    await view.cleanup()
  })

  it('informa cuando el colaborador no existe', async () => {
    loginAsRole('Administradora')
    stubVacacionesApi()
    const view = await mount('/admin/lecturas/vacaciones?colaboradorId=7')
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain('no existe')
    expect(byText(view.container, 'button', 'Reintentar')).toBeUndefined()
    await view.cleanup()
  })

  it('redirige al login si la sesión expiró', async () => {
    loginAsRole('Administradora')
    stubApi((url) => {
      if (url.pathname.includes('/balance')) {
        return response({ statusCode: 401, message: 'Unauthorized' }, false, 401)
      }
      if (url.pathname.endsWith('/rrhh/vacaciones/movimientos')) return response(listado(movimientos))
      return response(listado([juan]))
    })
    const view = await mount('/admin/lecturas/vacaciones?colaboradorId=1')
    expect(view.container.textContent).toContain('Pantalla de login')
    await view.cleanup()
  })
})
