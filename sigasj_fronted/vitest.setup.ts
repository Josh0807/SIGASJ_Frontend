import { vi } from 'vitest'

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true

const storage = new Map<string, string>()

const createDevTokenResponse = (rol: string) => {
  const role = rol.trim() || 'Administradora'

  return Response.json({
    accessToken: `test-token-${role.toLowerCase()}`,
    tokenType: 'Bearer',
    user: {
      id: `dev-${role.toLowerCase()}`,
      email: `${role.toLowerCase()}@dev.sigasj.local`,
      role: role.toUpperCase(),
      name: `Usuario ${role}`,
    },
  })
}

const nativeFetch = globalThis.fetch?.bind(globalThis)

vi.stubGlobal(
  'fetch',
  vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url

    if (url.includes('/auth/dev-token') && init?.method?.toUpperCase() === 'POST') {
      try {
        const body = JSON.parse(String(init.body ?? '{}')) as { rol?: string }
        return createDevTokenResponse(body.rol ?? 'Administradora')
      } catch {
        return createDevTokenResponse('Administradora')
      }
    }

    if (nativeFetch) {
      return nativeFetch(input, init)
    }

    throw new Error(`Fetch no mockeado en pruebas: ${url}`)
  }),
)

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
    clear: () => {
      storage.clear()
    },
  },
  configurable: true,
})
