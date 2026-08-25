import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from '../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../test/authTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'
import {
  fillRegistroForm,
  REGISTRO_DEMO_VALUES,
  submitRegistroForm,
} from '../../test/abonadosRegistroHelpers'
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

const solicitudDemo = {
  idSolicitud: 1,
  nombre: 'María',
  apellidos: 'Rodríguez Mora',
  cedula: '1-2345-6789',
  telefono: '8888-1234',
  correo: 'maria.rodriguez@correo.cr',
  direccion: 'San Juan, Desamparados',
  utilizada: false,
}

const abonadoDemo = {
  idAbonado: 12,
  nombre: 'María',
  apellidos: 'Rodríguez Mora',
  cedula: '1-2345-6789',
  telefono: '8888-1234',
  correo: 'maria.rodriguez@correo.cr',
  direccion: 'San Juan, Desamparados',
}

describe('Tarea #684 — proceso de registro de nuevos abonados', () => {
  beforeEach(() => {
    clearAccessToken()
    loginAsRole('Administradora')
    vi.mocked(abonadosApi.getSolicitudesPendientes).mockReset()
    vi.mocked(abonadosApi.registerAbonado).mockReset()
    vi.mocked(abonadosApi.getAbonadoById).mockReset()
    vi.mocked(abonadosApi.getSolicitudesPendientes).mockResolvedValue({
      solicitudes: [solicitudDemo],
      mensaje: null,
    })
    vi.mocked(abonadosApi.registerAbonado).mockResolvedValue({
      idAbonado: 12,
      mensaje: 'Abonado y servicio registrados correctamente.',
    })
    vi.mocked(abonadosApi.getAbonadoById).mockResolvedValue(abonadoDemo)
  })

  it('flujo completo: listado → formulario → confirmación → consulta', async () => {
    const app = await mountAppRoutes('/admin/abonados')

    try {
      const registerLink = app.container.querySelector<HTMLAnchorElement>(
        'a[href="/admin/abonados/nuevo"]',
      )
      expect(registerLink).not.toBeNull()

      await act(async () => {
        registerLink?.click()
      })

      await vi.waitFor(() => {
        expect(app.container.innerHTML).toContain('Registrar nuevo abonado')
      })

      await fillRegistroForm(app.container)
      await submitRegistroForm(app.container)

      await vi.waitFor(() => {
        expect(abonadosApi.registerAbonado).toHaveBeenCalled()
        expect(app.container.innerHTML).toContain('Registro completado')
      })

      const consultLink = app.container.querySelector<HTMLAnchorElement>(
        'a[href="/admin/abonados/12"]',
      )
      await act(async () => {
        consultLink?.click()
      })

      await vi.waitFor(() => {
        expect(abonadosApi.getAbonadoById).toHaveBeenCalledWith(12)
        expect(app.container.innerHTML).toContain('María Rodríguez Mora')
      })
    } finally {
      await app.cleanup()
    }
  })

  it('registra desde una solicitud aprobada con idSolicitud', async () => {
    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await fillRegistroForm(app.container, {
        ...REGISTRO_DEMO_VALUES,
        origen: 'solicitud',
        idSolicitud: '1',
      })
      await submitRegistroForm(app.container)

      await vi.waitFor(() => {
        expect(abonadosApi.registerAbonado).toHaveBeenCalledWith(
          expect.objectContaining({
            origen: 'solicitud',
            idSolicitud: '1',
            cedula: '1-2345-6789',
            servicio: expect.objectContaining({
              nis: 'NIS-2026-001',
              medidor: 'MED-45821',
            }),
          }),
        )
      })
    } finally {
      await app.cleanup()
    }
  })

  it('bloquea el envío cuando faltan campos obligatorios', async () => {
    vi.mocked(abonadosApi.registerAbonado).mockClear()

    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await submitRegistroForm(app.container)

      await vi.waitFor(() => {
        expect(app.container.innerHTML).toContain('El nombre es obligatorio.')
      })
      expect(abonadosApi.registerAbonado).not.toHaveBeenCalled()
    } finally {
      await app.cleanup()
    }
  })

  it('muestra error claro cuando la cédula está duplicada', async () => {
    vi.mocked(abonadosApi.registerAbonado).mockRejectedValue(
      new Error('HTTP 409: Ya existe un abonado registrado con esa cédula.'),
    )

    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await fillRegistroForm(app.container)
      await submitRegistroForm(app.container)

      await vi.waitFor(() => {
        expect(app.container.innerHTML).toContain(
          'Ya existe un abonado registrado con esa cédula.',
        )
        expect(app.container.innerHTML).not.toContain('Registro completado')
      })
    } finally {
      await app.cleanup()
    }
  })

  it('muestra error claro cuando el NIS está duplicado', async () => {
    vi.mocked(abonadosApi.registerAbonado).mockRejectedValue(
      new Error('HTTP 409: Ya existe un servicio con ese NIS.'),
    )

    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await fillRegistroForm(app.container)
      await submitRegistroForm(app.container)

      await vi.waitFor(() => {
        expect(app.container.innerHTML).toContain('Ya existe un servicio con ese NIS.')
      })
    } finally {
      await app.cleanup()
    }
  })

  it('muestra error claro cuando el medidor está duplicado', async () => {
    vi.mocked(abonadosApi.registerAbonado).mockRejectedValue(
      new Error('HTTP 409: Ya existe un servicio con ese número de medidor.'),
    )

    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await fillRegistroForm(app.container)
      await submitRegistroForm(app.container)

      await vi.waitFor(() => {
        expect(app.container.innerHTML).toContain(
          'Ya existe un servicio con ese número de medidor.',
        )
      })
    } finally {
      await app.cleanup()
    }
  })

  it('envía abonado y servicio juntos en el mismo registro', async () => {
    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await fillRegistroForm(app.container)
      await submitRegistroForm(app.container)

      await vi.waitFor(() => {
        expect(abonadosApi.registerAbonado).toHaveBeenCalledWith(
          expect.objectContaining({
            nombre: 'María',
            servicio: {
              nis: 'NIS-2026-001',
              medidor: 'MED-45821',
              sector: 'Sector Centro',
              tarifa: 'Residencial',
              numeroPlano: 'PL-1024',
            },
          }),
        )
      })
    } finally {
      await app.cleanup()
    }
  })

  it('impide el registro a usuarios Abonado en la ruta administrativa', async () => {
    clearAccessToken()
    loginAsRole('Abonado', '10')
    vi.mocked(abonadosApi.registerAbonado).mockClear()

    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await vi.waitFor(() => {
        expect(app.container.innerHTML).toContain('Acceso denegado')
        expect(app.container.innerHTML).not.toContain('Registrar nuevo abonado')
      })
      expect(abonadosApi.registerAbonado).not.toHaveBeenCalled()
    } finally {
      await app.cleanup()
    }
  })

  it('permite registrar otro abonado tras la confirmación', async () => {
    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      await fillRegistroForm(app.container)
      await submitRegistroForm(app.container)

      await vi.waitFor(() => {
        expect(app.container.innerHTML).toContain('Registro completado')
      })

      const registerAnother = Array.from(
        app.container.querySelectorAll<HTMLButtonElement>('button'),
      ).find((button) => button.textContent?.includes('Registrar otro abonado'))
      expect(registerAnother).toBeDefined()

      await act(async () => {
        registerAnother?.click()
      })

      await vi.waitFor(() => {
        expect(app.container.innerHTML).toContain('Registrar nuevo abonado')
        expect(app.container.innerHTML).not.toContain('Registro completado')
      })
    } finally {
      await app.cleanup()
    }
  })
})
