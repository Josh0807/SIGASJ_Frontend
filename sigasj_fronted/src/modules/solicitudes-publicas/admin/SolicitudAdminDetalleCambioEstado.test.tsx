import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import { clearAccessToken } from '../../auth/utils/authStorage'
import * as adminApi from './solicitudesAdminApi'
import type { SolicitudAdmin } from './solicitudesAdminTypes'

const flushAsync = async () => {
  await act(async () => {
    await Promise.resolve()
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

const setTextareaValue = (el: HTMLTextAreaElement, value: string) => {
  const proto = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value',
  )?.set
  proto?.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

const setSelectValue = (el: HTMLSelectElement, value: string) => {
  el.value = value
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

const solicitud: SolicitudAdmin = {
  id: 15,
  tipoSolicitudId: 1,
  codigoSeguimiento: 'SOL-2026-TEST15',
  estado: 'PENDIENTE',
  fechaIngreso: '2026-10-20T10:00:00.000Z',
  createdAt: '2026-10-20T10:00:00.000Z',
  updatedAt: '2026-10-20T10:00:00.000Z',
  tipoSolicitud: {
    id: 1,
    nombre: 'Solicitud de Arreglo de Pago Domiciliar',
    slug: 'arreglo-pago',
  },
}

describe('Detalle admin — cambio de estado (4.13.2)', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
    vi.spyOn(adminApi, 'getSolicitudAdminDetail').mockResolvedValue({
      ...solicitud,
      detalleFormulario: {},
      documentos: [],
      historial: [],
      camposAdministrativos: {},
    })
    vi.spyOn(adminApi, 'getHistorialSolicitudAdmin').mockResolvedValue([
      {
        id: 1,
        solicitudId: 15,
        estadoAnterior: null,
        estadoNuevo: 'PENDIENTE',
        observacionPublica: null,
        notaInterna: null,
        idUsuario: null,
        usuario: null,
        fecha: '2026-10-20T10:00:00.000Z',
      },
    ])
    vi.spyOn(adminApi, 'cambiarEstadoSolicitudAdmin').mockResolvedValue({
      id: 15,
      solicitudId: 15,
      codigoSeguimiento: 'SOL-2026-TEST15',
      estado: 'EN_REVISION',
      estadoAnterior: 'PENDIENTE',
      estadoNuevo: 'EN_REVISION',
      fechaResolucion: null,
      observacionPublica: 'Mensaje público',
      notaInterna: 'Nota interna',
      idUsuario: 7,
      fecha: '2026-10-24T18:00:00.000Z',
      historialId: 41,
    })
  })

  it('Administradora ve el control y cambia estado solo tras confirmar (sin optimistic)', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes('/admin/solicitudes/15')
    await flushAsync()

    expect(app.container.textContent).toContain('SOL-2026-TEST15')
    expect(app.container.textContent).toContain('Pendiente')
    expect(app.container.textContent).toContain('Cambiar estado')

    const select = app.container.querySelector('select') as HTMLSelectElement
    expect(select).toBeTruthy()
    expect(Array.from(select.options).map((o) => o.value)).not.toContain(
      'PENDIENTE',
    )

    await act(async () => {
      setSelectValue(select, 'EN_REVISION')
    })

    const textareas = app.container.querySelectorAll('textarea')
    expect(textareas.length).toBe(2)
    await act(async () => {
      setTextareaValue(textareas[0] as HTMLTextAreaElement, 'Mensaje público')
      setTextareaValue(textareas[1] as HTMLTextAreaElement, 'Nota interna')
    })

    const openBtn = Array.from(app.container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Cambiar estado'),
    ) as HTMLButtonElement
    await act(async () => {
      openBtn.click()
    })
    await flushAsync()

    expect(adminApi.cambiarEstadoSolicitudAdmin).not.toHaveBeenCalled()

    const cancel = Array.from(document.body.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'Cancelar',
    ) as HTMLButtonElement
    await act(async () => {
      cancel.click()
    })
    await flushAsync()
    expect(adminApi.cambiarEstadoSolicitudAdmin).not.toHaveBeenCalled()
    expect(app.container.textContent).toContain('Pendiente')

    await act(async () => {
      openBtn.click()
    })
    await flushAsync()

    // Preparar historial N+1 antes del success (refetch real, sin evento optimista).
    vi.mocked(adminApi.getHistorialSolicitudAdmin).mockResolvedValue([
      {
        id: 1,
        solicitudId: 15,
        estadoAnterior: null,
        estadoNuevo: 'PENDIENTE',
        observacionPublica: null,
        notaInterna: null,
        idUsuario: null,
        usuario: null,
        fecha: '2026-10-20T10:00:00.000Z',
      },
      {
        id: 41,
        solicitudId: 15,
        estadoAnterior: 'PENDIENTE',
        estadoNuevo: 'EN_REVISION',
        observacionPublica: 'Mensaje público',
        notaInterna: 'Nota interna admin',
        idUsuario: 7,
        usuario: {
          idUsuario: 7,
          nombre: 'María Rodríguez',
          rol: 'ADMINISTRADORA',
        },
        fecha: '2026-10-24T18:00:00.000Z',
      },
    ])

    const confirm = Array.from(document.body.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Confirmar cambio'),
    ) as HTMLButtonElement
    await act(async () => {
      confirm.click()
    })
    await flushAsync()
    await flushAsync()

    expect(adminApi.cambiarEstadoSolicitudAdmin).toHaveBeenCalledTimes(1)
    const [, payload] = vi.mocked(adminApi.cambiarEstadoSolicitudAdmin).mock
      .calls[0]
    expect(payload).toEqual({
      estadoNuevo: 'EN_REVISION',
      observacionPublica: 'Mensaje público',
      notaInterna: 'Nota interna',
    })
    expect(payload).not.toHaveProperty('usuarioId')
    expect(payload).not.toHaveProperty('estadoAnterior')
    expect(payload).not.toHaveProperty('fecha')

    expect(app.container.textContent).toContain('En revisión')
    expect(app.container.textContent).toContain(
      'Estado de la solicitud actualizado correctamente.',
    )
    expect(app.container.textContent).toContain('Historial de la solicitud')
    expect(
      vi.mocked(adminApi.getHistorialSolicitudAdmin).mock.calls.length,
    ).toBeGreaterThanOrEqual(2)
    expect(app.container.querySelectorAll('ol li')).toHaveLength(2)
    expect(app.container.textContent).toContain('Pendiente → En revisión')
    expect(app.container.textContent).toContain('Mensaje público')
    expect(app.container.textContent).toContain('Nota interna admin')
  })

  it('error del Backend no cambia el estado visual ni agrega evento falso', async () => {
    vi.mocked(adminApi.cambiarEstadoSolicitudAdmin).mockRejectedValueOnce(
      new Error('HTTP 400: ["El estado no es válido"]'),
    )
    loginAsRole('Administradora')
    const app = await mountAppRoutes('/admin/solicitudes/15')
    await flushAsync()

    const llamadasHistorialAntes =
      vi.mocked(adminApi.getHistorialSolicitudAdmin).mock.calls.length
    expect(app.container.querySelectorAll('ol li')).toHaveLength(1)

    const select = app.container.querySelector('select') as HTMLSelectElement
    await act(async () => {
      setSelectValue(select, 'RECHAZADA')
    })
    const textareas = app.container.querySelectorAll('textarea')
    await act(async () => {
      setTextareaValue(textareas[0] as HTMLTextAreaElement, 'Motivo público')
    })

    const openBtn = Array.from(app.container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Cambiar estado'),
    ) as HTMLButtonElement
    await act(async () => {
      openBtn.click()
    })
    await flushAsync()
    const confirm = Array.from(document.body.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Confirmar cambio'),
    ) as HTMLButtonElement
    await act(async () => {
      confirm.click()
    })
    await flushAsync()

    const badge = Array.from(app.container.querySelectorAll('span')).find(
      (el) => el.className.includes('rounded-full') && el.textContent === 'Pendiente',
    )
    expect(badge).toBeTruthy()
    expect(app.container.textContent).not.toContain(
      'actualizado correctamente',
    )
    expect(app.container.querySelectorAll('ol li')).toHaveLength(1)
    expect(
      vi.mocked(adminApi.getHistorialSolicitudAdmin).mock.calls.length,
    ).toBe(llamadasHistorialAntes)
    expect((textareas[0] as HTMLTextAreaElement).value).toBe('Motivo público')
  })

  it('Secretaria también puede usar el control', async () => {
    loginAsRole('Secretaria')
    const app = await mountAppRoutes('/admin/solicitudes/15')
    await flushAsync()
    expect(app.container.textContent).toContain('Cambiar estado')
  })

})
