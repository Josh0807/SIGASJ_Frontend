import type { ReactNode } from 'react'

export interface ContactSectionProps {
  id?: string
  title?: string
  description?: string
  phonePrimary?: string
  phoneNumbers?: string[]
  email?: string
  attentionHours?: string
  address?: string
  locationReference?: string
  mapUrl?: string
  mapLatitude?: number
  mapLongitude?: number
  mapZoom?: number
  mapDescription?: string
  loading?: boolean
  embeddedMap?: ReactNode
  showMapEmbed?: boolean
  layout?: 'standalone' | 'hub'
}
