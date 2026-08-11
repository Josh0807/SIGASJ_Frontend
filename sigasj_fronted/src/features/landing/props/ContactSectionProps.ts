import type { ReactNode } from 'react'

export type ContactSectionProps = {
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
  embeddedMap?: ReactNode
  showMapEmbed?: boolean
}