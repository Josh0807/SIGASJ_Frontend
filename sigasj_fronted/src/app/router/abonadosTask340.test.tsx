import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from '../../modules/auth/utils/authStorage'
import { loginAsRole } from '../../test/authTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'

vi.mock('../../modules/abonados/services/abonadosApi', () => ({
  getSolicitudesPendientes: vi.fn(async () => ({
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
  })),
  registerAbonado: vi.fn(async () => ({
    idAbonado: 12,
    mensaje: 'Abonado y servicio registrados correctamente.',
  })),
}))

describe('Tarea #340 — formulario de registro de abonado', () => {
  beforeEach(() => {
    clearAccessToken()
    loginAsRole('Administradora')
  })

  it('muestra la página de gestión con acceso al registro', async () => {
    const app = await mountAppRoutes('/admin/abonados')

    try {
      expect(app.container.innerHTML).toContain('Gestión de abonados')
      expect(app.container.innerHTML).toContain('Registrar abonado')
    } finally {
      await app.cleanup()
    }
  })

  it('renderiza el formulario por secciones en /admin/abonados/nuevo', async () => {
    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      expect(app.container.innerHTML).toContain('Gestión de abonados')
      expect(app.container.innerHTML).toContain('Registrar nuevo abonado')
      expect(app.container.innerHTML).toContain('Datos personales')
      expect(app.container.innerHTML).toContain('Datos del servicio')
      expect(app.container.innerHTML).toContain('Desde solicitud aprobada')
    } finally {
      await app.cleanup()
    }
  })

  it('incluye campos obligatorios del abonado y del servicio', async () => {
    const app = await mountAppRoutes('/admin/abonados/nuevo')

    try {
      const html = app.container.innerHTML
      expect(html).toContain('Nombre *')
      expect(html).toContain('Cédula *')
      expect(html).toContain('NIS *')
      expect(html).toContain('Número de medidor *')
      expect(html).toContain('Número de plano *')
    } finally {
      await app.cleanup()
    }
  })
})
