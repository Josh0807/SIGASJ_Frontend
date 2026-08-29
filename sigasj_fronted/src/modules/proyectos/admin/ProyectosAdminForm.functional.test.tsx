import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../auth/components/AuthContext'
import { clearAccessToken } from '../../auth/utils/authStorage'
import { loginWithAdminSession } from '../../../test/authTestHelpers'
import { setViewportWidth } from '../../../test/viewportHelpers'
import AppRoutes from '../../../app/router/AppRoutes'
import {
  PROYECTOS_ADMIN_NEW_PATH,
  PROYECTOS_ADMIN_PATH,
  PROYECTOS_ADMIN_PENDING_INTEGRATIONS,
  proyectosAdminEditPath,
} from './proyectosAdminPaths'
import { PROYECTO_ESTADO_UPDATE_PENDING } from '../types/estadoProyecto'
import type {
  AdminProyecto,
  AdminProyectoDetalle,
  ProyectosAdminListado,
  ProyectoFormValues,
} from './types'
import * as proyectosApi from '../services/proyectosApi'
import {
  toCreateProyectoPayload,
  toUpdateProyectoPayload,
} from '../services/proyectosApi'

const cssPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../index.css',
)

const LocationProbe = ({ onPath }: { onPath: (path: string) => void }) => {
  const location = useLocation()

  useEffect(() => {
    onPath(location.pathname)
  }, [location.pathname, onPath])

  return null
}

const proyecto = (overrides: Partial<AdminProyecto> = {}): AdminProyecto => ({
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
  ...overrides,
})

const detalle = (
  overrides: Partial<AdminProyectoDetalle> = {},
): AdminProyectoDetalle => ({
  ...proyecto(),
  imagenes: [],
  ...overrides,
})

const listado = (data: AdminProyecto[]): ProyectosAdminListado => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: 1,
})

const createdProyecto = proyecto({
  id: 21,
  nombre: 'Ampliación de Acueducto',
  descripcion: 'Red principal',
  encargadoRealizacion: 'Ing. María',
  duracion: '8 meses',
  estado: 'PENDIENTE',
  activo: false,
})

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

const captureConsole = () => {
  const errors: unknown[] = []
  const warnings: unknown[] = []
  const originalError = console.error
  const originalWarn = console.warn

  console.error = (...args: unknown[]) => {
    errors.push(args)
  }
  console.warn = (...args: unknown[]) => {
    warnings.push(args)
  }

  return {
    errors,
    warnings,
    restore: () => {
      console.error = originalError
      console.warn = originalWarn
    },
  }
}

const clickElement = async (element: Element) => {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    button: 0,
  })

  await act(async () => {
    element.dispatchEvent(event)
  })

  return event
}

