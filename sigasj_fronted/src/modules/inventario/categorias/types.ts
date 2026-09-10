export type Categoria = { id: number; nombre: string; descripcion: string | null; activo: boolean; createdAt: string; updatedAt: string }
export type CategoriasResponse = { data: Categoria[]; total: number; page: number; limit: number; totalPages: number }
export type CategoriasQuery = { page?: number; limit?: number; nombre?: string; activo?: boolean }
export type CategoriaPayload = { nombre: string; descripcion: string | null }
export type CategoriaFormValues = { nombre: string; descripcion: string }
