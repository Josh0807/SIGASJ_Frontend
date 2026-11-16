import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export type AdminShellProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
}

/** Contenedor estándar de páginas del panel admin. */
export function AdminShell({ className, children, ...rest }: AdminShellProps) {
  return (
    <main
      className={cn('admin-content-modern grid w-full min-w-0 gap-4', className)}
      {...rest}
    >
      {children}
    </main>
  )
}

export default AdminShell