describe('Pruebas funcionales — ProyectoForm', () => {
  let container: HTMLDivElement
  let root: Root
  const originalMatchMedia = window.matchMedia
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    vi.spyOn(proyectosApi, 'getAdminProyectos').mockResolvedValue(
      listado([proyecto()]),
    )
    vi.spyOn(proyectosApi, 'getAdminProyecto').mockResolvedValue(detalle())
    vi.spyOn(proyectosApi, 'createAdminProyecto').mockResolvedValue(createdProyecto)
    vi.spyOn(proyectosApi, 'updateAdminProyecto').mockResolvedValue(
      detalle({ nombre: 'Ampliación de Acueducto' }),
    )
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    clearAccessToken()
    loginWithAdminSession()
    setViewportWidth(1280)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    window.matchMedia = originalMatchMedia
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: originalInnerWidth,
    })
    vi.useRealTimers()
    vi.restoreAllMocks()
    clearAccessToken()
  })

  const flush = async () => {
    await act(async () => {
      await Promise.resolve()
    })
  }

  const renderApp = async (path: string) => {
    let pathname = path

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[path]}>
          <LocationProbe
            onPath={(nextPath) => {
              pathname = nextPath
            }}
          />
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </MemoryRouter>,
      )
    })
    await flush()

    return {
      currentPath: () => pathname,
    }
  }

  const field = (id: string) => container.querySelector(id) as HTMLElement
  const input = (id: string) => container.querySelector(id) as HTMLInputElement
  const textarea = (id: string) =>
    container.querySelector(id) as HTMLTextAreaElement
  const select = (id: string) =>
    container.querySelector(id) as HTMLSelectElement
  const submitButton = () =>
    Array.from(container.querySelectorAll('button')).find(
      (button) => button.getAttribute('type') === 'submit',
    ) as HTMLButtonElement
  const linkNamed = (label: string) =>
    Array.from(container.querySelectorAll('a')).find(
      (item) => item.textContent === label,
    ) as HTMLAnchorElement

  const fillCreateForm = async (
    values: Partial<ProyectoFormValues> & { estado: ProyectoFormValues['estado'] },
  ) => {
    await act(async () => {
      setInputValue(input('#proyectos-form-nombre'), values.nombre ?? 'Ampliación de Acueducto')
      setInputValue(
        textarea('#proyectos-form-descripcion'),
        values.descripcion ?? 'Red principal',
      )
      setInputValue(
        input('#proyectos-form-encargado'),
        values.encargadoRealizacion ?? 'Ing. María',
      )
      setInputValue(input('#proyectos-form-duracion'), values.duracion ?? '8 meses')
      changeSelect(select('#proyectos-form-estado'), values.estado)
    })
  }

  const submittedCreate = () =>
    vi.mocked(proyectosApi.createAdminProyecto).mock.calls[0]?.[0]
  const submittedUpdate = () =>
    vi.mocked(proyectosApi.updateAdminProyecto).mock.calls[0]

  it('Prueba 1 — Registro: abrir nuevo proyecto muestra los campos vacíos', async () => {
    const app = await renderApp(PROYECTOS_ADMIN_PATH)
    const sidebar = container.querySelector('.admin-sidebar')
    const header = container.querySelector('.admin-header')

    await clickElement(linkNamed('Nuevo proyecto'))
    await flush()

    expect(app.currentPath()).toBe(PROYECTOS_ADMIN_NEW_PATH)
    expect(container.querySelector('.admin-layout')).not.toBeNull()
    expect(container.querySelector('.admin-sidebar')).toBe(sidebar)
    expect(container.querySelector('.admin-header')).toBe(header)
    expect(container.querySelector('.admin-main__content')).not.toBeNull()
    expect(container.textContent).toContain('Nuevo proyecto')
    expect(container.querySelector('.proyectos-admin__form')).not.toBeNull()
    expect(container.querySelector('label[for="proyectos-form-nombre"]')?.textContent).toContain(
      'Nombre del proyecto',
    )
    expect(container.querySelector('label[for="proyectos-form-descripcion"]')?.textContent).toContain(
      'Descripción',
    )
    expect(container.querySelector('label[for="proyectos-form-encargado"]')?.textContent).toContain(
      'Encargado de realización',
    )
    expect(container.querySelector('label[for="proyectos-form-duracion"]')?.textContent).toContain(
      'Duración',
    )
    expect(container.querySelector('label[for="proyectos-form-estado"]')?.textContent).toContain(
      'Estado',
    )
    expect(input('#proyectos-form-nombre').value).toBe('')
    expect(textarea('#proyectos-form-descripcion').value).toBe('')
    expect(input('#proyectos-form-encargado').value).toBe('')
    expect(input('#proyectos-form-duracion').value).toBe('')
    expect(select('#proyectos-form-estado').value).toBe('')
    expect(select('#proyectos-form-estado').disabled).toBe(false)
    expect(container.textContent).toContain('Pendiente')
    expect(container.textContent).toContain('En proceso')
    expect(container.textContent).toContain('Completado')
    expect(proyectosApi.createAdminProyecto).not.toHaveBeenCalled()
  })

  it('Prueba 2 — Registro: enviar vacío muestra errores y no llama al Backend', async () => {
    await renderApp(PROYECTOS_ADMIN_NEW_PATH)

    await act(async () => {
      container.querySelector('form')?.requestSubmit()
    })

    expect(proyectosApi.createAdminProyecto).not.toHaveBeenCalled()
    expect(container.querySelector('.proyectos-admin__form')).not.toBeNull()
    expect(container.textContent).toContain('El nombre del proyecto es obligatorio.')
    expect(input('#proyectos-form-nombre').getAttribute('aria-invalid')).toBe('true')
    expect(input('#proyectos-form-nombre').getAttribute('aria-describedby')).toBe(
      'proyectos-form-nombre-error',
    )
    expect(field('#proyectos-form-nombre-error')?.getAttribute('role')).toBe('alert')
    expect(submitButton().disabled).toBe(false)

    await act(async () => {
      setInputValue(input('#proyectos-form-nombre'), 'Obra Norte')
      container.querySelector('form')?.requestSubmit()
    })
    expect(container.textContent).toContain('Debe indicar el encargado.')

    await act(async () => {
      setInputValue(input('#proyectos-form-encargado'), 'Ing. María')
      container.querySelector('form')?.requestSubmit()
    })
    expect(container.textContent).toContain('La duración es obligatoria.')

    await act(async () => {
      setInputValue(input('#proyectos-form-duracion'), '8 meses')
      container.querySelector('form')?.requestSubmit()
    })
    expect(container.textContent).toContain('Seleccione un estado válido.')
    expect(select('#proyectos-form-estado').getAttribute('aria-invalid')).toBe('true')
    expect(proyectosApi.createAdminProyecto).not.toHaveBeenCalled()
  })

  it('Prueba 3 — Registro: un POST válido guarda y vuelve al listado', async () => {
    const app = await renderApp(PROYECTOS_ADMIN_NEW_PATH)

    await fillCreateForm({ estado: 'PENDIENTE' })
    await act(async () => {
      container.querySelector('form')?.requestSubmit()
    })
    await flush()

    expect(proyectosApi.createAdminProyecto).toHaveBeenCalledTimes(1)
    expect(submittedCreate()).toEqual({
      nombre: 'Ampliación de Acueducto',
      descripcion: 'Red principal',
      encargadoRealizacion: 'Ing. María',
      duracion: '8 meses',
      estado: 'PENDIENTE',
      imagenPrincipalUrl: null,
    })
    expect(toCreateProyectoPayload(submittedCreate()!)).toEqual({
      nombre: 'Ampliación de Acueducto',
      descripcion: 'Red principal',
      encargadoRealizacion: 'Ing. María',
      duracion: '8 meses',
      estado: 'PENDIENTE',
    })
    expect(app.currentPath()).toBe(PROYECTOS_ADMIN_PATH)
    expect(container.querySelector('.proyectos-admin__form')).toBeNull()
    expect(container.textContent).toContain('Gestión de Proyectos')
    expect(proyectosApi.getAdminProyectos).toHaveBeenCalledTimes(1)
    expect(proyectosApi.updateAdminProyecto).not.toHaveBeenCalled()
  })

  it('Prueba 4 — Registro: cada estado visible se envía con el valor del Backend', async () => {
    const casos = [
      { label: 'Pendiente', value: 'PENDIENTE' },
      { label: 'En proceso', value: 'EN_PROCESO' },
      { label: 'Completado', value: 'COMPLETADO' },
    ] as const

    for (const caso of casos) {
      vi.mocked(proyectosApi.createAdminProyecto).mockClear()
      await renderApp(PROYECTOS_ADMIN_NEW_PATH)

      const option = Array.from(select('#proyectos-form-estado').options).find(
        (item) => item.textContent === caso.label,
      )
      expect(option?.value).toBe(caso.value)

      await fillCreateForm({ estado: caso.value })
      await act(async () => {
        container.querySelector('form')?.requestSubmit()
      })

      expect(proyectosApi.createAdminProyecto).toHaveBeenCalledTimes(1)
      expect(submittedCreate()?.estado).toBe(caso.value)
      expect(toCreateProyectoPayload(submittedCreate()!).estado).toBe(caso.value)
      expect(JSON.stringify(toCreateProyectoPayload(submittedCreate()!))).not.toContain(
        caso.label,
      )

      await act(async () => {
        root.unmount()
      })
      root = createRoot(container)
    }
  })

  it('Prueba 5 — Edición: abre un proyecto existente y carga los datos reales', async () => {
    const app = await renderApp(PROYECTOS_ADMIN_PATH)

    await clickElement(
      container.querySelector(
        '[aria-label="Editar Red de agua potable"]',
      ) as HTMLAnchorElement,
    )
    await flush()

    expect(app.currentPath()).toBe(proyectosAdminEditPath(7))
    expect(proyectosApi.getAdminProyecto).toHaveBeenCalledTimes(1)
    expect(proyectosApi.getAdminProyecto).toHaveBeenCalledWith(7)
    expect(container.textContent).toContain('Editar proyecto')
    expect(input('#proyectos-form-nombre').value).toBe('Red de agua potable')
    expect(textarea('#proyectos-form-descripcion').value).toBe('Red principal')
    expect(input('#proyectos-form-encargado').value).toBe('Ing. María')
    expect(input('#proyectos-form-duracion').value).toBe('8 meses')
    expect(select('#proyectos-form-estado').value).toBe('EN_PROCESO')
    expect(container.innerHTML).not.toContain('undefined')
    expect(container.innerHTML).not.toContain('null')
  })

  it('Prueba 6 — Edición: cambiar solo el nombre conserva el resto', async () => {
    await renderApp(proyectosAdminEditPath(7))

    await act(async () => {
      setInputValue(input('#proyectos-form-nombre'), 'Ampliación Norte')
      container.querySelector('form')?.requestSubmit()
    })

    expect(proyectosApi.updateAdminProyecto).toHaveBeenCalledTimes(1)
    const [, values] = submittedUpdate()!
    expect(values).toEqual({
      nombre: 'Ampliación Norte',
      descripcion: 'Red principal',
      encargadoRealizacion: 'Ing. María',
      duracion: '8 meses',
      estado: 'EN_PROCESO',
      imagenPrincipalUrl: null,
    })
    expect(toUpdateProyectoPayload(values)).toEqual({
      nombre: 'Ampliación Norte',
      descripcion: 'Red principal',
      encargadoRealizacion: 'Ing. María',
      duracion: '8 meses',
    })
  })

  it('Prueba 7 — Edición: varios campos persisten en el PATCH permitido', async () => {
    const app = await renderApp(proyectosAdminEditPath(7))

    await act(async () => {
      setInputValue(input('#proyectos-form-nombre'), 'Tanque elevado')
      setInputValue(textarea('#proyectos-form-descripcion'), 'Obra de almacenamiento')
      setInputValue(input('#proyectos-form-encargado'), 'Ing. Carlos')
      setInputValue(input('#proyectos-form-duracion'), '12 meses')
      container.querySelector('form')?.requestSubmit()
    })
    await flush()

    expect(proyectosApi.updateAdminProyecto).toHaveBeenCalledTimes(1)
    const [id, values] = submittedUpdate()!
    expect(id).toBe(7)
    expect(values).toEqual({
      nombre: 'Tanque elevado',
      descripcion: 'Obra de almacenamiento',
      encargadoRealizacion: 'Ing. Carlos',
      duracion: '12 meses',
      estado: 'EN_PROCESO',
      imagenPrincipalUrl: null,
    })
    expect(toUpdateProyectoPayload(values)).toEqual({
      nombre: 'Tanque elevado',
      descripcion: 'Obra de almacenamiento',
      encargadoRealizacion: 'Ing. Carlos',
      duracion: '12 meses',
    })
    expect(app.currentPath()).toBe(PROYECTOS_ADMIN_PATH)
    expect(container.querySelector('.proyectos-admin__form')).toBeNull()
  })

  it('Prueba 8 — Edición: el estado se muestra pero no viaja en el PATCH general', async () => {
    await renderApp(proyectosAdminEditPath(7))

    const estado = select('#proyectos-form-estado')
    expect(PROYECTO_ESTADO_UPDATE_PENDING).toBe(true)
    expect(PROYECTOS_ADMIN_PENDING_INTEGRATIONS).toEqual(['cambio-estado'])
    expect(estado.value).toBe('EN_PROCESO')
    expect(estado.disabled).toBe(true)
    expect(container.textContent).toContain(
      'El cambio de estado de ejecución todavía no está disponible.',
    )
    expect(estado.getAttribute('aria-describedby')).toContain(
      'proyectos-form-estado-pending',
    )

    await act(async () => {
      container.querySelector('form')?.requestSubmit()
    })

    const [, values] = submittedUpdate()!
    const payload = toUpdateProyectoPayload(values)
    expect(payload).not.toHaveProperty('estado')
    expect(JSON.stringify(payload)).not.toContain('estado')
    expect(JSON.stringify(payload)).not.toContain('EN_PROCESO')
    expect(JSON.stringify(payload)).not.toContain('/estado')
    expect(proyectosApi.updateAdminProyecto).toHaveBeenCalledTimes(1)
    expect(proyectosApi.createAdminProyecto).not.toHaveBeenCalled()
  })

  it('Prueba 9 — Edición: proyecto inexistente muestra 404 y no deja el formulario vacío', async () => {
    vi.mocked(proyectosApi.getAdminProyecto).mockRejectedValueOnce(
      new Error('HTTP 404: Proyecto no encontrado'),
    )

    const app = await renderApp(proyectosAdminEditPath(99))

    expect(app.currentPath()).toBe(proyectosAdminEditPath(99))
    expect(proyectosApi.getAdminProyecto).toHaveBeenCalledWith(99)
    expect(container.textContent).toContain('El proyecto no existe.')
    expect(container.querySelector('.proyectos-admin__form')).toBeNull()
    expect(container.querySelector('#proyectos-form-nombre')).toBeNull()
    expect(container.textContent).not.toContain('Editar proyecto')
    expect(container.textContent).not.toContain('HTTP 404')
    expect(proyectosApi.updateAdminProyecto).not.toHaveBeenCalled()
  })

  it('Prueba 10 — Doble envío: un solo POST al hacer doble clic en Guardar', async () => {
    let resolveCreate: ((value: AdminProyecto) => void) | undefined
    vi.mocked(proyectosApi.createAdminProyecto).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve
        }),
    )

    await renderApp(PROYECTOS_ADMIN_NEW_PATH)
    await fillCreateForm({ estado: 'PENDIENTE' })

    const guardar = submitButton()
    await act(async () => {
      guardar.click()
      guardar.click()
      container.querySelector('form')?.requestSubmit()
    })

    expect(proyectosApi.createAdminProyecto).toHaveBeenCalledTimes(1)
    expect(guardar.disabled).toBe(true)
    expect(guardar.textContent).toBe('Guardando…')
    expect(container.querySelector('form')?.getAttribute('aria-busy')).toBe('true')

    await act(async () => {
      resolveCreate?.(createdProyecto)
    })
    await flush()

    expect(proyectosApi.createAdminProyecto).toHaveBeenCalledTimes(1)
  })

  it('Prueba 11 — Error de Backend: mensaje comprensible y formulario recuperable', async () => {
    vi.mocked(proyectosApi.createAdminProyecto)
      .mockRejectedValueOnce(new Error('HTTP 500: QueryFailedError SELECT * FROM proyectos'))
      .mockResolvedValueOnce(createdProyecto)

    const app = await renderApp(PROYECTOS_ADMIN_NEW_PATH)
    await fillCreateForm({ estado: 'COMPLETADO' })

    await act(async () => {
      container.querySelector('form')?.requestSubmit()
    })

    expect(container.querySelector('.proyectos-admin__form')).not.toBeNull()
    expect(container.textContent).toContain(
      'No fue posible guardar los cambios. Intente nuevamente.',
    )
    expect(container.textContent).not.toContain('QueryFailedError')
    expect(container.textContent).not.toContain('SELECT')
    expect(container.textContent).not.toContain('HTTP 500')
    expect(container.querySelector('#proyectos-form-error')?.getAttribute('role')).toBe(
      'alert',
    )
    expect(container.querySelector('form')?.getAttribute('aria-describedby')).toBe(
      'proyectos-form-error',
    )
    expect(submitButton().disabled).toBe(false)
    expect(submitButton().textContent).toBe('Guardar')
    expect(input('#proyectos-form-nombre').value).toBe('Ampliación de Acueducto')
    expect(select('#proyectos-form-estado').value).toBe('COMPLETADO')

    await act(async () => {
      container.querySelector('form')?.requestSubmit()
    })
    await flush()

    expect(proyectosApi.createAdminProyecto).toHaveBeenCalledTimes(2)
    expect(app.currentPath()).toBe(PROYECTOS_ADMIN_PATH)
  })

  it('Responsive: el formulario es usable en desktop, tablet y celular', async () => {
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('.proyectos-admin__form')
    expect(css).toContain('.proyectos-admin__form-row')
    expect(css).toContain('.proyectos-admin__form-actions')
    expect(css).toContain('min-height: 9.5rem')
    expect(css).toContain('min-height: 44px')
    expect(css).toContain('@media (max-width: 1199px)')
    expect(css).toContain('@media (max-width: 760px)')
    expect(css).toContain('textarea:focus-visible')

    for (const width of [1280, 900, 390] as const) {
      setViewportWidth(width)
      await renderApp(PROYECTOS_ADMIN_NEW_PATH)

      expect(container.querySelector('.admin-layout')).not.toBeNull()
      expect(container.querySelector('.proyectos-admin__form')).not.toBeNull()
      expect(input('#proyectos-form-nombre')).not.toBeNull()
      expect(textarea('#proyectos-form-descripcion')).not.toBeNull()
      expect(textarea('#proyectos-form-descripcion').getAttribute('rows')).toBe('6')
      expect(input('#proyectos-form-encargado')).not.toBeNull()
      expect(input('#proyectos-form-duracion')).not.toBeNull()
      expect(select('#proyectos-form-estado')).not.toBeNull()
      expect(
        container.querySelector('label[for="proyectos-form-nombre"]')?.textContent,
      ).toContain('Nombre del proyecto')
      expect(
        container.querySelector('label[for="proyectos-form-descripcion"]')?.textContent,
      ).toContain('Descripción')
      expect(submitButton()).not.toBeNull()
      expect(submitButton().textContent).toBe('Guardar')
      expect(
        Array.from(container.querySelectorAll('button')).some(
          (button) => button.textContent === 'Cancelar',
        ),
      ).toBe(true)

      await act(async () => {
        root.unmount()
      })
      root = createRoot(container)
    }
  })

  it('Teclado: Tab, select, textarea, Guardar y errores accesibles', async () => {
    await renderApp(PROYECTOS_ADMIN_NEW_PATH)

    const nombre = input('#proyectos-form-nombre')
    const descripcion = textarea('#proyectos-form-descripcion')
    const encargado = input('#proyectos-form-encargado')
    const duracion = input('#proyectos-form-duracion')
    const estado = select('#proyectos-form-estado')
    const cancelar = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Cancelar',
    ) as HTMLButtonElement
    const guardar = submitButton()

    for (const control of [nombre, descripcion, encargado, duracion, estado, cancelar, guardar]) {
      expect(control.tabIndex).toBeGreaterThanOrEqual(0)
      control.focus()
      expect(document.activeElement).toBe(control)
    }

    await act(async () => {
      setInputValue(descripcion, 'Red principal del acueducto')
      changeSelect(estado, 'EN_PROCESO')
    })
    expect(descripcion.value).toBe('Red principal del acueducto')
    expect(estado.value).toBe('EN_PROCESO')

    await act(async () => {
      guardar.focus()
      guardar.click()
    })

    expect(proyectosApi.createAdminProyecto).not.toHaveBeenCalled()
    expect(nombre.getAttribute('aria-invalid')).toBe('true')
    expect(nombre.getAttribute('aria-describedby')).toBe('proyectos-form-nombre-error')
    expect(field('#proyectos-form-nombre-error')?.getAttribute('role')).toBe('alert')
    expect(document.activeElement).toBe(guardar)
  })

  it('Consola: sin errores de React, keys, rutas ni solicitudes duplicadas', async () => {
    const createProbe = captureConsole()

    try {
      await renderApp(PROYECTOS_ADMIN_NEW_PATH)

      expect(proyectosApi.createAdminProyecto).not.toHaveBeenCalled()
      expect(proyectosApi.updateAdminProyecto).not.toHaveBeenCalled()
      expect(proyectosApi.getAdminProyecto).not.toHaveBeenCalled()
      expect(createProbe.errors).toEqual([])
      expect(createProbe.warnings).toEqual([])
      expect(container.innerHTML).not.toContain('Warning: Each child in a list')
      expect(container.innerHTML).not.toContain('uncontrolled')
      expect(container.innerHTML).not.toContain('No routes matched')
    } finally {
      createProbe.restore()
    }

    const editProbe = captureConsole()

    try {
      await act(async () => {
        root.unmount()
      })
      root = createRoot(container)
      await renderApp(proyectosAdminEditPath(7))

      expect(proyectosApi.getAdminProyecto).toHaveBeenCalledTimes(1)
      expect(proyectosApi.updateAdminProyecto).not.toHaveBeenCalled()
      expect(input('#proyectos-form-nombre').value).toBe('Red de agua potable')
      expect(editProbe.errors).toEqual([])
      expect(editProbe.warnings).toEqual([])
      expect(container.innerHTML).not.toContain('Warning: Each child in a list')
      expect(container.innerHTML).not.toContain('uncontrolled')
      expect(container.innerHTML).not.toContain('No routes matched')
    } finally {
      editProbe.restore()
    }
  })
})
