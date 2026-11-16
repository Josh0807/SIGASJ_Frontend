/** Microcopy estandarizado del panel admin (ES). */

export const ADMIN_COPY = {
  retry: 'Reintentar',
  save: 'Guardar',
  cancel: 'Cancelar',
  back: 'Volver',
  backToList: 'Volver al listado',
  backHome: 'Volver inicio',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
  activate: 'Activar',
  deactivate: 'Desactivar',
  loading: (resource: string) => `Cargando ${resource}…`,
  empty: (resource: string) => `No hay ${resource} por el momento.`,
  emptyFiltered: (resource: string) =>
    `No hay ${resource} con los filtros actuales.`,
  loadError: (resource: string) =>
    `No fue posible cargar ${resource}. Intenta de nuevo.`,
  actionError: (action: string, resource: string) =>
    `No fue posible ${action} ${resource}. Intenta de nuevo.`,
  deleteConfirm: (label: string) =>
    `¿Eliminar «${label}»? Esta acción no se puede deshacer.`,
} as const

export type AdminResourceLabel = string
