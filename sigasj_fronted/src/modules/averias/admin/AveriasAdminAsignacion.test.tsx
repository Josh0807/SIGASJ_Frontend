import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AveriasAdminDetailView from './AveriasAdminDetailView'
import { findAveriaDetailFixture } from './fixtures/averiasAdminDetail.fixture'
import { AVERIAS_ADMIN_FONTANEROS_EMPTY } from './types'
import * as averiasAdminApi from '../services/averiasAdminApi'
import * as salidasApi from '../../inventario/salidas/salidasApi'
import type { AveriaDetail } from './types'

const adminDir = dirname(fileURLToPath(import.meta.url))
const styles = readFileSync(join(adminDir, '../../../index.css'), 'utf8')

describe('AveriasAdminAsignacion (PBI 2.4)', () => {
  let container: HTMLDivElement
  let root: Root
  let onUpdated: ReturnType<typeof vi.fn<(a: AveriaDetail) => void>>

  beforeEach(() => {
    document.head.innerHTML = `<style>${styles}</style>`
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    onUpdated = vi.fn()
    vi.spyOn(salidasApi, 'getSalidasPorAveria').mockResolvedValue([])
    vi.spyOn(averiasAdminApi, 'getAdminAveriaEventosHistorial').mockResolvedValue({
      id: 1,
      codigoSeguimiento: 'AV-2026-0001',
      data: [],
    })
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  const renderView = async (
    averia: AveriaDetail,
    canAssignFontanero: boolean,
  ) => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AveriasAdminDetailView
            averia={averia}
            canAssignFontanero={canAssignFontanero}
            onAveriaUpdated={onUpdated}
          />
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
  }

  it('muestra la sección de asignación y fontanero actual en avería asignada', async () => {
    const averia = findAveriaDetailFixture(2)!
    await renderView(averia, false)
    expect(container.textContent).toContain('Asignación de avería')
    expect(container.textContent).toContain('Luis Campos')
    expect(container.querySelector('#averia-asignacion-fontanero')).toBeNull()
  })

  it('no muestra controles de asignación sin permiso', async () => {
    const base = findAveriaDetailFixture(1)!
    await renderView(
      { ...base, estado: 'EN_REVISION', fontanero: null },
      false,
    )
    expect(container.querySelector('#averia-asignacion-fontanero')).toBeNull()
  })

  it('muestra nombres en el selector y asigna con PATCH numérico', async () => {
    const base = findAveriaDetailFixture(1)!
    const averia = { ...base, estado: 'EN_REVISION', fontanero: null }
    const updated: AveriaDetail = {
      ...averia,
      estado: 'ASIGNADA',
      fontanero: { id: 5, nombre: 'Carlos Pérez' },
      fechaAsignacion: '2026-09-13T10:00:00.000Z',
    }

    vi.spyOn(averiasAdminApi, 'getAdminAveriaFontaneros').mockResolvedValueOnce({
      data: [
        { id: 5, nombre: 'Carlos Pérez' },
        { id: 7, nombre: 'José Ramírez' },
      ],
    })
    const patchSpy = vi
      .spyOn(averiasAdminApi, 'patchAdminAveriaAsignacion')
      .mockResolvedValueOnce(updated)

    await renderView(averia, true)

    expect(averiasAdminApi.getAdminAveriaFontaneros).toHaveBeenCalled()
    expect(container.textContent).toContain('Carlos Pérez')
    expect(container.textContent).toContain('José Ramírez')
    expect(container.textContent).not.toContain('Fontanero #5')

    const select = container.querySelector(
      '#averia-asignacion-fontanero',
    ) as HTMLSelectElement
    expect(select).not.toBeNull()

    const assignButton = () =>
      [...container.querySelectorAll('button')].find((button) =>
        button.textContent?.includes('Asignar fontanero'),
      ) as HTMLButtonElement | undefined

    expect(assignButton()?.disabled).toBe(true)

    await act(async () => {
      select.value = '5'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(assignButton()?.disabled).toBe(false)

    await act(async () => {
      assignButton()?.click()
    })

    expect(container.textContent).toContain(
      '¿Desea asignar esta avería a Carlos Pérez?',
    )

    const confirmButton = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Confirmar asignación',
    )
    expect(confirmButton).not.toBeUndefined()

    await act(async () => {
      confirmButton?.click()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(patchSpy).toHaveBeenCalledTimes(1)
    expect(patchSpy.mock.calls[0][1]).toBe(5)
    expect(typeof patchSpy.mock.calls[0][1]).toBe('number')
    expect(onUpdated).toHaveBeenCalledWith(updated)
    expect(container.textContent).toContain(
      'Avería asignada correctamente a Carlos Pérez.',
    )

    await renderView(updated, true)
    expect(container.querySelector('#averia-asignacion-fontanero')).toBeNull()
    expect(container.textContent).toContain('Carlos Pérez')
    expect(container.textContent).toContain('Asignada')
  })

  it('usa fallback Fontanero #ID si GET no trae nombre', async () => {
    vi.spyOn(averiasAdminApi, 'getAdminAveriaFontaneros').mockResolvedValueOnce({
      data: [{ id: 5 }],
    })

    await renderView(
      {
        ...findAveriaDetailFixture(1)!,
        estado: 'EN_REVISION',
        fontanero: null,
      },
      true,
    )

    expect(container.textContent).toContain('Fontanero #5')
    expect(container.textContent).not.toContain('Carlos Pérez')
  })

  it('carga fontaneros en PENDIENTE', async () => {
    const base = findAveriaDetailFixture(1)!
    const listSpy = vi
      .spyOn(averiasAdminApi, 'getAdminAveriaFontaneros')
      .mockResolvedValueOnce({ data: [{ id: 3 }] })

    await renderView(
      { ...base, estado: 'PENDIENTE', fontanero: null },
      true,
    )

    expect(listSpy).toHaveBeenCalled()
    expect(container.querySelector('#averia-asignacion-fontanero')).not.toBeNull()
  })

  it('Cancelar en ConfirmDialog no ejecuta PATCH', async () => {
    const base = findAveriaDetailFixture(1)!
    vi.spyOn(averiasAdminApi, 'getAdminAveriaFontaneros').mockResolvedValueOnce({
      data: [{ id: 5 }],
    })
    const patchSpy = vi.spyOn(averiasAdminApi, 'patchAdminAveriaAsignacion')

    await renderView(
      { ...base, estado: 'EN_REVISION', fontanero: null },
      true,
    )

    const select = container.querySelector(
      '#averia-asignacion-fontanero',
    ) as HTMLSelectElement
    await act(async () => {
      select.value = '5'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    const assignButton = [...container.querySelectorAll('button')].find(
      (button) => button.textContent?.includes('Asignar fontanero'),
    )
    await act(async () => {
      assignButton?.click()
    })

    const cancelButton = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Cancelar',
    )
    await act(async () => {
      cancelButton?.click()
    })

    expect(patchSpy).not.toHaveBeenCalled()
  })

  it('deshabilita botón sin selección y muestra listado vacío', async () => {
    const base = findAveriaDetailFixture(1)!
    vi.spyOn(averiasAdminApi, 'getAdminAveriaFontaneros').mockResolvedValueOnce({
      data: [],
    })

    await renderView(
      { ...base, estado: 'EN_REVISION', fontanero: null },
      true,
    )

    expect(container.textContent).toContain(AVERIAS_ADMIN_FONTANEROS_EMPTY)
    const assignButton = [...container.querySelectorAll('button')].find(
      (button) => button.textContent?.includes('Asignar fontanero'),
    )
    expect(assignButton).toBeUndefined()
  })

  it('muestra error del Backend al asignar', async () => {
    const base = findAveriaDetailFixture(1)!
    vi.spyOn(averiasAdminApi, 'getAdminAveriaFontaneros').mockResolvedValueOnce({
      data: [{ id: 3 }],
    })
    vi.spyOn(averiasAdminApi, 'patchAdminAveriaAsignacion').mockRejectedValueOnce(
      new Error('HTTP 400: La avería ya tiene un fontanero asignado.'),
    )

    await renderView(
      { ...base, estado: 'EN_REVISION', fontanero: null },
      true,
    )

    const select = container.querySelector(
      '#averia-asignacion-fontanero',
    ) as HTMLSelectElement
    await act(async () => {
      select.value = '3'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    const assignButton = [...container.querySelectorAll('button')].find(
      (button) => button.textContent?.includes('Asignar fontanero'),
    )
    await act(async () => {
      assignButton?.click()
    })
    const confirmButton = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Confirmar asignación',
    )
    await act(async () => {
      confirmButton?.click()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(container.textContent).toContain(
      'La avería ya tiene un fontanero asignado.',
    )
  })

  it('RECIBIDA muestra mensaje informativo y no consulta fontaneros', async () => {
    const recibida = findAveriaDetailFixture(1)!
    const listSpy = vi.spyOn(averiasAdminApi, 'getAdminAveriaFontaneros')
    await renderView(recibida, true)
    expect(container.textContent).toContain(
      'La avería debe estar en revisión antes de poder asignarse.',
    )
    expect(container.querySelector('#averia-asignacion-fontanero')).toBeNull()
    expect(listSpy).not.toHaveBeenCalled()
  })

  it('RESUELTA y CANCELADA no muestran formulario de asignación', async () => {
    const resolved = findAveriaDetailFixture(5)!
    const listSpy = vi.spyOn(averiasAdminApi, 'getAdminAveriaFontaneros')
    await renderView(resolved, true)
    expect(container.querySelector('#averia-asignacion-fontanero')).toBeNull()
    expect(listSpy).not.toHaveBeenCalled()

    listSpy.mockClear()
    const cancelled = { ...findAveriaDetailFixture(1)!, estado: 'CANCELADA' }
    await renderView(cancelled, true)
    expect(container.querySelector('#averia-asignacion-fontanero')).toBeNull()
    expect(listSpy).not.toHaveBeenCalled()
  })

  it('evita doble PATCH mientras asigna', async () => {
    const base = findAveriaDetailFixture(1)!
    vi.spyOn(averiasAdminApi, 'getAdminAveriaFontaneros').mockResolvedValueOnce({
      data: [{ id: 4 }],
    })
    let resolvePatch!: (value: AveriaDetail) => void
    const patchSpy = vi
      .spyOn(averiasAdminApi, 'patchAdminAveriaAsignacion')
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePatch = resolve
          }),
      )

    await renderView(
      { ...base, estado: 'EN_REVISION', fontanero: null },
      true,
    )

    const select = container.querySelector(
      '#averia-asignacion-fontanero',
    ) as HTMLSelectElement
    await act(async () => {
      select.value = '4'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    const assignButton = [...container.querySelectorAll('button')].find(
      (button) => button.textContent?.includes('Asignar fontanero'),
    ) as HTMLButtonElement
    await act(async () => {
      assignButton.click()
    })
    const confirmButton = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Confirmar asignación',
    )
    await act(async () => {
      confirmButton?.click()
      await Promise.resolve()
    })

    expect(select.disabled).toBe(true)
    expect(assignButton.disabled).toBe(true)
    expect(patchSpy).toHaveBeenCalledTimes(1)

    const updated: AveriaDetail = {
      ...base,
      estado: 'ASIGNADA',
      fontanero: { id: 4 },
      fechaAsignacion: '2026-09-13T12:00:00.000Z',
    }
    await act(async () => {
      resolvePatch(updated)
      await Promise.resolve()
      await Promise.resolve()
    })
  })
})
