export type RequestServiceIcon = 'service-record' | 'affiliation' | 'payment-plan' | 'account-change'

export type RequestService = {
  id: string
  name: string
  description: string
  formHref: string
  icon: RequestServiceIcon
}

export type RequestsSectionProps = {
  id?: string
  title?: string
  description?: string
  services?: RequestService[]
}
