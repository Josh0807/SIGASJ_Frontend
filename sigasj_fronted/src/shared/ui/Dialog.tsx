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
            'fixed left-1/2 top-1/2 z-[9999] flex max-h-[min(90dvh,40rem)] w-[min(100%-1rem,28rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[13px] border border-sigasj-border bg-sigasj-surface p-5 shadow-[0_28px_60px_rgba(7,28,52,0.30)] focus:outline-none sm:w-[min(100%-2rem,28rem)] sm:p-7',
            className,
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <RadixDialog.Title className="m-0 font-['Times_New_Roman',Times,serif] text-[1.25rem] font-bold leading-tight text-sigasj-ink">
              {title}
            </RadixDialog.Title>
            {description ? (
              <RadixDialog.Description className="mt-3 m-0 text-sm leading-6 text-sigasj-muted">
                {description}
              </RadixDialog.Description>
            ) : null}
            {children ? <div className="mt-4">{children}</div> : null}
          </div>
          <div className="mt-5 flex flex-col-reverse flex-wrap gap-2 sm:mt-6 sm:flex-row sm:justify-end">
            {footer ?? (
              <RadixDialog.Close asChild>
                <Button type="button" variant="secondary" className="w-full sm:w-auto">
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
