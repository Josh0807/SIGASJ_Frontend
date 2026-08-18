export type AdminAccountMenuPlaceholderItem = {
  id: string
  label: string
  hint?: string
}

export const ADMIN_ACCOUNT_MENU_PLACEHOLDER_ITEMS: AdminAccountMenuPlaceholderItem[] =
  [
    {
      id: 'profile',
      label: 'Ver perfil',
      hint: 'Próximamente',
    },
    {
      id: 'settings',
      label: 'Configuración',
      hint: 'Próximamente',
    },
  ]
