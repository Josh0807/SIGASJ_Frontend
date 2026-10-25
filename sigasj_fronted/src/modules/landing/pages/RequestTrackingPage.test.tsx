import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../../solicitudes-publicas/solicitudesPublicasApi'
import { MENSAJE_SEGUIMIENTO_NO_ENCONTRADO } from '../../solicitudes-publicas/seguimientoPublicoMessages'
import RequestTrackingPage from './RequestTrackingPage'

const flush = async () => {
  await act(async () => {
    await Promise.resolve()
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

const setInput = (el: HTMLInputElement, value: string) => {
  const proto = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set
  proto?.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

const respuestaOk = {
  codigoSeguimiento: 'SOL-2026-00001',
  estado: 'EN_REVISION' as const,
  fechaIngreso: '2026-10-20T14:30:00.000Z',
  tipoSolicitud: {
    nombre: 'Solicitud de Arreglo de Pago Domiciliar',
    slug: 'arreglo-pago',
  },
  historial: [
    {
      fecha: '2026-10-19T10:00:00.000Z',
      estadoAnterior: null,
      estadoNuevo: 'PENDIENTE' as const,
      observacionPublica: null,
    },
    {
      fecha: '2026-10-21T12:00:00.000Z',
      estadoAnterior: 'PENDIENTE' as const,
      estadoNuevo: 'EN_REVISION' as const,
      observacionPublica: 'Su solicitud está en revisión.',
    },
  ],
}

describe('RequestTrackingPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza código, identificación y Consultar', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <RequestTrackingPage />
        </MemoryRouter>,
      )
    })
    expect(host.textContent).toContain('Consultar estado de solicitud')
    expect(host.querySelector('#tracking-code')).toBeTruthy()
    expect(host.querySelector('#tracking-id')).toBeTruthy()
    expect(host.textContent).toContain('Consultar')
    expect(host.innerHTML).toContain('max-[640px]')
    const submit = host.querySelector('button[type="submit"]')
    expect(submit?.className).toContain('w-full')
    expect(submit?.className).not.toContain('max-w-md')
    root.unmount()
  })

  it('campos vacíos: errores locales y 0 requests', async () => {
    const spy = vi.spyOn(api, 'consultarSeguimientoPublico')
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <RequestTrackingPage />
        </MemoryRouter>,
      )
    })

    const form = host.querySelector('form') as HTMLFormElement
    await act(async () => {
      form.requestSubmit()
    })
    await flush()

    expect(spy).not.toHaveBeenCalled()
    expect(host.textContent).toContain('código de seguimiento es obligatorio')
    expect(host.textContent).toContain('identificación es obligatoria')
    root.unmount()
    host.remove()
  })

  it('formato inválido no envía request', async () => {
    const spy = vi.spyOn(api, 'consultarSeguimientoPublico')
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <RequestTrackingPage />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      setInput(host.querySelector('#tracking-code') as HTMLInputElement, 'XYZ')
      setInput(
        host.querySelector('#tracking-id') as HTMLInputElement,
        '1-1234-0567',
      )
    })
    await act(async () => {
      ;(host.querySelector('form') as HTMLFormElement).requestSubmit()
    })
    await flush()

    expect(spy).not.toHaveBeenCalled()
    expect(host.textContent).toMatch(/formato válido/i)
    root.unmount()
    host.remove()
  })

  it('submit válido: 1 request, loading, resultado e historial público', async () => {
    let resolveRequest!: (value: typeof respuestaOk) => void
    const spy = vi.spyOn(api, 'consultarSeguimientoPublico').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        }),
    )

    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <RequestTrackingPage />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      setInput(
        host.querySelector('#tracking-code') as HTMLInputElement,
        'sol-2026-00001',
      )
      setInput(
        host.querySelector('#tracking-id') as HTMLInputElement,
        '1-1234-0567',
      )
    })

    const submitBtn = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Consultar'),
    ) as HTMLButtonElement

    await act(async () => {
      submitBtn.click()
      submitBtn.click()
    })
    await flush()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toEqual({
      codigo: 'SOL-2026-00001',
      identificacion: '1-1234-0567',
    })
    expect(submitBtn.disabled).toBe(true)
    expect(host.textContent).toContain('Consultando')

    await act(async () => {
      resolveRequest(respuestaOk)
    })
    await flush()

    expect(host.textContent).toContain('En revisión')
    expect(host.textContent).toContain('SOL-2026-00001')
    expect(host.textContent).toContain('Solicitud registrada')
    expect(host.textContent).toContain('Pendiente → En revisión')
    expect(host.textContent).toContain('Su solicitud está en revisión.')
    expect(host.textContent).not.toContain('notaInterna')
    expect(host.textContent).not.toContain('1-1234-0567')
    root.unmount()
    host.remove()
  })

  it('404 genérico no revela cuál dato falló (código inexistente vs ID incorrecta)', async () => {
    const spy = vi
      .spyOn(api, 'consultarSeguimientoPublico')
      .mockRejectedValue(new Error('HTTP 404: No fue posible localizar'))

    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <RequestTrackingPage />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      setInput(
        host.querySelector('#tracking-code') as HTMLInputElement,
        'SOL-2026-00001',
      )
      setInput(
        host.querySelector('#tracking-id') as HTMLInputElement,
        '9-9999-9999',
      )
      ;(host.querySelector('form') as HTMLFormElement).requestSubmit()
    })
    await flush()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(host.textContent).toContain(MENSAJE_SEGUIMIENTO_NO_ENCONTRADO)
    expect(host.textContent).not.toMatch(/identificaci[oó]n incorrecta/i)
    expect(host.textContent).not.toMatch(/c[oó]digo no existe/i)
    expect(host.textContent).not.toMatch(/c[oó]digo s[ií] existe/i)
    root.unmount()
    host.remove()
  })

  it('válida → inválida: limpia resultado anterior', async () => {
    const spy = vi
      .spyOn(api, 'consultarSeguimientoPublico')
      .mockResolvedValueOnce(respuestaOk)
      .mockRejectedValueOnce(new Error('HTTP 404: genérico'))

    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <RequestTrackingPage />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      setInput(
        host.querySelector('#tracking-code') as HTMLInputElement,
        'SOL-2026-00001',
      )
      setInput(
        host.querySelector('#tracking-id') as HTMLInputElement,
        '1-1234-0567',
      )
      ;(host.querySelector('form') as HTMLFormElement).requestSubmit()
    })
    await flush()
    expect(host.textContent).toContain('En revisión')

    await act(async () => {
      setInput(
        host.querySelector('#tracking-id') as HTMLInputElement,
        '9-9999-9999',
      )
      ;(host.querySelector('form') as HTMLFormElement).requestSubmit()
    })
    await flush()

    expect(spy).toHaveBeenCalledTimes(2)
    expect(host.textContent).toContain(MENSAJE_SEGUIMIENTO_NO_ENCONTRADO)
    expect(host.textContent).not.toContain('Su solicitud está en revisión.')
    root.unmount()
    host.remove()
  })

  it('500 muestra mensaje amigable sin detalle técnico', async () => {
    vi.spyOn(api, 'consultarSeguimientoPublico').mockRejectedValue(
      new Error('HTTP 500: stack trace SQL'),
    )
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <RequestTrackingPage />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      setInput(
        host.querySelector('#tracking-code') as HTMLInputElement,
        'SOL-2026-00001',
      )
      setInput(
        host.querySelector('#tracking-id') as HTMLInputElement,
        '1-1234-0567',
      )
      ;(host.querySelector('form') as HTMLFormElement).requestSubmit()
    })
    await flush()

    expect(host.textContent).toContain(
      'No fue posible realizar la consulta en este momento',
    )
    expect(host.textContent).not.toContain('stack')
    expect(host.textContent).not.toContain('SQL')
    root.unmount()
    host.remove()
  })

  it('precarga el código recibido desde la confirmación', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/solicitudes/seguimiento?codigo=SOL-2026-A82K91']}>
        <RequestTrackingPage />
      </MemoryRouter>,
    )
    expect(markup).toContain('value="SOL-2026-A82K91"')
  })
})
