export type DocumentoMovimiento = {
  id: number
  nombreOriginal: string
  tipoArchivo: string
  rutaReferenciaArchivo: string
  tamanio: number
  idMovimiento: number
  createdAt: string
  updatedAt: string
}

export type SelectedDocument = { id: string; file: File }
