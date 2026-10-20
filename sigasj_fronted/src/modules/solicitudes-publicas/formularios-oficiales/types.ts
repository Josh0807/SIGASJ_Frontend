export type FormularioOficial = {
  tipoSolicitudId: number
  nombre: string
  slug: string
  tienePdf: boolean
  nombreArchivo: string | null
  fechaActualizacion: string | null
}

export const FORMULARIO_OFICIAL_MAX_BYTES = 10 * 1024 * 1024

export const FORMULARIOS_OFICIALES_SLUGS = [
  'arreglo-pago',
  'cambio-titular',
  'infraestructura-linderos',
  'afiliacion',
  'disponibilidad-servicios',
  'servicio-existente',
] as const
