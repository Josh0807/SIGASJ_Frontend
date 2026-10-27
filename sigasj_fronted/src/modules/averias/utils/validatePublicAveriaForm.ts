import {
  CEDULA_FISICA_DIGITOS,
  TELEFONO_CR_DIGITOS,
  soloDigitos,
} from '../../solicitudes-publicas/identificacionCostaRica'
import type {
  PublicAveriaFormErrors,
  PublicAveriaFormValues,
} from '../types/publicAveriaForm'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validatePublicAveriaForm(
  values: PublicAveriaFormValues,
): PublicAveriaFormErrors {
  const errors: PublicAveriaFormErrors = {}

  if (!values.identificacionReportante.trim()) {
    errors.identificacionReportante =
      'Ingrese su número de cédula o identificación.'
  } else if (
    soloDigitos(values.identificacionReportante).length !== CEDULA_FISICA_DIGITOS
  ) {
    errors.identificacionReportante = `La cédula debe tener exactamente ${CEDULA_FISICA_DIGITOS} dígitos.`
  }

  if (!values.nombreReportante.trim()) {
    errors.nombreReportante = 'Ingrese su nombre completo.'
  } else if (values.nombreReportante.trim().length > 150) {
    errors.nombreReportante = 'Use un máximo de 150 caracteres.'
  }

  if (!values.telefonoReportante.trim()) {
    errors.telefonoReportante = 'Ingrese un número telefónico de contacto.'
  } else if (
    soloDigitos(values.telefonoReportante).length !== TELEFONO_CR_DIGITOS
  ) {
    errors.telefonoReportante = `El teléfono debe tener exactamente ${TELEFONO_CR_DIGITOS} dígitos.`
  }

  const correo = values.correoReportante.trim()
  if (correo) {
    if (!EMAIL.test(correo)) {
      errors.correoReportante = 'Ingrese un correo electrónico válido.'
    } else if (correo.length > 150) {
      errors.correoReportante = 'Use un máximo de 150 caracteres.'
    }
  }

  if (!values.ubicacion.trim()) {
    errors.ubicacion = 'Indique la ubicación de la avería.'
  } else if (values.ubicacion.trim().length > 500) {
    errors.ubicacion = 'Use un máximo de 500 caracteres.'
  }

  if (!values.sectorComunidad.trim()) {
    errors.sectorComunidad = 'Indique el sector o comunidad.'
  } else if (values.sectorComunidad.trim().length > 150) {
    errors.sectorComunidad = 'Use un máximo de 150 caracteres.'
  }

  if (!values.descripcion.trim()) {
    errors.descripcion = 'Describa el problema reportado.'
  } else if (values.descripcion.trim().length > 4000) {
    errors.descripcion = 'Use un máximo de 4000 caracteres.'
  }

  return errors
}
