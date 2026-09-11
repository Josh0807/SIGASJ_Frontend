import type { CreatePublicAveriaPayload } from '../types/publicAveriaApi'
import type { PublicAveriaFormValues } from '../types/publicAveriaForm'

const optionalTrimmed = (value: string): string | undefined => {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

/** Mapeo explícito al DTO público. Nunca incluye campos administrativos. */
export function toCreatePublicAveriaPayload(
  values: PublicAveriaFormValues,
): CreatePublicAveriaPayload {
  const payload: CreatePublicAveriaPayload = {
    nombreReportante: values.nombreReportante.trim(),
    telefonoReportante: values.telefonoReportante.trim(),
    ubicacion: values.ubicacion.trim(),
    sectorComunidad: values.sectorComunidad.trim(),
    descripcion: values.descripcion.trim(),
  }

  const identificacionReportante = optionalTrimmed(values.identificacionReportante)
  if (identificacionReportante) {
    payload.identificacionReportante = identificacionReportante
  }

  const correoReportante = optionalTrimmed(values.correoReportante)
  if (correoReportante) {
    payload.correoReportante = correoReportante
  }

  return payload
}
