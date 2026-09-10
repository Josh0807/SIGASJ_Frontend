import type { Categoria } from './categorias/types'

type CategoryOption = Pick<Categoria, 'id' | 'nombre' | 'activo'>

/** Conserva la categoría histórica inactiva, sin ofrecer otras inactivas. */
export function materialCategoryOptions(active: Categoria[], current?: CategoryOption | null): CategoryOption[] {
  const options: CategoryOption[] = []
  if (current && !current.activo) options.push(current)
  for (const category of active) {
    if (!category.activo || options.some((item) => item.id === category.id)) continue
    options.push(category)
  }
  return options
}
