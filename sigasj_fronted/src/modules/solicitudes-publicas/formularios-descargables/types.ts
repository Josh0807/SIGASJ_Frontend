/** Respuesta administrativa de FormularioDescargable (4.15.2). Sin paths de storage. */
export type FormularioDescargableAdmin = {
  id: number
  nombre: string
  descripcion: string | null
  nombreArchivoOriginal: string
  activo: boolean
  fechaPublicacion: string | null
  createdAt: string
  updatedAt: string
}

/** Alta administrativa (UI 4.15.4): nombre, descripción, PDF y estado obligatorios. */
export type CreateFormularioDescargableInput = {
  nombre: string
  descripcion: string
  activo: boolean
  archivo: File
}

export type UpdateFormularioDescargableInput = {
  nombre?: string
  descripcion?: string | null
  fechaPublicacion?: string | null
}

export const FORMULARIO_DESCARGABLE_MAX_BYTES = 10 * 1024 * 1024
export const FORMULARIO_DESCARGABLE_NOMBRE_MAX = 200
export const FORMULARIO_DESCARGABLE_DESCRIPCION_MAX = 1000
