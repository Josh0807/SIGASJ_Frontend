import { describe, expect, it } from 'vitest'
import { materialCategoryOptions } from './materialCategoryOptions'
import type { Categoria } from './categorias/types'

const category = (id: number, activo = true): Categoria => ({ id, nombre: `Categoría ${id}`, descripcion: null, activo, createdAt: '', updatedAt: '' })

describe('opciones de clasificación de materiales', () => {
  it('ofrece únicamente categorías activas para un material nuevo', () => expect(materialCategoryOptions([category(1), category(2, false)])).toEqual([category(1)]))
  it('conserva la categoría histórica inactiva actualmente asociada', () => expect(materialCategoryOptions([category(1)], category(2, false)).map(({ id }) => id)).toEqual([2, 1]))
  it('evita duplicar la categoría actual activa', () => expect(materialCategoryOptions([category(1)], category(1)).map(({ id }) => id)).toEqual([1]))
})
