export interface ReciboItem {
  fechaEmision?: string
  fechaVencimiento?: string
  total?: number
  periodo?: string
  [key: string]: unknown
}

export interface ReciboConsultaData {
  numeroPaja: number
  abonado: string
  tieneRecibosPendientes: boolean
  mensaje?: string
  recibos: ReciboItem[]
}

export interface ReciboConsultaResponse {
  success: boolean
  data?: ReciboConsultaData
  error?: string
}
