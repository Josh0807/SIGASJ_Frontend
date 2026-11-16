import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'article' | 'div' | 'section' | 'li'
  interactive?: boolean
  padded?: boolean
  /** Hover lift estilo landing (default true cuando interactive). */
  lift?: boolean
  children: ReactNode
}

export function Card({
  as: Component = 'article',
  interactive = false,
  padded = false,
  lift,
  className,
  children,
  ...rest
}: CardProps) {
  const useLift = lift ?? interactive

  return (
    <Component
      className={cn(
        'rounded-[13px] border border-sigasj-border bg-white shadow-[0_4px_14px_rgba(30,90,156,0.05)]',
        padded && 'p-5',
        useLift && 'landing-lift-card',
        interactive &&
          'transition-[border-color,box-shadow,transform] duration-[350ms] ease-out hover:border-[rgba(90,174,230,0.65)]',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}

export default Card
