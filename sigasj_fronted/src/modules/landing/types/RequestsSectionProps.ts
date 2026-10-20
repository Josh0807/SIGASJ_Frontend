export type RequestServiceIcon =
  | 'service-record'
  | 'affiliation'
  | 'payment-plan'
  | 'account-change'
  | 'boundary-infrastructure'
  | 'service-availability'
  | 'downloadable-forms'
  | 'request-tracking'

export interface RequestService {
  id: string
  name: string
  description: string
  formHref?: string
  downloadSlug?: string
  viewHref?: string
  badge?: string
  icon: RequestServiceIcon
}

export interface RequestsSectionProps {
  id?: string
  title?: string
  description?: string
  services?: RequestService[]
}
