export interface HeroSectionProps {
  id?: string
  title?: string
  description?: string
  imageSrc?: string
  imageAlt?: string
  paymentsLabel?: string
  paymentsHref?: string
  reportLabel?: string
  reportHref?: string
  quickActions?: HeroQuickAction[]
}

export type HeroQuickActionIcon = 'payments' | 'contact' | 'announcements' | 'gallery'

export type HeroQuickAction = {
  label: string
  title: string
  href: `#${string}`
  icon: HeroQuickActionIcon
}
