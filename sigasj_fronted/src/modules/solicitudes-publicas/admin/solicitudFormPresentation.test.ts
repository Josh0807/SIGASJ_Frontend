import { describe, expect, it } from 'vitest'
import { presentSolicitudForm } from './solicitudFormPresentation'

describe('presentSolicitudForm', () => {
  it('usa etiquetas propias del formulario y conserva campos nuevos del backend', () => {
    const fields = presentSolicitudForm('cambio-titular', {
      nombreSolicitante: 'Carlos Pérez',
      nis: 'NIS-8877',
      campoFuturo: 'valor',
      solicitudId: 15,
    })
    expect(fields).toEqual(expect.arrayContaining([
      { key: 'nombreSolicitante', label: 'Nombre del solicitante', value: 'Carlos Pérez' },
      { key: 'nis', label: 'NIS', value: 'NIS-8877' },
      { key: 'campoFuturo', label: 'Campo Futuro', value: 'valor' },
    ]))
    expect(fields.some((field) => field.key === 'solicitudId')).toBe(false)
  })

  it.each(['arreglo-pago', 'cambio-titular', 'infraestructura-linderos', 'afiliacion', 'disponibilidad-servicios', 'constancia-servicio'])('representa el trámite %s', (slug) => {
    expect(presentSolicitudForm(slug, { firma: 'data:image/png;base64,abc' }).length).toBeGreaterThan(0)
  })
})
