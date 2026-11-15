import { vi } from 'vitest'

/** AOS usa MutationObserver + document fuera de ciclo de vida del test; silencia teardown. */
vi.mock('aos', () => ({
  default: {
    init: vi.fn(),
    refresh: vi.fn(),
    refreshHard: vi.fn(),
  },
}))

/**
 * AuthProvider valida la sesion local contra GET /auth/me al montar. En jsdom no hay backend,
 * asi que sin este mock la peticion falla y AuthProvider limpia la sesion (redirect a /login).
 * Debe coincidir con el path que resuelve AuthContext (`.../services/authApi`).
 */
vi.mock('./src/modules/auth/services/authApi.ts', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('./src/modules/auth/services/authApi.ts')
    >()
  const { getAuthUser } = await import(
    './src/modules/auth/utils/authStorage.ts'
  )

  return {
    ...actual,
    fetchCurrentUser: vi.fn(async () => {
      const user = getAuthUser()
      if (!user) throw new Error('HTTP 401: sesion de prueba ausente')
      const isValidPart = (part?: string) =>
        Boolean(part) && !['null', 'undefined'].includes(part!.trim().toLowerCase())
      const fullName = [user.name, user.lastName].filter(isValidPart).join(' ')
      return {
        id: user.id ?? '1',
        email: user.email ?? 'usuario@asadasanjuan.cr',
        role: user.role ?? '',
        name: fullName || undefined,
      }
    }),
  }
})

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true

/** jsdom no trae matchMedia; sin esto caen MaterialesPage, Landing y rutas admin. */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  })) as typeof window.matchMedia
}

/** jsdom no implementa canvas 2D; evita ruido y teardown errors con SignaturePad. */
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function getContext() {
    return {
      scale() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      stroke() {},
      clearRect() {},
      drawImage() {},
      lineWidth: 1,
      lineCap: 'round',
      lineJoin: 'round',
      strokeStyle: '#000',
    } as unknown as CanvasRenderingContext2D
  }
}

const storage = new Map<string, string>()

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
