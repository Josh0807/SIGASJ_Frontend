import { describe, expect, it } from 'vitest'
import {
  hasContactoFormErrors,
  validateContactoFormValues,
} from './contactoFormValidation'
import type { ContactoFormValues } from '../types/contacto.types'

const validValues: ContactoFormValues = {
  telefono: '8560-7584',
  telefonosAdicionalesText: '',
  email: 'asadasanjuan24@gmail.com',
  horarioAtencion: 'Lunes a sábado',
  horarioVentanilla: '',
  direccion: 'San Juan',
  referenciaUbicacion: '',
  regionResumen: 'Guanacaste',
  mapaUrl: 'https://maps.app.goo.gl/test',
  mapaLatitud: '10.21',
  mapaLongitud: '-85.55',
  mapaZoom: '18',
  textoUbicacionMapa: '',
  urlFacebook: '',
  descripcionContacto: '',
}

describe('validateContactoFormValues', () => {
  it('acepta un formulario válido', () => {
    const errors = validateContactoFormValues(validValues)
    expect(hasContactoFormErrors(errors)).toBe(false)
  })

  it('marca teléfono y correo inválidos', () => {
    const errors = validateContactoFormValues({
      ...validValues,
      telefono: '123',
      email: 'correo-invalido',
    })

    expect(errors.telefono).toBeTruthy()
    expect(errors.email).toBeTruthy()
  })

  it('exige latitud y longitud juntas', () => {
    const errors = validateContactoFormValues({
      ...validValues,
      mapaLatitud: '10.21',
      mapaLongitud: '',
    })

    expect(errors.mapaLatitud).toBeTruthy()
    expect(errors.mapaLongitud).toBeTruthy()
  })
})
