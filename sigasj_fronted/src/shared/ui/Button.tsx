import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { buttonVariants, type ButtonVariantProps } from './button-variants'
import { cn } from './cn'

type CommonProps = ButtonVariantProps & {
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  className?: string
  children: ReactNode
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & {
    to?: undefined
    href?: undefined
  }

type ButtonAsLink = CommonProps &
  Omit<LinkProps, 'children' | 'className'> & {
    to: LinkProps['to']
    href?: undefined
  }

type ButtonAsAnchor = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'> & {
    href: string
    to?: undefined
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    className,
    children,
    ...rest
  } = props

  const composed = cn(buttonVariants({ variant, size }), className)
  const content = (
    <>
      {loading ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading ? rightIcon : null}
    </>
  )

  if ('to' in props && props.to !== undefined) {
    const { to, ...linkRest } = rest as Omit<
      LinkProps,
      'children' | 'className' | 'to'
    > & { to: LinkProps['to'] }
    return (
      <Link
        {...linkRest}
        to={to}
        className={composed}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
      >
        {content}
      </Link>
    )
  }

  if ('href' in props && props.href) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <a
        {...anchorRest}
        href={href}
        className={composed}
        aria-busy={loading || undefined}
      >
        {content}
      </a>
    )
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button
      {...buttonRest}
      type={buttonRest.type ?? 'button'}
      className={composed}
      disabled={buttonRest.disabled || loading}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  )
}

export default Button
