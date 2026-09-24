import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setAccessToken, setAuthUser, clearAccessToken } from '../auth/utils/authStorage'
import * as notificacionesApi from './notificacionesApi'
import NotificacionesCampana from './NotificacionesCampana'

vi.mock('./notificacionesApi', () => ({
  getNotificacionesPropias: vi.fn(),
  marcarNotificacionLeida: vi.fn(),
}))

const item = {
  id: 4,
  idAveria: 25,
  tipo: 'AVERIA_REGISTRADA_ADMINISTRADORA',
  titulo: 'Nueva avería AV-2026-0001',
  mensaje: 'Se registró la avería AV-2026-0001.',
  leida: false,
  fechaCreacion: '2026-09-22T15:00:00.000Z',
  fechaLectura: null,
}

const mount = async () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(
      <MemoryRouter>
        <NotificacionesCampana />
      </MemoryRouter>,
    )
  })
  return {
    container,
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('NotificacionesCampana', () => {
  beforeEach(() => {
    setAccessToken('token-prueba')
    setAuthUser({ name: 'Ana', role: 'Administradora', id: '1' })
    vi.mocked(notificacionesApi.getNotificacionesPropias).mockReset()
    vi.mocked(notificacionesApi.marcarNotificacionLeida).mockReset()
  })

  afterEach(() => {
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('muestra estado vacío', async () => {
    vi.mocked(notificacionesApi.getNotificacionesPropias).mockResolvedValue({
      data: [],
      noLeidas: 0,
    })
    const view = await mount()
    try {
      expect(view.container.querySelector('.notificaciones-campana__trigger')).not.toBeNull()
      const trigger = view.container.querySelector(
        '.notificaciones-campana__trigger',
      ) as HTMLButtonElement
      await act(async () => {
        trigger.click()
      })
      expect(view.container.textContent).toContain('No hay notificaciones.')
      expect(view.container.querySelector('.notificaciones-campana__badge')).toBeNull()
    } finally {
      await view.cleanup()
    }
  })

  it('muestra loading y luego el contador de no leídas', async () => {
    let resolveList!: (value: {
      data: typeof item[]
      noLeidas: number
    }) => void
    vi.mocked(notificacionesApi.getNotificacionesPropias).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveList = resolve
        }),
    )
    const view = await mount()
    try {
      const trigger = view.container.querySelector(
        '.notificaciones-campana__trigger',
      ) as HTMLButtonElement
      await act(async () => {
        trigger.click()
      })
      expect(view.container.textContent).toContain('Cargando notificaciones…')
      await act(async () => {
        resolveList({ data: [item], noLeidas: 1 })
      })
      expect(view.container.textContent).toContain('Nueva avería AV-2026-0001')
      expect(view.container.querySelector('.notificaciones-campana__badge')?.textContent).toBe(
        '1',
      )
    } finally {
      await view.cleanup()
    }
  })

  it('muestra error HTTP sin exponer notificaciones ajenas', async () => {
    vi.mocked(notificacionesApi.getNotificacionesPropias).mockRejectedValue(
      new Error('HTTP 500: error'),
    )
    const view = await mount()
    try {
      const trigger = view.container.querySelector(
        '.notificaciones-campana__trigger',
      ) as HTMLButtonElement
      await act(async () => {
        trigger.click()
      })
      expect(view.container.textContent).toContain(
        'No se pudieron cargar las notificaciones.',
      )
      expect(view.container.textContent).not.toContain('María Rodríguez')
    } finally {
      await view.cleanup()
    }
  })

  it('navega a la avería autorizada y marca como leída', async () => {
    vi.mocked(notificacionesApi.getNotificacionesPropias).mockResolvedValue({
      data: [item],
      noLeidas: 1,
    })
    vi.mocked(notificacionesApi.marcarNotificacionLeida).mockResolvedValue({
      ...item,
      leida: true,
    })
    const view = await mount()
    try {
      const trigger = view.container.querySelector(
        '.notificaciones-campana__trigger',
      ) as HTMLButtonElement
      await act(async () => {
        trigger.click()
      })
      const link = view.container.querySelector(
        '.notificaciones-campana__link',
      ) as HTMLAnchorElement
      expect(link.getAttribute('href')).toBe('/admin/averias/25')
      await act(async () => {
        link.click()
      })
      expect(notificacionesApi.marcarNotificacionLeida).toHaveBeenCalledWith(4)
    } finally {
      await view.cleanup()
    }
  })
})
