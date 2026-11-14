import type { ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { cn } from './cn'
import { Button } from './Button'

export type UiDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

/** Diálogo ASADA nuevo (Radix). No reemplaza ConfirmDialog legacy. */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: UiDialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[9998] bg-[rgba(7,28,52,0.72)]" />
        <RadixDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[9999] w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-sigasj-border bg-sigasj-surface p-7 shadow-[0_28px_60px_rgba(7,28,52,0.30)] focus:outline-none',
            className,
          )}
        >
          <RadixDialog.Title className="m-0 text-[1.25rem] font-extrabold leading-tight text-sigasj-ink">
            {title}
          </RadixDialog.Title>
          {description ? (
            <RadixDialog.Description className="mt-3 m-0 text-sm leading-6 text-sigasj-muted">
              {description}
            </RadixDialog.Description>
          ) : null}
          {children ? <div className="mt-4">{children}</div> : null}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            {footer ?? (
              <RadixDialog.Close asChild>
                <Button type="button" variant="secondary">
                  Cerrar
                </Button>
              </RadixDialog.Close>
            )}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

export default Dialog
