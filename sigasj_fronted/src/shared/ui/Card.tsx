import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'article' | 'div' | 'section' | 'li'
  interactive?: boolean
  padded?: boolean
  children: ReactNode
}

export function Card({
  as: Component = 'article',
  interactive = false,
  padded = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Component
      className={cn(
        'rounded-[var(--radius-sigasj-card)] border border-sigasj-border bg-sigasj-surface shadow-[0_4px_14px_rgba(30,90,156,0.05)]',
        padded && 'p-5',
        interactive &&
          'transition-[border-color,box-shadow] duration-150 ease-out hover:border-sigasj-primary/40 hover:shadow-[0_8px_20px_rgba(30,90,156,0.08)]',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}

export default Card
