import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-sigasj-button)] font-[inherit] font-semibold no-underline transition-[background-color,border-color,color,box-shadow,filter] duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sigasj-primary/40',
  {
    variants: {
      variant: {
        primary:
          'border border-sigasj-primary bg-sigasj-primary text-white shadow-[0_8px_18px_rgba(30,90,156,0.22)] hover:bg-sigasj-primary-hover hover:border-sigasj-primary-hover',
        secondary:
          'border border-sigasj-border-strong bg-sigasj-surface text-sigasj-ink hover:border-sigasj-primary hover:bg-sigasj-surface-soft',
        tertiary:
          'border border-transparent bg-transparent text-sigasj-primary hover:bg-sigasj-surface-soft',
        danger:
          'border border-sigasj-error bg-sigasj-error text-white hover:brightness-95',
        ghost:
          'border border-transparent bg-transparent text-sigasj-muted hover:bg-sigasj-surface-soft hover:text-sigasj-ink',
      },
      size: {
        sm: 'min-h-9 gap-1.5 px-3.5 text-[13px]',
        md: 'min-h-11 gap-2 px-4 text-sm',
        lg: 'min-h-12 gap-2.5 px-5 text-[15px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
