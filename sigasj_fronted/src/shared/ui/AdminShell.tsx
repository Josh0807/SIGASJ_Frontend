import { useRef, type HTMLAttributes, type ReactNode } from 'react'
import { useAdminPageEnter } from './adminMotion'
import { cn } from './cn'

export type AdminShellProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  /** Desactiva la entrada GSAP (p. ej. pantallas anidadas). */
  animateEnter?: boolean
}

/** Contenedor estándar de páginas del panel admin (look landing + entrada GSAP). */
export function AdminShell({
  className,
  children,
  animateEnter = true,
  ...rest
}: AdminShellProps) {
  const ref = useRef<HTMLElement>(null)
  useAdminPageEnter(ref, { enabled: animateEnter })

  return (
    <main
      ref={ref}
      className={cn(
        'admin-content-modern admin-shell-landing grid w-full min-w-0 gap-5',
        animateEnter && 'admin-shell-landing--animated',
        className,
      )}
      {...rest}
    >
      {children}
    </main>
  )
}

export default AdminShell
