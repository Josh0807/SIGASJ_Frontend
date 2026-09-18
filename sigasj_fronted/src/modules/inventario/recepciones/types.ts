import type { ReposicionMaterial } from '../reposiciones/types'

export type RecepcionItemPayload = {
  idMaterial: number
  cantidad: number
}

export type RegistrarRecepcionPayload = {
  idReposicion: number
  detalles: RecepcionItemPayload[]
  observacion?: string
}

export type MovimientoRecepcionResumen = {
  id: number
  tipo: string
  cantidad: number
  idMaterial: number
  idReposicion: number | null
  fechaMovimiento?: string
}

export type ExistenciaActualizadaResumen = {
  idMaterial: number
  stockAnterior: number
  stockActual: number
}

export type RegistrarRecepcionResponse = ReposicionMaterial & {
  movimientos?: MovimientoRecepcionResumen[]
  existenciasActualizadas?: ExistenciaActualizadaResumen[]
  mensaje?: string
}
