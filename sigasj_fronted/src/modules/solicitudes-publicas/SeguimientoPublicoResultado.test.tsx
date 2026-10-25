import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import SeguimientoPublicoResultado from './SeguimientoPublicoResultado'
import type { SeguimientoSolicitudPublico } from './seguimientoPublicoTypes'

const base = (
  partial?: Partial<SeguimientoSolicitudPublico>,
): SeguimientoSolicitudPublico => ({
  codigoSeguimiento: 'SOL-2026-00001',
  estado: 'EN_REVISION',
  fechaIngreso: '2026-10-20T14:30:00.000Z',
  tipoSolicitud: {
    nombre: 'Cambio de Nombre del Titular del Servicio',
    slug: 'cambio-titular',
  },
  historial: [
    {
      fecha: '2026-10-21T12:00:00.000Z',
      estadoAnterior: 'PENDIENTE',
      estadoNuevo: 'EN_REVISION',
      observacionPublica: 'Su solicitud está en revisión.',
    },
    {
      fecha: '2026-10-19T10:00:00.000Z',
      estadoAnterior: null,
      estadoNuevo: 'PENDIENTE',
      observacionPublica: null,
    },
  ],
  ...partial,
})

describe('SeguimientoPublicoResultado', () => {
  it('muestra código, tipo, fecha, estado y timeline ordenada', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <SeguimientoPublicoResultado resultado={base()} />
        </MemoryRouter>,
      )
    })

    expect(host.textContent).toContain('SOL-2026-00001')
    expect(host.textContent).toContain('Cambio de Nombre del Titular del Servicio')
    expect(host.textContent).toContain('Estado actual')
    expect(host.textContent).toContain('En revisión')
    expect(host.textContent).toContain('Avance del trámite')
    expect(host.textContent).toContain('Solicitud registrada')
    expect(host.textContent).toContain('Pendiente → En revisión')
    expect(host.textContent).toContain('Su solicitud está en revisión.')

    const items = host.querySelectorAll('li')
    expect(items[0].textContent).toContain('Solicitud registrada')
    expect(items[1].textContent).toContain('Pendiente → En revisión')
    expect(items[1].textContent).toContain('Actual')
    expect(items[0].textContent).toContain('Completado')
    root.unmount()
  })

  it('evento inicial no muestra null; sin observación no inventa texto', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <SeguimientoPublicoResultado
            resultado={base({
              historial: [
                {
                  fecha: '2026-10-19T10:00:00.000Z',
                  estadoAnterior: null,
                  estadoNuevo: 'PENDIENTE',
                  observacionPublica: null,
                },
              ],
              estado: 'PENDIENTE',
            })}
          />
        </MemoryRouter>,
      )
    })
    expect(host.textContent).not.toMatch(/null|undefined/i)
    expect(host.textContent).not.toContain('Sin observación')
    root.unmount()
  })

  it('historial vacío mantiene estado y empty state', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <SeguimientoPublicoResultado
            resultado={base({ historial: [], estado: 'PENDIENTE' })}
          />
        </MemoryRouter>,
      )
    })
    expect(host.textContent).toContain('Pendiente')
    expect(host.textContent).toContain(
      'No hay actualizaciones adicionales para mostrar',
    )
    root.unmount()
  })

  it('no renderiza notaInterna/usuario aunque lleguen en el payload', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const sucio = {
      ...base(),
      notaInterna: 'CONFIDENCIAL_INTERNA',
      historial: [
        {
          fecha: '2026-10-20T10:00:00.000Z',
          estadoAnterior: 'PENDIENTE' as const,
          estadoNuevo: 'EN_REVISION' as const,
          observacionPublica: 'Pública A',
          notaInterna: 'INTERNA_B',
          usuario: { nombre: 'María Admin', rol: 'ADMINISTRADORA' },
          idUsuario: 7,
        },
      ],
    } as SeguimientoSolicitudPublico

    act(() => {
      root.render(
        <MemoryRouter>
          <SeguimientoPublicoResultado resultado={sucio} />
        </MemoryRouter>,
      )
    })

    expect(host.textContent).toContain('Pública A')
    expect(host.textContent).not.toContain('CONFIDENCIAL_INTERNA')
    expect(host.textContent).not.toContain('INTERNA_B')
    expect(host.textContent).not.toContain('María Admin')
    expect(host.textContent).not.toContain('ADMINISTRADORA')
    expect(host.textContent).not.toContain('usuarioId')
    expect(host.textContent).not.toContain('idUsuario')
    root.unmount()
  })

  it('usa estado del response (contrato) aunque el último evento diga otra cosa', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <SeguimientoPublicoResultado
            resultado={base({
              // Inconsistencia Backend: resumen APROBADA, último evento EN_REVISION.
              estado: 'APROBADA',
              historial: [
                {
                  fecha: '2026-10-19T10:00:00.000Z',
                  estadoAnterior: null,
                  estadoNuevo: 'PENDIENTE',
                  observacionPublica: null,
                },
                {
                  fecha: '2026-10-21T12:00:00.000Z',
                  estadoAnterior: 'PENDIENTE',
                  estadoNuevo: 'EN_REVISION',
                  observacionPublica: 'Aún en revisión (evento desfasado).',
                },
              ],
            })}
          />
        </MemoryRouter>,
      )
    })
    // Fuente de verdad del resumen = campo `estado` del response público.
    expect(host.textContent).toContain('Estado actual')
    expect(host.textContent).toContain('Aprobada')
    expect(host.textContent).toContain('trámite concluido')
    // El historial sigue mostrando el evento real sin reescribirlo.
    expect(host.textContent).toContain('Pendiente → En revisión')
    root.unmount()
  })

  it('estado rechazado se marca como terminal negativo', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <SeguimientoPublicoResultado
            resultado={base({
              estado: 'RECHAZADA',
              historial: [
                {
                  fecha: '2026-10-22T10:00:00.000Z',
                  estadoAnterior: 'EN_REVISION',
                  estadoNuevo: 'RECHAZADA',
                  observacionPublica: 'Documentación incompleta.',
                },
              ],
            })}
          />
        </MemoryRouter>,
      )
    })
    expect(host.textContent).toContain('Rechazada')
    expect(host.textContent).toContain('proceso cerrado')
    expect(host.textContent).toContain('Documentación incompleta.')
    root.unmount()
  })

  it('Nueva consulta dispara callback', () => {
    const onNueva = vi.fn()
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <SeguimientoPublicoResultado
            resultado={base()}
            onNuevaConsulta={onNueva}
          />
        </MemoryRouter>,
      )
    })
    const btn = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Nueva consulta'),
    ) as HTMLButtonElement
    act(() => {
      btn.click()
    })
    expect(onNueva).toHaveBeenCalledTimes(1)
    root.unmount()
  })

  it('soporta muchos eventos sin romper layout', () => {
    const historial = Array.from({ length: 22 }, (_, i) => ({
      fecha: `2026-10-${String((i % 28) + 1).padStart(2, '0')}T10:00:00.000Z`,
      estadoAnterior: (i === 0 ? null : 'PENDIENTE') as 'PENDIENTE' | null,
      estadoNuevo: 'PENDIENTE' as const,
      observacionPublica:
        i % 5 === 0
          ? `Observación larga número ${i} `.repeat(8)
          : null,
    }))
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => {
      root.render(
        <MemoryRouter>
          <SeguimientoPublicoResultado
            resultado={base({ historial, estado: 'PENDIENTE' })}
          />
        </MemoryRouter>,
      )
    })
    expect(host.querySelectorAll('li')).toHaveLength(22)
    expect(host.innerHTML).toContain('break-words')
    root.unmount()
  })
})
