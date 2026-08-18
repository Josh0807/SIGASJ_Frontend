import type { PublicFormPlaceholderProps } from '../props'

export type { PublicFormPlaceholderProps }

const PublicFormPlaceholder = ({ label }: PublicFormPlaceholderProps) => (
  <main aria-label={label} />
)

export default PublicFormPlaceholder
