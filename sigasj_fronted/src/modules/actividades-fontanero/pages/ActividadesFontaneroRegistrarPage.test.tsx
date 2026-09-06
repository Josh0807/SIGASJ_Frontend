import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAuthSession } from '../../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/publicRoutes'
import * as actividadesApi from '../services/actividadesFontaneroApi'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'

const NUEVA_PATH = ACTIVIDADES_FONTANERO_PATHS.nueva
const REGISTRAR_PATH = ACTIVIDADES_FONTANERO_PATHS.registrar
const HOME_PATH = ACTIVIDADES_FONTANERO_PATHS.home

const CODIGOS_TIPOS = [
  'CONTROL_FUGAS',
  'TOMA_PRESION',
  'VISITA_CAMPO',
  'CONTROL_AFOROS',
  'CONTROL_OPERATIVO',
  'CLORACION',
  'INCAPACIDADES',
  'VACACIONES',
] as const

const TIPOS_MOCK: actividadesApi.TipoActividadFontanero[] = [
  { id: 1, codigo: 'CONTROL_FUGAS', nombre: 'Control de fugas', orden: 1 },
  { id: 2, codigo: 'TOMA_PRESION', nombre: 'Toma de presión', orden: 2 },
  { id: 3, codigo: 'VISITA_CAMPO', nombre: 'Visita de campo', orden: 3 },
  { id: 4, codigo: 'CONTROL_AFOROS', nombre: 'Control de aforos', orden: 4 },
  { id: 5, codigo: 'CONTROL_OPERATIVO', nombre: 'Control operativo', orden: 5 },
  { id: 6, codigo: 'CLORACION', nombre: 'Cloración', orden: 6 },
  { id: 7, codigo: 'INCAPACIDADES', nombre: 'Incapacidades', orden: 7 },
  { id: 8, codigo: 'VACACIONES', nombre: 'Vacaciones', orden: 8 },
]

const loginAsFontanero = () => {
  setAuthSession({
    accessToken: 'token-fontanero',
    user: {
      id: '3',
      role: 'Fontanero',
      name: 'Carlos',
      lastName: 'Mora',
    },
  })
}

