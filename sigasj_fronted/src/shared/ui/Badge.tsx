import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-bold leading-none',
  {
    variants: {
      tone: {
        neutral: 'bg-sigasj-surface-soft text-sigasj-muted',
        info: 'bg-sigasj-surface-soft text-sigasj-ink',
        success:
          'bg-[color-mix(in_srgb,var(--color-sigasj-success)_18%,var(--asada-surface))] text-sigasj-success',
        warning:
          'bg-[color-mix(in_srgb,var(--color-sigasj-warning)_18%,var(--asada-surface))] text-sigasj-warning',
        danger:
          'bg-[color-mix(in_srgb,var(--color-sigasj-error)_18%,var(--asada-surface))] text-sigasj-error',
        solid:
          'bg-sigasj-primary text-white shadow-[0_6px_14px_rgba(30,90,156,0.18)]',
      },
    },
    defaultVariants: {
      tone: 'info',
    },
  },
)

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    children: ReactNode
  }

export function Badge({
  tone,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...rest}>
      {children}
    </span>
  )
}

export default Badge
