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
  /** Ruta pública del trámite (misma fuente que `SERVICE_REQUEST_ROUTES`). */
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