const setInputValue = (
  input: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) => {
  const proto =
    input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

const changeSelect = (select: HTMLSelectElement, value: string) => {
  select.value = value
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

const waitForUpdates = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe('registrar actividad — catálogo y selector de tipos', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
    vi.spyOn(actividadesApi, 'getCorreccionesPendientes').mockResolvedValue({
      data: [],
      total: 0,
    })
    vi.spyOn(actividadesApi, 'getTiposActividadFontanero').mockResolvedValue({
      data: TIPOS_MOCK,
      total: TIPOS_MOCK.length,
    })
    vi.spyOn(actividadesApi, 'registrarActividadFontanero').mockResolvedValue({
      id: 99,
    })
  })

  it('muestra el selector con los ocho tipos del catálogo', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(NUEVA_PATH)

    try {
      await waitForUpdates()

      expect(app.currentPath()).toBe(NUEVA_PATH)
      expect(app.container.innerHTML).toContain('Tipo de actividad')
      expect(app.container.innerHTML).toContain('Seleccione un tipo')

      const select = app.container.querySelector(
        '[data-testid="tipo-actividad-select"]',
      ) as HTMLSelectElement
      expect(select).not.toBeNull()

      TIPOS_MOCK.forEach((tipo) => {
        expect(app.container.innerHTML).toContain(tipo.nombre)
      })

      expect(TIPOS_MOCK.map((tipo) => tipo.codigo)).toEqual([...CODIGOS_TIPOS])
    } finally {
      await app.cleanup()
    }
  })

  it('la ruta /registrar usa la misma pantalla de registro', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(REGISTRAR_PATH)

    try {
      await waitForUpdates()
      expect(app.currentPath()).toBe(REGISTRAR_PATH)
      expect(
        app.container.querySelector('[data-testid="tipo-actividad-select"]'),
      ).not.toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('sin tipo seleccionado no envía el formulario', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(NUEVA_PATH)

    try {
      await waitForUpdates()

      const form = app.container.querySelector('form')
      await act(async () => {
        form?.requestSubmit()
        await Promise.resolve()
      })

      expect(actividadesApi.registrarActividadFontanero).not.toHaveBeenCalled()
      expect(app.currentPath()).toBe(NUEVA_PATH)
    } finally {
      await app.cleanup()
    }
  })

  it('al elegir Cloración y enviar, POST usa titulo con el nombre del tipo', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(NUEVA_PATH)

    try {
      await waitForUpdates()

      const select = app.container.querySelector(
        '[data-testid="tipo-actividad-select"]',
      ) as HTMLSelectElement
      const form = app.container.querySelector('form')
      await act(async () => {
        changeSelect(select, '6')
        form?.requestSubmit()
        await Promise.resolve()
        await Promise.resolve()
      })

      expect(actividadesApi.registrarActividadFontanero).toHaveBeenCalledWith({
        titulo: 'Cloración',
      })
      expect(app.currentPath()).toBe(HOME_PATH)
      expect(app.container.innerHTML).toContain(
        'Actividad registrada correctamente: Cloración',
      )
    } finally {
      await app.cleanup()
    }
  })

  it('incluye descripcion y ubicacion opcionales en el POST', async () => {
    loginAsFontanero()
    const app = await mountAppRoutes(NUEVA_PATH)

    try {
      await waitForUpdates()

      const select = app.container.querySelector(
        '[data-testid="tipo-actividad-select"]',
      ) as HTMLSelectElement
      const descripcion = app.container.querySelector(
        '[data-testid="actividad-descripcion"]',
      ) as HTMLTextAreaElement
      const ubicacion = app.container.querySelector(
        '[data-testid="actividad-ubicacion"]',
      ) as HTMLInputElement

      await act(async () => {
        changeSelect(select, '1')
        setInputValue(descripcion, 'Revisión en sector norte')
        setInputValue(ubicacion, 'Sector 3')
        await Promise.resolve()
      })

      const form = app.container.querySelector('form')
      await act(async () => {
        form?.requestSubmit()
        await Promise.resolve()
      })

      expect(actividadesApi.registrarActividadFontanero).toHaveBeenCalledWith({
        titulo: 'Control de fugas',
        descripcion: 'Revisión en sector norte',
        ubicacion: 'Sector 3',
      })
    } finally {
      await app.cleanup()
    }
  })

  it('muestra estado de carga del catálogo', async () => {
    let resolveTipos: (value: actividadesApi.TiposActividadFontaneroListado) => void
    vi.spyOn(actividadesApi, 'getTiposActividadFontanero').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveTipos = resolve
        }),
    )

    loginAsFontanero()
    const app = await mountAppRoutes(NUEVA_PATH)

    try {
      expect(
        app.container.querySelector('[data-testid="tipos-actividad-loading"]'),
      ).not.toBeNull()
      expect(
        app.container.querySelector('[data-testid="tipo-actividad-select"]'),
      ).toBeNull()

      await act(async () => {
        resolveTipos!({ data: TIPOS_MOCK, total: TIPOS_MOCK.length })
        await Promise.resolve()
      })

      expect(
        app.container.querySelector('[data-testid="tipos-actividad-loading"]'),
      ).toBeNull()
      expect(
        app.container.querySelector('[data-testid="tipo-actividad-select"]'),
      ).not.toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('muestra error del catálogo y permite reintentar', async () => {
    const getTiposMock = vi
      .spyOn(actividadesApi, 'getTiposActividadFontanero')
      .mockRejectedValueOnce(new Error('HTTP 500'))
      .mockResolvedValueOnce({ data: TIPOS_MOCK, total: TIPOS_MOCK.length })

    loginAsFontanero()
    const app = await mountAppRoutes(NUEVA_PATH)

    try {
      await waitForUpdates()

      expect(app.container.innerHTML).toContain(
        'No se pudieron cargar los tipos de actividad.',
      )

      const retry = app.container.querySelector(
        '[data-testid="tipos-actividad-reintentar"]',
      ) as HTMLButtonElement
      await act(async () => {
        retry.click()
        await Promise.resolve()
      })

      expect(getTiposMock).toHaveBeenCalledTimes(2)
      expect(
        app.container.querySelector('[data-testid="tipo-actividad-select"]'),
      ).not.toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('muestra los tipos respetando el orden del catálogo', async () => {
    vi.spyOn(actividadesApi, 'getTiposActividadFontanero').mockResolvedValue({
      data: [...TIPOS_MOCK].reverse(),
      total: TIPOS_MOCK.length,
    })

    loginAsFontanero()
    const app = await mountAppRoutes(NUEVA_PATH)

    try {
      await waitForUpdates()

      const options = Array.from(
        app.container.querySelectorAll('[data-testid="tipo-actividad-select"] option'),
      )
        .slice(1)
        .map((option) => option.textContent)

      expect(options).toEqual(TIPOS_MOCK.map((tipo) => tipo.nombre))
    } finally {
      await app.cleanup()
    }
  })

  it('muestra catálogo vacío sin selector ni envío', async () => {
    vi.spyOn(actividadesApi, 'getTiposActividadFontanero').mockResolvedValue({
      data: [],
      total: 0,
    })

    loginAsFontanero()
    const app = await mountAppRoutes(NUEVA_PATH)

    try {
      await waitForUpdates()

      expect(
        app.container.querySelector('[data-testid="tipos-actividad-vacio"]'),
      ).not.toBeNull()
      expect(
        app.container.querySelector('[data-testid="tipo-actividad-select"]'),
      ).toBeNull()
      expect(
        (app.container.querySelector('[data-testid="registrar-actividad-submit"]') as HTMLButtonElement)
          .disabled,
      ).toBe(true)
    } finally {
      await app.cleanup()
    }
  })

  it('401 al cargar catálogo redirige a login', async () => {
    vi.spyOn(actividadesApi, 'getTiposActividadFontanero').mockRejectedValue(
      new Error('HTTP 401'),
    )

    loginAsFontanero()
    const app = await mountAppRoutes(NUEVA_PATH)

    try {
      await waitForUpdates()
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
    } finally {
      await app.cleanup()
    }
  })

  it('401 al registrar redirige a login', async () => {
    vi.spyOn(actividadesApi, 'registrarActividadFontanero').mockRejectedValue(
      new Error('HTTP 401'),
    )

    loginAsFontanero()
    const app = await mountAppRoutes(NUEVA_PATH)

    try {
      await waitForUpdates()

      const select = app.container.querySelector(
        '[data-testid="tipo-actividad-select"]',
      ) as HTMLSelectElement
      const form = app.container.querySelector('form')
      await act(async () => {
        changeSelect(select, '6')
        form?.requestSubmit()
        await Promise.resolve()
        await Promise.resolve()
      })

      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
    } finally {
      await app.cleanup()
    }
  })

  it('403 al registrar redirige a acceso denegado', async () => {
    vi.spyOn(actividadesApi, 'registrarActividadFontanero').mockRejectedValue(
      new Error('HTTP 403'),
    )

    loginAsFontanero()
    const app = await mountAppRoutes(NUEVA_PATH)

    try {
      await waitForUpdates()

      const select = app.container.querySelector(
        '[data-testid="tipo-actividad-select"]',
      ) as HTMLSelectElement
      const form = app.container.querySelector('form')
      await act(async () => {
        changeSelect(select, '6')
        form?.requestSubmit()
        await Promise.resolve()
        await Promise.resolve()
      })

      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
    } finally {
      await app.cleanup()
    }
  })

  it('sin sesión redirige a login', async () => {
    const app = await mountAppRoutes(NUEVA_PATH)

    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
    } finally {
      await app.cleanup()
    }
  })

  it('Administradora recibe acceso denegado', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes(NUEVA_PATH)

    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
    } finally {
      await app.cleanup()
    }
  })
})
