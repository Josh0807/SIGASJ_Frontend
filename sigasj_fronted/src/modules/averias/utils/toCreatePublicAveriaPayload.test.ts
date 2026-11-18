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
  it('incluye cédula obligatoria y omite correo vacío', () => {
    const payload = toCreatePublicAveriaPayload({
      ...filled,
      correoReportante: '',
    })

    expect(payload).toEqual({
      nombreReportante: 'María Rodríguez',
      identificacionReportante: '1-2345-6789',
      telefonoReportante: '8888-8888',
      ubicacion: 'Frente a la escuela',
      sectorComunidad: 'San Juan',
      descripcion: 'Fuga visible en la tubería.',
    })
    expect(payload).not.toHaveProperty('correoReportante')

    for (const key of PUBLIC_AVERIA_ADMIN_PAYLOAD_KEYS) {
      expect(payload).not.toHaveProperty(key)
    }
  })

  it('incluye identificación y correo cuando tienen valor', () => {
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

  it('incluye latitud/longitud solo cuando el par es válido', () => {
    expect(
      toCreatePublicAveriaPayload({
        ...filled,
        latitud: 10.2188,
        longitud: -85.5565,
      }),
    ).toMatchObject({
      latitud: 10.2188,
      longitud: -85.5565,
    })

    expect(
      toCreatePublicAveriaPayload({
        ...filled,
        latitud: 10.2188,
        longitud: null,
      }),
    ).not.toHaveProperty('latitud')
  })
})
