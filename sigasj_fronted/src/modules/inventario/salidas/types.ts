export type SalidaFormValues = {
  materialId: string
  cantidad: string
  observacion: string
}

export type RegistrarSalidaPayload = {
  idMaterial: number
  cantidad: number
  idAveria: number | null
  idSolicitud: number | null
  observacion: string | null
}

export type DisponibilidadMaterial = {
  idMaterial: number
  nombreMaterial: string
  disponible: boolean
  stockActual: number
  stockMinimo: number
  cantidadSolicitada: number
  stockResultante: number
  esAgotamientoTotal: boolean
  esBajoMinimo: boolean
  mensaje: string
}

export type SalidaResponse = {
  movimiento: {
    id: number
    tipo: 'SALIDA'
    cantidad: number
    fechaMovimiento: string
    idMaterial: number
    idUsuario: number
    idAveria: number | null
    idSolicitud: number | null
    observacion: string | null
  }
  stockAnterior: number
  stockActual: number
  diferencia: number
  agotadoTotal: boolean
  bajoStockMinimo: boolean
  mensaje: string
}

export type SalidaAveria = SalidaResponse['movimiento'] & {
  material?: { id: number; nombre: string; unidadMedida?: string }
}
