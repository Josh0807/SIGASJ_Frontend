import type { ReactNode } from 'react'

export type IndicatorBadgeType = 'success' | 'warning' | 'info' | 'alert' | 'default'

export type IndicatorCardProps = {
  /** Título del indicador (ej: "Abonados activos", "Lecturas pendientes") */
  title: string
  /** Valor numérico o de texto del indicador */
  value?: string | number | null
  /** Ícono o nodo React representativo */
  icon?: ReactNode
  /** Descripción secundaria o texto aclaratorio opcional */
  description?: string
  /** Texto de etiqueta o estado opcional */
  badgeText?: string
  /** Variante visual de la etiqueta (success, warning, info, alert, default) */
  badgeType?: IndicatorBadgeType
  /** Texto fallback cuando el valor es nulo o no disponible (por defecto: "N/D") */
  fallbackText?: string
  /** Enlace opcional a la sección detallada del indicador */
  link?: string
  /** Clases CSS adicionales */
  className?: string
  /** Estado de carga activo (muestra esqueleto animado) */
  isLoading?: boolean
  /** Estado de error activo en la consulta del indicador */
  isError?: boolean
  /** Mensaje aclaratorio de error */
  errorMessage?: string
  /** Función callback para reintentar la consulta de este indicador */
  onRetry?: () => void
}
