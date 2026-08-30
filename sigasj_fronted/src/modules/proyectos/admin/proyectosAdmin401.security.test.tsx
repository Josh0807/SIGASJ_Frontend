import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAccessToken,
  isAuthenticated,
} from '../../auth/utils/authStorage'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import { LOGIN_ROUTE_PATH } from '../../../app/router/publicRoutes'

const unauthorizedResponse = {
  ok: false,
  status: 401,
  statusText: 'Unauthorized',
  text: async () => '',
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

const stubUnauthorizedFetch = () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(unauthorizedResponse),
  )
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

describe('Proyectos admin — 401 reutiliza la sesión global', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('no agrega un segundo navigate a login en las pantallas de Proyectos', () => {
    const files = [
      'ProyectosAdminPage.tsx',
      'ProyectosAdminCreatePage.tsx',
      'ProyectosAdminEditPage.tsx',
      'ProyectosAdminDetailPage.tsx',
      'ProyectosAdminForm.tsx',
    ]

    for (const file of files) {
      const source = readFileSync(
        resolve(process.cwd(), 'src/modules/proyectos/admin', file),
        'utf8',
      )
      expect(source).not.toContain('LOGIN_ROUTE_PATH')
      expect(source).not.toContain("'/login'")
    }
  })

  it('listado: 401 invalida la sesión, redirige a login y vuelve a bloquear la ruta', async () => {
    loginAsRole('Administradora')
    stubUnauthorizedFetch()

    const app = await mountAppRoutes('/admin/proyectos')
    try {
      await flush()
      expect(isAuthenticated()).toBe(false)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.textContent).toContain('Iniciar sesión')
      expect(app.container.textContent).not.toContain('Gestión de Proyectos')
    } finally {
      await app.cleanup()
    }

    const blocked = await mountAppRoutes('/admin/proyectos')
    try {
      expect(isAuthenticated()).toBe(false)
      expect(blocked.currentPath()).toBe(LOGIN_ROUTE_PATH)
    } finally {
      await blocked.cleanup()
    }
  })

  it('detalle: 401 sigue el flujo global de sesión', async () => {
    loginAsRole('Administradora')
    stubUnauthorizedFetch()

    const app = await mountAppRoutes('/admin/proyectos/7')
    try {
      await flush()
      expect(isAuthenticated()).toBe(false)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.textContent).not.toContain('Ampliación')
    } finally {
      await app.cleanup()
    }
  })

  it('registro: POST 401 invalida la sesión y no deja el formulario privado usable', async () => {
    loginAsRole('Administradora')
    stubUnauthorizedFetch()

    const app = await mountAppRoutes('/admin/proyectos/nuevo')
    try {
      await flush()
      expect(app.currentPath()).toBe('/admin/proyectos/nuevo')
      fillCreateForm(app.container)

      await act(async () => {
        app.container.querySelector('.gallery-admin__form')?.requestSubmit()
      })
      await flush()

      expect(isAuthenticated()).toBe(false)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.textContent).toContain('Iniciar sesión')
      expect(app.container.querySelector('#proyectos-form-nombre')).toBeNull()
    } finally {
      await app.cleanup()
    }
  })

  it('edición: PATCH 401 invalida la sesión después de cargar el detalle', async () => {
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
        .mockResolvedValue(unauthorizedResponse),
    )

    const app = await mountAppRoutes('/admin/proyectos/7/editar')
    try {
      await flush()
      expect(app.currentPath()).toBe('/admin/proyectos/7/editar')
      expect(
        (app.container.querySelector('#proyectos-form-nombre') as HTMLInputElement)
          .value,
      ).toBe('Red de agua potable')

      await act(async () => {
        app.container.querySelector('.gallery-admin__form')?.requestSubmit()
      })
      await flush()

      expect(isAuthenticated()).toBe(false)
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
      expect(app.container.querySelector('#proyectos-form-nombre')).toBeNull()
    } finally {
      await app.cleanup()
    }
  })
})
