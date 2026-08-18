import type { ReactNode } from 'react'

export type QuickAccessCardProps = {
  /** Nombre o título de la función/módulo */
  title: string
  /** Ruta administrativa de destino (React Router SPA) */
  path: string
  /** Descripción corta o detalle funcional */
  description?: string
  /** Ícono o nodo React representativo */
  icon?: ReactNode
  /** Indica si la opción está autorizada para el usuario actual (por defecto: true) */
  isAuthorized?: boolean
  /** Etiqueta o badge secundario opcional */
  badgeText?: string
  /** Clases CSS adicionales */
  className?: string
}
