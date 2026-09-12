import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AVERIAS_ADMIN_LOAD_ERROR,
  type AveriasAdminListado,
} from '../admin/types'
import { AVERIAS_ADMIN_UI_FIXTURE } from '../admin/fixtures/averiasAdminList.fixture'
import * as averiasAdminApi from '../services/averiasAdminApi'
import { useAdminAverias } from './useAdminAverias'

const Probe = ({
  search,
  onState,
}: {
  search: string
  onState: (state: ReturnType<typeof useAdminAverias>) => void
}) => {
  const state = useAdminAverias({ page: 1, limit: 20, search })
  onState(state)
  return null
}

describe('useAdminAverias — cancelación', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  it('descarta la respuesta lenta de una búsqueda anterior', async () => {
    let resolveA: ((value: AveriasAdminListado) => void) | undefined
    vi.spyOn(averiasAdminApi, 'getAdminAverias').mockImplementation(
      (query, signal) =>
        new Promise((resolve, reject) => {
          const abort = () => {
            reject(new DOMException('Aborted', 'AbortError'))
          }
          if (signal?.aborted) {
            abort()
            return
          }
          signal?.addEventListener('abort', abort, { once: true })

          if (query.search === 'A') {
            resolveA = (value) => {
              signal?.removeEventListener('abort', abort)
              resolve(value)
            }
            return
          }

          resolve({
            ...AVERIAS_ADMIN_UI_FIXTURE,
            data: [AVERIAS_ADMIN_UI_FIXTURE.data[1]],
            total: 1,
          })
        }),
    )

    const latest: { current: ReturnType<typeof useAdminAverias> | null } = {
      current: null,
    }

    await act(async () => {
      root.render(
        <Probe
          search="A"
          onState={(state) => {
            latest.current = state
          }}
        />,
      )
    })

    await act(async () => {
      root.render(
        <Probe
          search="B"
          onState={(state) => {
            latest.current = state
          }}
        />,
      )
      await Promise.resolve()
      await Promise.resolve()
    })

    await act(async () => {
      resolveA?.({
        ...AVERIAS_ADMIN_UI_FIXTURE,
        data: [AVERIAS_ADMIN_UI_FIXTURE.data[0]],
        total: 1,
      })
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(latest.current?.listado.total).toBe(1)
    expect(latest.current?.listado.data[0]?.codigoSeguimiento).toBe(
      'AV-2026-0002',
    )
    expect(latest.current?.error).toBeNull()
  })

  it('trata un fallo de red como error seguro y termina el loading', async () => {
    vi.spyOn(averiasAdminApi, 'getAdminAverias').mockRejectedValue(
      new TypeError('Failed to fetch'),
    )
    const latest: { current: ReturnType<typeof useAdminAverias> | null } = {
      current: null,
    }

    await act(async () => {
      root.render(
        <Probe
          search=""
          onState={(state) => {
            latest.current = state
          }}
        />,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(latest.current?.loading).toBe(false)
    expect(latest.current?.error).toBe(AVERIAS_ADMIN_LOAD_ERROR)
  })
})
