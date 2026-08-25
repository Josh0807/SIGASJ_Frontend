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
    getAbonadoById: vi.fn(),
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

describe('Tarea #683 — confirmación y resumen del registro', () => {
  beforeEach(() => {
    clearAccessToken()
    loginAsRole('Administradora')
    vi.mocked(abonadosApi.getSolicitudesPendientes).mockResolvedValue({
      solicitudes: [],
      mensaje: null,
    })
    vi.mocked(abonadosApi.registerAbonado).mockResolvedValue({
      idAbonado: 12,
      mensaje: 'Abonado y servicio registrados correctamente.',
    })
    vi.mocked(abonadosApi.getAbonadoById).mockResolvedValue({
      idAbonado: 12,
      nombre: 'María',
      apellidos: 'Rodríguez Mora',
      cedula: '1-2345-6789',
      telefono: '8888-1234',
      correo: 'maria.rodriguez@correo.cr',
      direccion: 'San Juan, Desamparados',
    })
  })

  it('muestra resumen con nombre, cédula, NIS y medidor tras registrar', async () => {
    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await fillRegistroForm(app.container)

      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        form.requestSubmit()
      })

      await vi.waitFor(() => {
        expect(app.container.innerHTML).toContain('Registro completado')
        expect(app.container.innerHTML).toContain('María Rodríguez Mora')
        expect(app.container.innerHTML).toContain('1-2345-6789')
        expect(app.container.innerHTML).toContain('NIS-2026-001')
        expect(app.container.innerHTML).toContain('MED-45821')
      })
    } finally {
      await app.cleanup()
    }
  })

  it('ofrece consultar abonado, registrar otro y volver al listado', async () => {
    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await fillRegistroForm(app.container)

      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        form.requestSubmit()
      })

      await vi.waitFor(() => {
        expect(app.container.innerHTML).toContain('Consultar abonado')
        expect(app.container.innerHTML).toContain('Registrar otro abonado')
        expect(app.container.innerHTML).toContain('Volver al listado')
      })
    } finally {
      await app.cleanup()
    }
  })

  it('consulta el abonado creado desde la confirmación', async () => {
    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await fillRegistroForm(app.container)

      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        form.requestSubmit()
      })

      await vi.waitFor(() => {
        expect(app.container.innerHTML).toContain('Consultar abonado')
      })

      const consultLink = app.container.querySelector<HTMLAnchorElement>(
        'a[href="/admin/abonados/12"]',
      )
      expect(consultLink).not.toBeNull()

      await act(async () => {
        consultLink?.click()
      })

      await vi.waitFor(() => {
        expect(abonadosApi.getAbonadoById).toHaveBeenCalledWith(12)
        expect(app.container.innerHTML).toContain('María Rodríguez Mora')
        expect(app.container.innerHTML).toContain('NIS-2026-001')
      })
    } finally {
      await app.cleanup()
    }
  })
})
