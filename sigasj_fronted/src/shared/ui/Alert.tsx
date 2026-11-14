import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './cn'

const alertVariants = cva(
  'flex items-start gap-3 rounded-[var(--radius-sigasj-card)] border px-4 py-3.5 text-left text-sm',
  {
    variants: {
      tone: {
        info: 'border-sigasj-border bg-sigasj-surface-soft text-sigasj-text',
        success:
          'border-[color-mix(in_srgb,var(--color-sigasj-success)_28%,var(--color-sigasj-border))] bg-[color-mix(in_srgb,var(--color-sigasj-success)_14%,var(--asada-surface))] text-sigasj-text',
        warning:
          'border-[color-mix(in_srgb,var(--color-sigasj-warning)_30%,var(--color-sigasj-border))] bg-[color-mix(in_srgb,var(--color-sigasj-warning)_14%,var(--asada-surface))] text-sigasj-text',
        danger:
          'border-[color-mix(in_srgb,var(--color-sigasj-error)_28%,var(--color-sigasj-border))] bg-[color-mix(in_srgb,var(--color-sigasj-error)_12%,var(--asada-surface))] text-sigasj-text',
      },
    },
    defaultVariants: {
      tone: 'info',
    },
  },
)

export type AlertProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    icon?: ReactNode
    title?: ReactNode
    children: ReactNode
  }

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone, icon, title, className, children, role, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(alertVariants({ tone }), className)}
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
      {...rest}
    >
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
      <div className="grid min-w-0 flex-1 gap-1">
        {title ? <strong className="text-sigasj-ink">{title}</strong> : null}
        <div>{children}</div>
      </div>
    </div>
  )
})

export default Alert
