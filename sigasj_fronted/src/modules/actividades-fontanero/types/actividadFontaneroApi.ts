import type { ActividadRegistroFormValues } from '../types/actividadRegistroForm'
import type { TipoActividadFontaneroCatalogo } from '../types/tipoActividadFontanero'

export type RegistrarActividadRequest = {
  tipoActividadId: number
  fechaActividad: string
  titulo: string
  descripcion?: string
  ubicacion?: string
  observaciones?: string
  ubicacionFuga?: string
  presionMedida?: number
  resultadoVisita?: string
  cantidadCloro?: number
  caudal?: number
}

export type ActividadFontaneroRegistrada = {
  id: number
  tipoActividadId: number
  tipoActividadNombre: string
  fechaActividad: string
  titulo: string
  descripcion: string | null
  ubicacion: string | null
  observaciones: string | null
  estado: string
  observacionCorreccion: string | null
  datosEspecificos?: Record<string, unknown> | null
  documentos?: DocumentoActividadRegistrado[]
  createdAt: string
  updatedAt: string
}

export type DocumentoActividadRegistrado = {
  id: number
  actividadId: number
  nombreOriginal: string
  tipoArchivo: string
  rutaReferenciaArchivo: string
  tamanio: number
  fechaCarga: string
}

export const toRegistrarActividadPayload = (
  tipoActividadId: number,
  values: ActividadRegistroFormValues,
  tipoCodigo?: TipoActividadFontaneroCatalogo['codigo'],
): RegistrarActividadRequest => {
  const payload: RegistrarActividadRequest = {
    tipoActividadId,
    fechaActividad: values.fechaActividad.trim(),
    titulo: values.titulo.trim(),
  }

  const ubicacion = values.ubicacion.trim()
  const descripcion = values.descripcion?.trim() ?? ''
  const observaciones = values.observaciones.trim()

  if (descripcion) {
    payload.descripcion = descripcion
  }
  if (ubicacion) {
    payload.ubicacion = ubicacion
  }
  if (observaciones) {
    payload.observaciones = observaciones
  }

  switch (tipoCodigo) {
    case 'CONTROL_FUGAS':
      if (values.ubicacionFuga?.trim()) payload.ubicacionFuga = values.ubicacionFuga.trim()
      break
    case 'TOMA_PRESION':
      if (values.presionMedida) payload.presionMedida = Number(values.presionMedida)
      break
    case 'VISITA_CAMPO':
      if (values.resultadoVisita?.trim()) payload.resultadoVisita = values.resultadoVisita.trim()
      break
    case 'CONTROL_CLOROS':
      if (values.cantidadCloro) payload.cantidadCloro = Number(values.cantidadCloro)
      break
    case 'CONTROL_OPERATIVO':
      if (values.caudal) payload.caudal = Number(values.caudal)
      break
  }

  return payload
}

export const toRegistrarActividadPayloadFromTipo = (
  tipo: TipoActividadFontaneroCatalogo,
  values: ActividadRegistroFormValues,
): RegistrarActividadRequest => toRegistrarActividadPayload(tipo.id, values, tipo.codigo)
