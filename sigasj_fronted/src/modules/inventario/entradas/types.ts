export type RegistrarEntradaPayload = {
  idMaterial: number
  cantidad: number
  idProveedor: number | null
  observacion: string | null
}

export type EntradaResponse = {
  movimiento: {
    id: number
    tipo: 'ENTRADA'
    cantidad: number
    fechaMovimiento: string
    observacion: string | null
    idMaterial: number
    idProveedor: number | null
    idUsuario: number
    createdAt: string
  }
  material: {
    id: number
    nombre: string
    unidadMedida: string
    stockMinimo: number
    stockActual: number
    activo: boolean
  }
  stockAnterior: number
  stockActual: number
  mensaje: string
}

export type EntradaFormValues = { materialId: string; cantidad: string; proveedorId: string; observacion: string }
