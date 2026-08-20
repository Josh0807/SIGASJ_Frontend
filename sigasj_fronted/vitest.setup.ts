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

    if (url.includes('/public/contacto')) {
      return Response.json({
        telefono: '8560-7584',
        telefonosAdicionales: [],
        email: 'asadasanjuan24@gmail.com',
        horarioAtencion: 'Lunes a sábado de 7:30 a.m. – 11:30 a.m.',
        horarioVentanilla: 'Lunes a sábado de 7:30 a.m. – 11:30 a.m.',
        direccion: 'Costado norte de la Plaza de Deportes, San Juan, Santa Cruz.',
        referenciaUbicacion: null,
        regionResumen: 'San Juan de Santa Cruz, Guanacaste',
        mapaUrl: 'https://maps.app.goo.gl/2HtJjfvjTuLqVaFEA',
        mapaLatitud: 10.2188017,
        mapaLongitud: -85.5565018,
        mapaZoom: 19,
        textoUbicacionMapa: 'Encuentra nuestra oficina en San Juan de Santa Cruz.',
        urlFacebook: 'https://www.facebook.com/share/14kJoKE9tLm/',
        descripcionContacto: 'Estamos para atenderte.',
        actualizadoEn: '2026-01-01T00:00:00.000Z',
      })
    }

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
