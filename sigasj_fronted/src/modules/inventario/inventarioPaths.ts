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
export const ALERTAS_REPOSICION_PATH = '/admin/inventario/alertas-reposicion'
export const REPOSICIONES_PATH = '/admin/inventario/reposiciones'
export const reposicionDetailPath = (id: number | string) => `${REPOSICIONES_PATH}/${id}`
export const RECEPCIONES_PATH = '/admin/inventario/recepciones'
export const recepcionDetailPath = (id: number | string) => `${RECEPCIONES_PATH}/${id}`
export const MOVIMIENTOS_PATH = '/admin/inventario/movimientos'
export const movimientoDetailPath = (id: number | string) => `${MOVIMIENTOS_PATH}/${id}`
