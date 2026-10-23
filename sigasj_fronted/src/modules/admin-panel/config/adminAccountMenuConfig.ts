export type AdminAccountMenuPlaceholderItem = {
  id: string
  label: string
  hint?: string
}

/**
 * Acciones de cuenta aún no implementadas.
 * Vacío a propósito: no mostrar botones disabled/“Próximamente” en el menú.
 * Cuando exista SettingsPage, agregar aquí o preferible un enlace real.
 */
export const ADMIN_ACCOUNT_MENU_PLACEHOLDER_ITEMS: AdminAccountMenuPlaceholderItem[] =
  []
