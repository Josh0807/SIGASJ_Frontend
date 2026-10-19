import { describe, expect, it } from 'vitest'
import { rutaNotificacionCampana } from './rutaNotificacionCampana'

describe('rutaNotificacionCampana', () => {
  it('lleva a Administradora al detalle RRHH de la solicitud', () => {
    expect(
      rutaNotificacionCampana(
        { role: 'Administradora', id: '1' },
        { idAveria: null, idSolicitudAusencia: 12 },
      ),
    ).toBe('/admin/lecturas/solicitudes-ausencia/12')
  })

  it('no inventa ruta de solicitud para Fontanero', () => {
    expect(
      rutaNotificacionCampana(
        { role: 'Fontanero', id: '3' },
        { idAveria: null, idSolicitudAusencia: 12 },
      ),
    ).toBeNull()
  })

  it('prioriza solicitud sobre avería y conserva rutas de avería', () => {
    expect(
      rutaNotificacionCampana(
        { role: 'Administradora', id: '1' },
        { idAveria: 25, idSolicitudAusencia: 12 },
      ),
    ).toBe('/admin/lecturas/solicitudes-ausencia/12')

    expect(
      rutaNotificacionCampana(
        { role: 'Fontanero', id: '3' },
        { idAveria: 25, idSolicitudAusencia: null },
      ),
    ).toBe('/fontanero/averias/25')
  })
})
