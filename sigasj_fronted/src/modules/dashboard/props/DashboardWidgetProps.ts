import type { AdminNavIconName } from '../../admin-panel/components/AdminNavIcon'

export type AlertItem = {
  id: string
  code?: string
  title: string
  location: string
  urgency: 'alta' | 'media' | 'baja'
  timeAgo: string
}

export type RecentAlertsWidgetProps = {
  alerts?: AlertItem[]
}

export type ActivityItem = {
  id: string
  user: string
  action: string
  target: string
  timeAgo: string
  icon: 'rrhh' | 'abonados' | 'averias' | 'usuarios' | 'reportes'
}

export type RecentActivityWidgetProps = {
  activities?: ActivityItem[]
}

export type DashboardIndicator = {
  id: string
  label: string
  value: string | number | null
  detail: string
  badgeText: string
  badgeType: 'success' | 'warning' | 'info' | 'alert'
  icon: AdminNavIconName
  link?: string
}
