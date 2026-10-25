import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { createRoot } from 'react-dom/client'
import SolicitudHistorialTimeline from './SolicitudHistorialTimeline'
import type { HistorialSolicitudEvento } from './solicitudesAdminTypes'

const flush = async () => {
  await act(async () => {
    await Promise.resolve()
  })
}

const evento = (
  partial: Partial<HistorialSolicitudEvento> &
    Pick<HistorialSolicitudEvento, 'id' | 'fecha' | 'estadoNuevo'>,
): HistorialSolicitudEvento => ({
  solicitudId: 15,
  estadoAnterior: null,
  observacionPublica: null,
  notaInterna: null,
  idUsuario: null,
  usuario: null,
  ...partial,
})

describe('SolicitudHistorialTimeline', () => {
  it('ordena cronológicamente aunque lleguen desordenados', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => {
      root.render(
        <SolicitudHistorialTimeline
          eventos={[
            evento({
              id: 3,
              fecha: '2026-10-21T12:00:00.000Z',
              estadoAnterior: 'EN_REVISION',
              estadoNuevo: 'APROBADA',
            }),
            evento({
              id: 1,
              fecha: '2026-10-19T12:00:00.000Z',
              estadoNuevo: 'PENDIENTE',
            }),
            evento({
              id: 2,
              fecha: '2026-10-20T12:00:00.000Z',
              estadoAnterior: 'PENDIENTE',
              estadoNuevo: 'EN_REVISION',
            }),
          ]}
        />,
      )
    })
    await flush()

    const items = host.querySelectorAll('li')
    expect(items).toHaveLength(3)
    expect(items[0].textContent).toContain('Solicitud registrada')
    expect(items[0].textContent).toContain('Pendiente')
    expect(items[1].textContent).toContain('Pendiente → En revisión')
    expect(items[2].textContent).toContain('En revisión → Aprobada')

    root.unmount()
    host.remove()
  })

  it('evento inicial sin undefined/null', async () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    await act(async () => {
      root.render(
        <SolicitudHistorialTimeline
          eventos={[
            evento({ id: 1, fecha: '2026-10-19T10:00:00.000Z', estadoNuevo: 'PENDIENTE' }),
          ]}
        />,
      )
    })
    expect(host.textContent).toContain('Solicitud registrada')
    expect(host.textContent).not.toMatch(/null|undefined/i)
    root.unmount()
  })

  it('muestra usuario, observación pública y nota interna diferenciadas', async () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    await act(async () => {
      root.render(
        <SolicitudHistorialTimeline
          eventos={[
            evento({
              id: 2,
              fecha: '2026-10-20T10:00:00.000Z',
              estadoAnterior: 'PENDIENTE',
              estadoNuevo: 'EN_REVISION',
              observacionPublica: 'Obs pública A',
              notaInterna: 'Nota interna B',
              idUsuario: 7,
              usuario: {
                idUsuario: 7,
                nombre: 'María Rodríguez',
                rol: 'ADMINISTRADORA',
              },
            }),
          ]}
        />,
      )
    })
    expect(host.textContent).toContain('María Rodríguez')
    expect(host.textContent).toContain('Observación pública')
    expect(host.textContent).toContain('Obs pública A')
    expect(host.textContent).toContain('Nota interna')
    expect(host.textContent).toContain('Nota interna B')
    const bloques = Array.from(host.querySelectorAll('article > div')).filter(
      (el) =>
        el.textContent?.includes('Observación pública') ||
        el.textContent?.includes('Nota interna'),
    )
    const publica = bloques.find((el) =>
      el.textContent?.includes('Observación pública'),
    )
    const interna = bloques.find((el) =>
      el.textContent?.startsWith('Nota interna'),
    )
    expect(publica?.textContent).toContain('Obs pública A')
    expect(publica?.textContent).not.toContain('Nota interna B')
    expect(interna?.textContent).toContain('Nota interna B')
    expect(interna?.textContent).not.toContain('Obs pública A')
    root.unmount()
  })

  it('sin usuario no inventa responsable; sin observaciones no muestra bloques vacíos', async () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    await act(async () => {
      root.render(
        <SolicitudHistorialTimeline
          eventos={[
            evento({
              id: 1,
              fecha: '2026-10-19T10:00:00.000Z',
              estadoNuevo: 'PENDIENTE',
            }),
          ]}
        />,
      )
    })
    expect(host.textContent).not.toContain('Realizado por')
    expect(host.textContent).not.toContain('Sin observación')
    expect(host.textContent).not.toContain('Sin nota')
    root.unmount()
  })

  it('empty state', async () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    await act(async () => {
      root.render(<SolicitudHistorialTimeline eventos={[]} />)
    })
    expect(host.textContent).toContain(
      'Aún no se han registrado cambios en esta solicitud.',
    )
    root.unmount()
  })

  it('loading y error con reintento', async () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    await act(async () => {
      root.render(<SolicitudHistorialTimeline eventos={[]} loading />)
    })
    expect(host.textContent).toContain('Cargando historial')

    const onRetry = vi.fn()
    await act(async () => {
      root.render(
        <SolicitudHistorialTimeline
          eventos={[]}
          error="No fue posible cargar el historial."
          onRetry={onRetry}
        />,
      )
    })
    expect(host.textContent).toContain('No fue posible cargar el historial.')
    const btn = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Reintentar'),
    ) as HTMLButtonElement
    await act(async () => {
      btn.click()
    })
    expect(onRetry).toHaveBeenCalledTimes(1)
    root.unmount()
  })
})
