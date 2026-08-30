import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAccessToken,
  isAuthenticated,
} from '../../auth/utils/authStorage'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/publicRoutes'

const forbiddenResponse = {
  ok: false,
  status: 403,
  statusText: 'Forbidden',
  text: async () => '{"message":"Acceso denegado"}',
}

const notFoundResponse = {
  ok: false,
  status: 404,
  statusText: 'Not Found',
  text: async () => '{"message":"Proyecto no encontrado"}',
}

const detalle = {
  id: 7,
  nombre: 'Red de agua potable',
  descripcion: 'Red principal',
  encargadoRealizacion: 'Ing. María',
  duracion: '8 meses',
  estado: 'EN_PROCESO',
  imagenPrincipal: null,
  activo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  imagenes: [],
}

const flush = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
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
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

const fillCreateForm = (container: HTMLElement) => {
  setInputValue(
    container.querySelector('#proyectos-form-nombre') as HTMLInputElement,
    'Obra Norte',
  )
  setInputValue(
    container.querySelector('#proyectos-form-encargado') as HTMLInputElement,
    'Ing. María',
  )
  setInputValue(
    container.querySelector('#proyectos-form-duracion') as HTMLInputElement,
    '8 meses',
  )
  const estado = container.querySelector(
    '#proyectos-form-estado',
  ) as HTMLSelectElement
  estado.value = 'PENDIENTE'
  estado.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('Proyectos admin — 403 Acceso denegado y 404 de recurso', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('listado 403 usa Acceso denegado y no cierra la sesión', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(forbiddenResponse))

    const app = await mountAppRoutes('/admin/proyectos')
    try {
      await flush()
      expect(isAuthenticated()).toBe(true)
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.container.textContent).toContain('Acceso denegado')
      expect(app.container.textContent).not.toContain('Iniciar sesión')
    } finally {
      await app.cleanup()
    }
  })

  it('detalle 403 no se trata como sesión expirada', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(forbiddenResponse))

    const app = await mountAppRoutes('/admin/proyectos/7')
    try {
      await flush()
      expect(isAuthenticated()).toBe(true)
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.textContent).toContain('Acceso denegado')
    } finally {
      await app.cleanup()
    }
  })

  it('registro POST 403 reutiliza Acceso denegado sin logout', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(forbiddenResponse))

    const app = await mountAppRoutes('/admin/proyectos/nuevo')
    try {
      await flush()
      fillCreateForm(app.container)
      await act(async () => {
        app.container.querySelector('.gallery-admin__form')?.requestSubmit()
      })
      await flush()

      expect(isAuthenticated()).toBe(true)
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.container.textContent).toContain('Acceso denegado')
    } finally {
      await app.cleanup()
    }
  })

  it('edición PATCH 403 no ejecuta logout', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => detalle,
        })
        .mockResolvedValue(forbiddenResponse),
    )

    const app = await mountAppRoutes('/admin/proyectos/7/editar')
    try {
      await flush()
      await act(async () => {
        app.container.querySelector('.gallery-admin__form')?.requestSubmit()
      })
      await flush()

      expect(isAuthenticated()).toBe(true)
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.container.textContent).toContain('Acceso denegado')
    } finally {
      await app.cleanup()
    }
  })

  it('detalle GET 404 muestra que el proyecto no existe', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(notFoundResponse))

    const app = await mountAppRoutes('/admin/proyectos/99')
    try {
      await flush()
      expect(isAuthenticated()).toBe(true)
      expect(app.currentPath()).toBe('/admin/proyectos/99')
      expect(app.container.textContent).toContain('El proyecto no existe.')
      expect(app.container.querySelector('.proyectos-admin__detail')).toBeNull()
      expect(app.container.textContent).not.toContain('HTTP 404')
      expect(app.container.textContent).not.toContain('Acceso denegado')
    } finally {
      await app.cleanup()
    }
  })

  it('edición GET 404 no muestra un formulario vacío', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(notFoundResponse))

    const app = await mountAppRoutes('/admin/proyectos/99/editar')
    try {
      await flush()
      expect(app.currentPath()).toBe('/admin/proyectos/99/editar')
      expect(app.container.textContent).toContain('El proyecto no existe.')
      expect(app.container.querySelector('#proyectos-form-nombre')).toBeNull()
      expect(app.container.textContent).not.toContain('Editar proyecto')
    } finally {
      await app.cleanup()
    }
  })

  it('PATCH 404 comunica que el proyecto ya no existe y oculta el formulario', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => detalle,
        })
        .mockResolvedValue(notFoundResponse),
    )

    const app = await mountAppRoutes('/admin/proyectos/7/editar')
    try {
      await flush()
      expect(app.container.querySelector('#proyectos-form-nombre')).not.toBeNull()

      await act(async () => {
        app.container.querySelector('.gallery-admin__form')?.requestSubmit()
      })
      await flush()

      expect(isAuthenticated()).toBe(true)
      expect(app.currentPath()).toBe('/admin/proyectos/7/editar')
      expect(app.container.textContent).toContain('El proyecto no existe.')
      expect(app.container.querySelector('#proyectos-form-nombre')).toBeNull()
      expect(app.container.textContent).not.toContain('HTTP 404')
    } finally {
      await app.cleanup()
    }
  })
})
