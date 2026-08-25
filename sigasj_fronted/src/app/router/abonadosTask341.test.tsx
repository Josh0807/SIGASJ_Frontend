import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from '../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../test/authTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'
import * as abonadosApi from '../../modules/abonados/services/abonadosApi'

vi.mock('../../modules/abonados/services/abonadosApi', async () => {
  const actual = await vi.importActual<typeof import('../../modules/abonados/services/abonadosApi')>(
    '../../modules/abonados/services/abonadosApi',
  )

  return {
    ...actual,
    getSolicitudesPendientes: vi.fn(),
    registerAbonado: vi.fn(),
  }
})

const setInputValue = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set

  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const fillRegistroForm = async (container: HTMLElement) => {
  const inputs = container.querySelectorAll<HTMLInputElement>(
    '.gallery-admin__form input:not([type="radio"])',
  )

  const values = [
    'María',
    'Rodríguez Mora',
    '1-2345-6789',
    '8888-1234',
    'maria.rodriguez@correo.cr',
    'San Juan, Desamparados',
    'NIS-2026-001',
    'MED-45821',
    'Sector Centro',
    'Residencial',
    'PL-1024',
  ]

  await act(async () => {
    inputs.forEach((input, index) => {
      setInputValue(input, values[index] ?? '')
    })
  })
}

describe('Tarea #341 — integración formulario con backend', () => {
  beforeEach(() => {
    clearAccessToken()
    loginAsRole('Administradora')
    vi.mocked(abonadosApi.getSolicitudesPendientes).mockResolvedValue({
      solicitudes: [
        {
          idSolicitud: 1,
          nombre: 'María',
          apellidos: 'Rodríguez Mora',
          cedula: '1-2345-6789',
          telefono: '8888-1234',
          correo: 'maria.rodriguez@correo.cr',
          direccion: 'San Juan, Desamparados',
          utilizada: false,
        },
      ],
      mensaje: null,
    })
    vi.mocked(abonadosApi.registerAbonado).mockResolvedValue({
      idAbonado: 12,
      mensaje: 'Abonado y servicio registrados correctamente.',
    })
  })

  it('carga solicitudes al abrir el formulario', async () => {
    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await vi.waitFor(() => {
        expect(abonadosApi.getSolicitudesPendientes).toHaveBeenCalled()
      })
    } finally {
      await app.cleanup()
    }
  })

  it('registra abonado y muestra resumen al enviar el formulario', async () => {
    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await fillRegistroForm(app.container)

      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        form.requestSubmit()
      })

      await vi.waitFor(() => {
        expect(abonadosApi.registerAbonado).toHaveBeenCalled()
        expect(app.container.innerHTML).toContain('Registro completado')
        expect(app.container.innerHTML).toContain('ID abonado: 12')
        expect(app.container.innerHTML).toContain('NIS-2026-001')
      })
    } finally {
      await app.cleanup()
    }
  })

  it('muestra error del backend cuando el registro falla', async () => {
    vi.mocked(abonadosApi.registerAbonado).mockRejectedValue(
      new Error('HTTP 409: Ya existe un abonado registrado con esa cédula.'),
    )

    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await fillRegistroForm(app.container)

      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        form.requestSubmit()
      })

      await vi.waitFor(() => {
        expect(app.container.innerHTML).toContain(
          'Ya existe un abonado registrado con esa cédula.',
        )
      })
    } finally {
      await app.cleanup()
    }
  })
})
