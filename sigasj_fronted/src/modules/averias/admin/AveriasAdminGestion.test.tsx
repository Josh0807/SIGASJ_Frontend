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
import {
  AVERIA_ESTADO_FONTANERO_HINT,
} from './AveriasAdminGestionControls'
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

  it('muestra el estado en lectura porque lo actualiza el Fontanero', async () => {
    const averia = findAveriaDetailFixture(2)
    expect(averia).toBeDefined()
    await renderView(averia!, true)
    expect(container.textContent).toContain('Asignada')
    expect(container.textContent).toContain(AVERIA_ESTADO_FONTANERO_HINT)
    expect(container.querySelector('#averia-gestion-estado')).toBeNull()
  })

  it('no permite a la Administradora cambiar el estado', async () => {
    loginAs(InternalAdminRoleName.Administradora)
    const averia = findAveriaDetailFixture(1)
    expect(averia).toBeDefined()
    await renderView(averia!, true)
    expect(container.querySelector('#averia-gestion-estado')).toBeNull()
    expect(container.querySelector('#averia-gestion-prioridad')).not.toBeNull()
    expect(container.querySelector('#averia-gestion-clasificacion')).not.toBeNull()
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
    vi.spyOn(averiasAdminApi, 'patchAdminAveriaPrioridad').mockReturnValueOnce(
      pending,
    )

    await renderView(base, true)
    const prioridad = container.querySelector(
      '#averia-gestion-prioridad',
    ) as HTMLSelectElement
    const clasificacion = container.querySelector(
      '#averia-gestion-clasificacion',
    ) as HTMLSelectElement

    await act(async () => {
      prioridad.value = 'ALTA'
      prioridad.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(prioridad.disabled).toBe(true)
    expect(clasificacion.disabled).toBe(true)

    await act(async () => {
      resolvePatch({ ...base, prioridad: 'ALTA' })
      await pending
      await Promise.resolve()
    })

    expect(prioridad.disabled).toBe(false)
  })

  it('sin permisos de edición no muestra controles administrativos', async () => {
    await renderView(findAveriaDetailFixture(1)!, false)
    expect(container.querySelector('#averia-gestion-estado')).toBeNull()
    expect(container.querySelector('#averia-gestion-prioridad')).toBeNull()
    expect(container.querySelector('#averia-gestion-clasificacion')).toBeNull()
  })

  it('expone etiquetas de estado alineadas al Backend', () => {
    expect(ESTADO_AVERIA_LABELS.EN_REVISION).toBe('En revisión')
    expect(ESTADO_AVERIA_LABELS.ASIGNADA).toBe('Asignada')
    expect(ESTADO_AVERIA_LABELS.PENDIENTE).toBe('Pendiente de atención')
    expect(ESTADO_AVERIA_LABELS.EN_ATENCION).toBe('En atención')
    expect(ESTADO_AVERIA_LABELS.CANCELADA).toBe('Cancelada')
    expect(Object.values(ESTADO_AVERIA_LABELS)).not.toContain('Fuera de horario')
  })
})
