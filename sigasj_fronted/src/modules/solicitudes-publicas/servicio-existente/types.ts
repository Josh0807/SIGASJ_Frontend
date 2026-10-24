import type { SolicitudSeguimiento } from '../types'

export const TIPOS_SERVICIO = ['Agua potable', 'Alcantarillado sanitario'] as const
export const NATURALEZAS_INMUEBLE = ['Inscrito', 'Sin inscribir'] as const
export const CALIDADES_TITULAR = ['Propietario', 'Poseedor', 'Representante legal'] as const
export const MOTIVOS = [
  'Bono de vivienda',
  'Trámite bancario',
  'Visado municipal',
  'Conexión eléctrica',
  'Trámite notarial',
  'Exoneración de bienes inmuebles',
  'Otro',
] as const
export const MEDIOS_NOTIFICACION = ['Correo electrónico', 'Teléfono'] as const
export const TIPOS_DOCUMENTO = ['identificacion', 'poder'] as const

export type TipoServicio = (typeof TIPOS_SERVICIO)[number]
export type NaturalezaInmueble = (typeof NATURALEZAS_INMUEBLE)[number]
export type CalidadTitular = (typeof CALIDADES_TITULAR)[number]
export type Motivo = (typeof MOTIVOS)[number]
export type MedioNotificacion = (typeof MEDIOS_NOTIFICACION)[number]
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number]

export type DocumentoAdjunto = {
  localId: string
  tipoDocumento: TipoDocumento
  nombreOriginal: string
  tamanio: number
  tipoArchivo: string
  estado: 'subiendo' | 'cargado' | 'error'
  id?: number
  tokenReclamo?: string
  errorMessage?: string
}

export type ServicioExistenteFormValues = {
  tipoServicio: '' | TipoServicio
  nis: string
  propietarioInmueble: string
  nombreSolicitante: string
  identificacionSolicitante: string
  correoElectronico: string
  telefono: string
  naturalezaInmueble: '' | NaturalezaInmueble
  calidadTitular: '' | CalidadTitular
  folioReal: string
  planoCatastrado: string
  planoAgrimensura: string
  provincia: string
  canton: string
  distrito: string
  direccionExacta: string
  motivo: '' | Motivo
  otroMotivo: string
  tramitePorRealizar: string
  medioNotificacionPrincipal: '' | MedioNotificacion
  medioNotificacionSecundario: '' | MedioNotificacion
  documentos: DocumentoAdjunto[]
  firma: string
}

export type ServicioExistentePayload = Omit<
  ServicioExistenteFormValues,
  | 'tipoServicio'
  | 'naturalezaInmueble'
  | 'calidadTitular'
  | 'motivo'
  | 'otroMotivo'
  | 'medioNotificacionPrincipal'
  | 'medioNotificacionSecundario'
  | 'documentos'
> & {
  tipoServicio: TipoServicio
  naturalezaInmueble: NaturalezaInmueble
  calidadTitular: CalidadTitular
  motivo: Motivo
  otroMotivo?: string
  medioNotificacionPrincipal: MedioNotificacion
  medioNotificacionSecundario?: MedioNotificacion
  documentos: Array<{ id: number; tokenReclamo: string }>
}

export type ServicioExistenteResponse = SolicitudSeguimiento & {
  detalleConstanciaServicio?: Record<string, unknown>
}
