import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loginAsRole } from '../../../test/authTestHelpers'
import { AuthProvider } from '../../auth/components/AuthContext'
import { clearAccessToken } from '../../auth/utils/authStorage'
import type { BalanceVacaciones } from '../types'
import { FONTANERO_MI_SALDO_TITLE } from '../recursosHumanosPaths'
import MiSaldoVacacionesPage from './MiSaldoVacacionesPage'

const balance: BalanceVacaciones = {
  colaboradorId: 1,
  colaborador: {
    id: 1,
    nombre: 'Carlos',
    apellidos: 'Mora',
    cedula: '1-2345-6789',
    cargo: 'Fontanero',
    activo: true,
  },
  diasAcumulados: 15,
  diasDisfrutados: 5,
  diasAjusteNeto: 0,
  diasDisponibles: 10,
  totalMovimientos: 2,
}

const response = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    text: async () => (ok ? '' : JSON.stringify(body)),
    json: async () => body,
  }) as Response

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })

async function mountPage() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(
      <MemoryRouter>
        <AuthProvider>
          <MiSaldoVacacionesPage />
        </AuthProvider>
      </MemoryRouter>,
    )
  })
  await flush()
  return {
    container,
    cleanup: async () => {
      await act(async () => root.unmount())
      container.remove()
    },
  }
}

describe('MiSaldoVacacionesPage', () => {
  beforeEach(() => {
    clearAccessToken()
    loginAsRole('Fontanero', '3')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    clearAccessToken()
  })

  it('carga el saldo propio con GET mias/balance', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(response(balance)))
    vi.stubGlobal('fetch', fetchMock)

    const view = await mountPage()
    try {
      expect(view.container.textContent).toContain(FONTANERO_MI_SALDO_TITLE)
      expect(view.container.textContent).toContain('Carlos Mora')
      expect(view.container.textContent).toContain('10')
      expect(fetchMock).toHaveBeenCalled()
      const calledUrl = String(fetchMock.mock.calls[0]?.[0] ?? '')
      expect(calledUrl).toContain('/rrhh/vacaciones/mias/balance')
      expect(calledUrl).not.toContain('colaboradorId')
    } finally {
      await view.cleanup()
    }
  })

  it('Reintentar vuelve a consultar mias/balance sin recargar la página', async () => {
    let attempts = 0
    const fetchMock = vi.fn(() => {
      attempts += 1
      if (attempts === 1) {
        return Promise.resolve(
          response(
            { statusCode: 500, message: 'Error temporal del servidor' },
            false,
            500,
          ),
        )
      }
      return Promise.resolve(response(balance))
    })
    vi.stubGlobal('fetch', fetchMock)

    const view = await mountPage()
    try {
      expect(view.container.textContent).toMatch(/No fue posible|Error|HTTP 500/i)
      const retry = Array.from(
        view.container.querySelectorAll<HTMLButtonElement>('button'),
      ).find((btn) => btn.textContent?.includes('Reintentar'))
      expect(retry).toBeTruthy()

      await act(async () => {
        retry!.click()
      })
      await flush()

      expect(view.container.textContent).toContain('Carlos Mora')
      expect(view.container.textContent).toContain('10')
      expect(attempts).toBe(2)
      expect(
        fetchMock.mock.calls.every((call) =>
          String(call[0] ?? '').includes('/rrhh/vacaciones/mias/balance'),
        ),
      ).toBe(true)
    } finally {
      await view.cleanup()
    }
  })
})
