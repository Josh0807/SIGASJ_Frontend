export type RequestServiceIcon =
  | 'service-record'
  | 'affiliation'
  | 'payment-plan'
  | 'account-change'

export interface RequestService {
  id: string
  name: string
  description: string
  formHref: string
  icon: RequestServiceIcon
}

export interface RequestsSectionProps {
  id?: string
  title?: string
  description?: string
  services?: RequestService[]
}
