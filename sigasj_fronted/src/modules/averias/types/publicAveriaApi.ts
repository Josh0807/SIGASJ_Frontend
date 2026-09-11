export type CreatePublicAveriaPayload = {
  nombreReportante: string
  telefonoReportante: string
  ubicacion: string
  sectorComunidad: string
  descripcion: string
  identificacionReportante?: string
  correoReportante?: string
}

export type RegistroPublicoAveriaData = {
  codigoSeguimiento: string
  fechaReporte: string
  estado: string
}

export type RegistroPublicoAveriaResponse = {
  message: string
  data: RegistroPublicoAveriaData
}

export type PublicAveriaConfirmation = {
  message: string
  codigoSeguimiento: string
  fechaReporte: string
  estado: string
}

export const PUBLIC_AVERIA_PAYLOAD_KEYS = [
  'nombreReportante',
  'identificacionReportante',
  'telefonoReportante',
  'correoReportante',
  'ubicacion',
  'sectorComunidad',
  'descripcion',
] as const

export const PUBLIC_AVERIA_ADMIN_PAYLOAD_KEYS = [
  'id',
  'idAveria',
  'codigoSeguimiento',
  'fechaReporte',
  'horaReporte',
  'estado',
  'prioridad',
  'tipoAveria',
  'tipoAveriaId',
  'fontaneroAsignado',
  'fontaneroId',
  'idFontaneroAsignado',
  'fechaAsignacion',
  'fechaInicioAtencion',
  'fechaResolucion',
  'observacionesAtencion',
  'idAbonado',
  'abonadoId',
  'userId',
] as const
