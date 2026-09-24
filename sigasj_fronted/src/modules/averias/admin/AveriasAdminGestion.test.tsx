import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InternalAdminRoleName } from '../../auth/utils/internalRoles'
import { setAuthSession, clearAccessToken } from '../../auth/utils/authStorage'
import AveriasAdminDetailView from './AveriasAdminDetailView'
import { findAveriaDetailFixture } from './fixtures/averiasAdminDetail.fixture'
import { ESTADO_AVERIA_LABELS } from './estadoAveria'
import * as averiasAdminApi from '../services/averiasAdminApi'
import * as salidasApi from '../../inventario/salidas/salidasApi'
import {
  AVERIA_CLASIFICACION_FONTANERO_HINT,
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
    vi.spyOn(averiasAdminApi, 'patchAdminAveriaPrioridad')
    vi.spyOn(averiasAdminApi, 'patchAdminAveriaClasificacion')
    vi.spyOn(salidasApi, 'getSalidasPorAveria').mockResolvedValue([])
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    clearAccessToken()
    vi.restoreAllMocks()
  })

  const renderView = async (averia: AveriaDetail) => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AveriasAdminDetailView
            averia={averia}
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
    await renderView(averia!)
    expect(container.textContent).toContain('Asignada')
    expect(container.textContent).toContain(AVERIA_ESTADO_FONTANERO_HINT)
    expect(container.querySelector('#averia-gestion-estado')).toBeNull()
  })

  it('no permite a la Administradora cambiar estado, prioridad ni tipo', async () => {
    loginAs(InternalAdminRoleName.Administradora)
    const averia = findAveriaDetailFixture(1)
    expect(averia).toBeDefined()
    await renderView(averia!)
    expect(container.querySelector('#averia-gestion-estado')).toBeNull()
    expect(container.querySelector('#averia-gestion-prioridad')).toBeNull()
    expect(container.querySelector('#averia-gestion-clasificacion')).toBeNull()
    expect(container.textContent).toContain(AVERIA_CLASIFICACION_FONTANERO_HINT)
    expect(averiasAdminApi.patchAdminAveriaPrioridad).not.toHaveBeenCalled()
    expect(averiasAdminApi.patchAdminAveriaClasificacion).not.toHaveBeenCalled()
  })

  it('sin permisos de edición no muestra controles administrativos', async () => {
    await renderView(findAveriaDetailFixture(1)!)
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
