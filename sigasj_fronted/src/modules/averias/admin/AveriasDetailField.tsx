import type { ReactNode } from 'react'

type AveriasDetailFieldProps = {
  label: string
  children: ReactNode
  multiline?: boolean
}

const AveriasDetailField = ({
  label,
  children,
  multiline = false,
}: AveriasDetailFieldProps) => (
  <div className={multiline ? 'averias-admin__field is-multiline' : 'averias-admin__field'}>
    <dt>{label}</dt>
    <dd className={multiline ? 'averias-admin__prewrap' : undefined}>{children}</dd>
  </div>
)

export default AveriasDetailField
