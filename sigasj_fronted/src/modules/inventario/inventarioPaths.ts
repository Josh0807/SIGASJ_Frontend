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
export const SALIDAS_PATH = '/admin/inventario/salidas'
export const SOLICITUD_MATERIALES_NEW_PATH = '/admin/inventario/solicitudes-materiales/nueva'
export const SOLICITUDES_MATERIALES_PATH = '/admin/inventario/solicitudes-materiales'
export const solicitudMaterialesDetailPath = (id: number | string) => `${SOLICITUDES_MATERIALES_PATH}/${id}`
export const SOLICITUDES_REVISION_PATH = '/admin/inventario/solicitudes'
export const solicitudRevisionDetailPath = (id: number | string) => `${SOLICITUDES_REVISION_PATH}/${id}`
