import { describe, expect, it } from 'vitest'
import { rutaNotificacionCampana } from './rutaNotificacionCampana'

describe('rutaNotificacionCampana', () => {
  it('lleva a Administradora al detalle RRHH de la solicitud', () => {
    expect(
      rutaNotificacionCampana(
        { role: 'Administradora', id: '1' },
        { idAveria: null, idSolicitudAusencia: 12 },
      ),
    ).toBe('/admin/rrhh/solicitudes-ausencia/12')
  })

  it('no inventa enlace administrativo para Secretaria', () => {
    expect(
      rutaNotificacionCampana(
        { role: 'Secretaria', id: '2' },
        { idAveria: null, idSolicitudAusencia: 12 },
      ),
    ).toBeNull()
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
    ).toBe('/admin/rrhh/solicitudes-ausencia/12')

    expect(
      rutaNotificacionCampana(
        { role: 'Fontanero', id: '3' },
        { idAveria: 25, idSolicitudAusencia: null },
      ),
    ).toBe('/fontanero/averias/25')
  })

  it('dirige las solicitudes de materiales según el destinatario', () => {
    expect(
      rutaNotificacionCampana(
        { role: 'Administradora', id: '1' },
        {
          tipo: 'SOLICITUD_MATERIALES_PENDIENTE_ADMINISTRADORA',
          idSolicitudMateriales: 15,
        },
      ),
    ).toBe('/admin/inventario/solicitudes/15')

    expect(
      rutaNotificacionCampana(
        { role: 'Fontanero', id: '3' },
        {
          tipo: 'SOLICITUD_MATERIALES_APROBADA_FONTANERO',
          idSolicitudMateriales: 15,
        },
      ),
    ).toBe('/admin/inventario/solicitudes-materiales/15')

    expect(
      rutaNotificacionCampana(
        { role: 'Fontanero', id: '3' },
        {
          tipo: 'SOLICITUD_MATERIALES_RECHAZADA_FONTANERO',
          idSolicitudMateriales: 16,
        },
      ),
    ).toBe('/admin/inventario/solicitudes-materiales/16')
  })

  it('dirige salidas y reposiciones a inventario administrativo', () => {
    expect(
      rutaNotificacionCampana(
        { role: 'Administradora', id: '1' },
        {
          tipo: 'SALIDA_INVENTARIO_REGISTRADA_ADMINISTRADORA',
          idSalidaInventario: 8,
        },
      ),
    ).toBe('/admin/inventario/movimientos/8')

    expect(
      rutaNotificacionCampana(
        { role: 'Administradora', id: '1' },
        { tipo: 'ALERTA_REPOSICION_ADMINISTRADORA', idReposicion: 5 },
      ),
    ).toBe('/admin/inventario/reposiciones/5')
  })
})
