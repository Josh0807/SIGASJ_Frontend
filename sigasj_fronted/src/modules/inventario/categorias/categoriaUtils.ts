import type { CategoriaFormValues } from './types'

export type CategoriaErrors = Partial<Record<keyof CategoriaFormValues, string>>
export const validateCategoria = (values: CategoriaFormValues): CategoriaErrors => {
  const errors: CategoriaErrors = {}
  const nombre = values.nombre.trim()
  if (!nombre) errors.nombre = 'El nombre es obligatorio.'
  else if (nombre.length > 100) errors.nombre = 'El nombre no puede superar 100 caracteres.'
  if (values.descripcion.length > 500) errors.descripcion = 'La descripción no puede superar 500 caracteres.'
  return errors
}

export function categoriaError(error: unknown): { status: number | null; message: string; nombre?: string } {
  const raw = error instanceof Error ? error.message : ''
  const status = Number(/^HTTP (\d+):/.exec(raw)?.[1]) || null
  const detail = raw.replace(/^HTTP \d+:\s*/, '')
  if (status === 409) return { status, message: 'Revise el nombre ingresado.', nombre: 'Ya existe una categoría registrada con ese nombre.' }
  if (status === 400 || status === 422) return { status, message: detail.length > 10 ? detail : 'Revise los datos ingresados.' }
  if (status === 401) return { status, message: 'Su sesión expiró. Inicie sesión nuevamente.' }
  if (status === 403) return { status, message: 'Solo la Administradora puede realizar esta acción.' }
  if (status === 404) return { status, message: 'La categoría no fue encontrada.' }
  return { status, message: 'No fue posible completar la operación. Intente nuevamente.' }
}
