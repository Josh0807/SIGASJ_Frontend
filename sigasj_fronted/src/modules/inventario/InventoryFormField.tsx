import type { ReactNode } from 'react'

export function InventoryFormHeading({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="provider-admin__form-heading">
      <span>{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  )
}

export function InventoryFormField({
  label,
  icon,
  error,
  full = false,
  hint,
  children,
}: {
  label: string
  icon: ReactNode
  error?: string
  full?: boolean
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <label className={full ? 'materials-admin__form-full' : undefined}>
      <span>{label}</span>
      <span className="provider-admin__control">
        {icon}
        {children}
      </span>
      {error ? (
        <small className="materials-admin__field-error" role="alert">
          {error}
        </small>
      ) : null}
      {hint}
    </label>
  )
}
