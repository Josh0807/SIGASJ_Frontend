export const MATERIALES_PATH = '/admin/inventario/materiales'
export const MATERIAL_NEW_PATH = `${MATERIALES_PATH}/nuevo`
export const materialEditPath = (id: number) => `${MATERIALES_PATH}/${id}/editar`
export const CATEGORIAS_PATH = '/admin/inventario/categorias'
export const CATEGORIA_NEW_PATH = `${CATEGORIAS_PATH}/nueva`
export const categoriaEditPath = (id: number) => `${CATEGORIAS_PATH}/${id}/editar`
export const PROVEEDORES_PATH = '/admin/inventario/proveedores'
export const PROVEEDOR_NEW_PATH = `${PROVEEDORES_PATH}/nuevo`
export const proveedorEditPath = (id: number) => `${PROVEEDORES_PATH}/${id}/editar`
export const ENTRADAS_PATH = '/admin/inventario/entradas'
