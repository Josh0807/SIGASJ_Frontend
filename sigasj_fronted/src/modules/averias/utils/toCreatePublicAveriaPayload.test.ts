import { describe, expect, it } from 'vitest'
import { PUBLIC_AVERIA_ADMIN_PAYLOAD_KEYS } from '../types/publicAveriaApi'
import { EMPTY_PUBLIC_AVERIA_FORM } from '../types/publicAveriaForm'
import { toCreatePublicAveriaPayload } from './toCreatePublicAveriaPayload'

const filled = {
  ...EMPTY_PUBLIC_AVERIA_FORM,
  nombreReportante: '  María Rodríguez  ',
  identificacionReportante: ' 1-2345-6789 ',
  telefonoReportante: ' 8888-8888 ',
  correoReportante: ' maria@example.com ',
  ubicacion: ' Frente a la escuela ',
  sectorComunidad: ' San Juan ',
  descripcion: ' Fuga visible en la tubería. ',
}

describe('toCreatePublicAveriaPayload', () => {
  it('envía únicamente campos públicos y omite opcionales vacíos', () => {
    const payload = toCreatePublicAveriaPayload({
      ...filled,
      identificacionReportante: '   ',
      correoReportante: '',
    })

    expect(payload).toEqual({
      nombreReportante: 'María Rodríguez',
      telefonoReportante: '8888-8888',
      ubicacion: 'Frente a la escuela',
      sectorComunidad: 'San Juan',
      descripcion: 'Fuga visible en la tubería.',
    })
    expect(payload).not.toHaveProperty('identificacionReportante')
    expect(payload).not.toHaveProperty('correoReportante')

    for (const key of PUBLIC_AVERIA_ADMIN_PAYLOAD_KEYS) {
      expect(payload).not.toHaveProperty(key)
    }
  })

  it('incluye identificación y correo solo cuando tienen valor', () => {
    expect(toCreatePublicAveriaPayload(filled)).toEqual({
      nombreReportante: 'María Rodríguez',
      identificacionReportante: '1-2345-6789',
      telefonoReportante: '8888-8888',
      correoReportante: 'maria@example.com',
      ubicacion: 'Frente a la escuela',
      sectorComunidad: 'San Juan',
      descripcion: 'Fuga visible en la tubería.',
    })
  })
})
