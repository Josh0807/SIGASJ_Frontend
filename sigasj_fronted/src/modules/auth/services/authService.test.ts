import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchWithAuth } from '../../../services/http/httpClient'
import { requestDevToken } from './authService'

vi.mock('../../../services/http/httpClient', () => ({
  fetchWithAuth: vi.fn(),
}))

describe('authService', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('requestDevToken mapea JWT y usuario del backend', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      user: {
        id: 'dev-administradora',
        email: 'administradora@dev.sigasj.local',
        role: 'ADMINISTRADORA',
        name: 'Usuario Administradora',
      },
    })

    await expect(requestDevToken('Administradora')).resolves.toEqual({
      accessToken: 'jwt-token',
      user: {
        id: 'dev-administradora',
        email: 'administradora@dev.sigasj.local',
        role: 'Administradora',
        name: 'Usuario',
        lastName: 'Administradora',
      },
    })

    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/auth/dev-token', {
      method: 'POST',
      body: JSON.stringify({ rol: 'Administradora' }),
    })
  })
})
