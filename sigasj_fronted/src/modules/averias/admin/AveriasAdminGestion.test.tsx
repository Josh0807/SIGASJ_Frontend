import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InternalAdminRoleName } from '../../auth/utils/internalRoles'
import { setAuthSession, clearAccessToken } from '../../auth/utils/authStorage'
import AveriasAdminDetailView from './AveriasAdminDetailView'
import { findAveriaDetailFixture } from './fixtures/averiasAdminDetail.fixture'
import { ESTADO_AVERIA_LABELS } from './estadoAveria'
import * as averiasAdminApi from '../services/averiasAdminApi'
import type { AveriaDetail } from './types'

const adminDir = dirname(fileURLToPath(import.meta.url))
const styles = readFileSync(join(adminDir, '../../../index.css'), 'utf8')

describe('AveriasAdminGestion (PBI 2.3)', () => {
  let container: HTMLDivElement
  let root: Root
  let onUpdated: ReturnType<typeof vi.fn<(a: AveriaDetail) => void>>

  beforeEach(() => {
    document.head.innerHTML = `<style>${styles}</style>`
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    onUpdated = vi.fn()
    clearAccessToken()
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    clearAccessToken()
    vi.restoreAllMocks()
  })

  const renderView = async (
    averia: AveriaDetail,
    canEditGestion: boolean,
  ) => {
    await act(async () => {
      root.render(
        <AveriasAdminDetailView
          averia={averia}
          canEditGestion={canEditGestion}
          onAveriaUpdated={onUpdated}
        />,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
  }

  const loginAs = (role: string) => {
    setAuthSession({
      accessToken: 'test-token',
      user: {
        id: '1',
        email: 'admin@asadasanjuan.cr',
        name: 'Admin',
        role,
      },
    })
  }

  it('muestra estado, prioridad y clasificación en modo lectura', async () => {
    const averia = findAveriaDetailFixture(2)
    expect(averia).toBeDefined()
    await renderView(averia!, false)
    expect(container.textContent).toContain('Asignada')
    expect(container.textContent).toContain('Alta')
    expect(container.querySelector('#averia-gestion-estado')).toBeNull()
  })

  it('renderiza selects editables para administradora autorizada', async () => {
    loginAs(InternalAdminRoleName.Administradora)
    const averia = findAveriaDetailFixture(1)
    expect(averia).toBeDefined()
    await renderView(averia!, true)

    const estado = container.querySelector(
      '#averia-gestion-estado',
    ) as HTMLSelectElement
    const prioridad = container.querySelector(
      '#averia-gestion-prioridad',
    ) as HTMLSelectElement
    const clasificacion = container.querySelector(
      '#averia-gestion-clasificacion',
    ) as HTMLSelectElement

    expect(estado).not.toBeNull()
    expect(prioridad).not.toBeNull()
    expect(clasificacion).not.toBeNull()
    expect(estado.value).toBe('RECIBIDA')
    expect([...estado.options].map((o) => o.value)).toEqual([
      'RECIBIDA',
      'EN_REVISION',
    ])
  })

  it('no ofrece ASIGNADA ni EN_ATENCION en estado sin fontanero asignado', async () => {
    loginAs(InternalAdminRoleName.Administradora)
    const base = findAveriaDetailFixture(1)!
    await renderView(
      { ...base, estado: 'EN_REVISION', fontanero: null },
      true,
    )

    const estado = container.querySelector(
      '#averia-gestion-estado',
    ) as HTMLSelectElement
    const values = [...estado.options].map((o) => o.value)
    expect(values).toContain('EN_REVISION')
    expect(values).toContain('PENDIENTE')
    expect(values).not.toContain('ASIGNADA')
    expect(values).not.toContain('EN_ATENCION')
  })

  it('ejecuta PATCH de estado válido y actualiza la UI', async () => {
    const base = findAveriaDetailFixture(1)!
    const updated: AveriaDetail = { ...base, estado: 'EN_REVISION' }
    vi.spyOn(averiasAdminApi, 'patchAdminAveriaEstado').mockResolvedValueOnce(
      updated,
    )

    await renderView(base, true)
    const estado = container.querySelector(
      '#averia-gestion-estado',
    ) as HTMLSelectElement

    await act(async () => {
      estado.value = 'EN_REVISION'
      estado.dispatchEvent(new Event('change', { bubbles: true }))
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(averiasAdminApi.patchAdminAveriaEstado).toHaveBeenCalledWith(
      base.id,
      'EN_REVISION',
    )
    expect(onUpdated).toHaveBeenCalledWith(updated)
    expect(container.textContent).toContain('Estado actualizado correctamente.')
  })

  it('permite cambiar prioridad y clasificación', async () => {
    const base = findAveriaDetailFixture(1)!
    const updatedPri: AveriaDetail = { ...base, prioridad: 'ALTA' }
    const updatedCla: AveriaDetail = {
      ...updatedPri,
      tipoAveria: 'FUGA',
    }

    vi.spyOn(averiasAdminApi, 'patchAdminAveriaPrioridad').mockResolvedValueOnce(
      updatedPri,
    )
    vi.spyOn(averiasAdminApi, 'patchAdminAveriaClasificacion').mockResolvedValueOnce(
      updatedCla,
    )

    await renderView(base, true)

    const prioridad = container.querySelector(
      '#averia-gestion-prioridad',
    ) as HTMLSelectElement
    await act(async () => {
      prioridad.value = 'ALTA'
      prioridad.dispatchEvent(new Event('change', { bubbles: true }))
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(averiasAdminApi.patchAdminAveriaPrioridad).toHaveBeenCalledWith(
      base.id,
      'ALTA',
    )

    const clasificacion = container.querySelector(
      '#averia-gestion-clasificacion',
    ) as HTMLSelectElement
    await act(async () => {
      clasificacion.value = 'FUGA'
      clasificacion.dispatchEvent(new Event('change', { bubbles: true }))
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(averiasAdminApi.patchAdminAveriaClasificacion).toHaveBeenCalledWith(
      base.id,
      'FUGA',
    )
  })

  it('deshabilita controles mientras guarda', async () => {
    const base = findAveriaDetailFixture(1)!
    let resolvePatch!: (value: AveriaDetail) => void
    const pending = new Promise<AveriaDetail>((resolve) => {
      resolvePatch = resolve
    })
    vi.spyOn(averiasAdminApi, 'patchAdminAveriaEstado').mockReturnValueOnce(
      pending,
    )

    await renderView(base, true)
    const estado = container.querySelector(
      '#averia-gestion-estado',
    ) as HTMLSelectElement
    const prioridad = container.querySelector(
      '#averia-gestion-prioridad',
    ) as HTMLSelectElement

    await act(async () => {
      estado.value = 'EN_REVISION'
      estado.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(estado.disabled).toBe(true)
    expect(prioridad.disabled).toBe(true)

    await act(async () => {
      resolvePatch({ ...base, estado: 'EN_REVISION' })
      await pending
      await Promise.resolve()
    })

    expect(estado.disabled).toBe(false)
  })

  it('muestra error de transición y revierte el select de estado', async () => {
    const base = findAveriaDetailFixture(1)!
    vi.spyOn(averiasAdminApi, 'patchAdminAveriaEstado').mockRejectedValueOnce(
      new Error(
        'HTTP 400: No se puede cambiar una avería de RECIBIDA a EN_REVISION.',
      ),
    )

    await renderView(base, true)
    const estado = container.querySelector(
      '#averia-gestion-estado',
    ) as HTMLSelectElement

    await act(async () => {
      estado.value = 'EN_REVISION'
      estado.dispatchEvent(new Event('change', { bubbles: true }))
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(container.textContent).toContain(
      'No se puede cambiar una avería de RECIBIDA a EN_REVISION.',
    )
    expect(estado.value).toBe('RECIBIDA')
  })

  it('sin permisos de edición no muestra controles administrativos', async () => {
    await renderView(findAveriaDetailFixture(1)!, false)
    expect(container.querySelector('#averia-gestion-estado')).toBeNull()
    expect(container.querySelector('#averia-gestion-prioridad')).toBeNull()
    expect(container.querySelector('#averia-gestion-clasificacion')).toBeNull()
  })

  it('expone etiquetas de estado alineadas al Backend', () => {
    expect(ESTADO_AVERIA_LABELS.EN_REVISION).toBe('En revisión')
    expect(ESTADO_AVERIA_LABELS.CANCELADA).toBe('Cancelada')
  })
})
