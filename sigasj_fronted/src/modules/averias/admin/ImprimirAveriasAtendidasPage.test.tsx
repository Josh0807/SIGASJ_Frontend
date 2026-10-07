import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as averiasAdminApi from '../services/averiasAdminApi'
import ImprimirAveriasAtendidasPage from './ImprimirAveriasAtendidasPage'

describe('ImprimirAveriasAtendidasPage', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.spyOn(averiasAdminApi, 'getAveriasAtendidasParaImpresion').mockResolvedValue([
      {
        id: 1,
        codigoSeguimiento: 'AV-2026-0001',
        fechaReporte: '2026-09-01T12:00:00.000Z',
        nombreReportante: 'Ana',
        sectorComunidad: 'San Juan',
        estado: 'EN_ATENCION',
        tipoAveria: 'TUBO_MADRE',
        prioridad: 'ALTA',
        fontanero: { id: 4, nombre: 'Carlos' },
        fechaAsignacion: '2026-09-01T13:00:00.000Z',
        fechaInicioAtencion: '2026-09-01T14:00:00.000Z',
        fechaResolucion: null,
      },
      {
        id: 2,
        codigoSeguimiento: 'AV-2026-0002',
        fechaReporte: '2026-09-02T12:00:00.000Z',
        nombreReportante: 'Luis',
        sectorComunidad: 'Carmen',
        estado: 'RESUELTA',
        tipoAveria: 'TUBO_MEDIDOR',
        prioridad: 'MEDIA',
        fontanero: { id: 4, nombre: 'Carlos' },
        fechaAsignacion: '2026-09-02T13:00:00.000Z',
        fechaInicioAtencion: '2026-09-02T14:00:00.000Z',
        fechaResolucion: '2026-09-02T16:00:00.000Z',
      },
    ])
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  it('muestra en proceso y reparadas y permite imprimir', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ImprimirAveriasAtendidasPage />
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(container.textContent).toContain('AV-2026-0001')
    expect(container.textContent).toContain('AV-2026-0002')
    expect(container.textContent).toContain('En proceso: 1')
    expect(container.textContent).toContain('Reparadas: 1')
    const boton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Imprimir'),
    ) as HTMLButtonElement
    expect(boton.disabled).toBe(false)
    await act(async () => {
      boton.click()
    })
    expect(print).toHaveBeenCalled()
  })
})
