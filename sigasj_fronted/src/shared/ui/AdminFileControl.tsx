import { useId, useRef, type ChangeEvent, type ReactNode } from 'react'
import { IconUpload } from '@tabler/icons-react'
import { Button } from './Button'
import { cn } from './cn'

export type AdminFileControlProps = {
  accept?: string
  label?: ReactNode
  hint?: ReactNode
  fileName?: string | null
  emptyLabel?: string
  disabled?: boolean
  className?: string
  onFileChange: (file: File | null) => void
}

/** Selector de archivo con estilo Button ASADA (oculta el input nativo). */
export function AdminFileControl({
  accept,
  label,
  hint,
  fileName,
  emptyLabel = 'Ningún archivo seleccionado',
  disabled = false,
  className,
  onFileChange,
}: AdminFileControlProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileChange(event.target.files?.[0] ?? null)
    event.target.value = ''
  }

  return (
    <div className={cn('grid gap-2', className)}>
      {label ? (
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted">
          {label}
        </span>
      ) : null}
      <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-[10px] border border-sigasj-border bg-white p-2">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled}
          onChange={handleChange}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          leftIcon={<IconUpload size={16} aria-hidden="true" />}
          onClick={() => inputRef.current?.click()}
        >
          Elegir archivo
        </Button>
        <span className="min-w-0 flex-1 truncate text-sm text-sigasj-muted">
          {fileName?.trim() || emptyLabel}
        </span>
      </div>
      {hint ? (
        <small className="text-[0.78rem] leading-snug text-sigasj-muted">{hint}</small>
      ) : null}
    </div>
  )
}

export default AdminFileControl
