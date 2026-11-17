import type { ReactNode } from 'react'
import { cn } from '../../shared/ui'

export function InventoryFormHeading({
  icon,
  title,
  description,
  className,
}: {
  icon: ReactNode
  title: string
  description: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'col-span-full flex items-start gap-3 border-b border-slate-100 pb-6 sm:gap-4',
        className,
      )}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eaf6ff] text-[#1e5a9c] sm:size-12">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-extrabold leading-tight tracking-tight text-[#073b73] sm:text-xl">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  )
}

const controlChrome =
  '[&_input]:min-w-0 [&_input]:flex-1 [&_input]:border-0 [&_input]:bg-transparent [&_input]:py-3 [&_input]:text-slate-800 [&_input]:outline-none [&_input]:placeholder:text-slate-400 ' +
  '[&_select]:w-full [&_select]:min-w-0 [&_select]:flex-1 [&_select]:border-0 [&_select]:bg-transparent [&_select]:py-3 [&_select]:text-slate-800 [&_select]:outline-none ' +
  '[&_textarea]:min-h-28 [&_textarea]:w-full [&_textarea]:min-w-0 [&_textarea]:flex-1 [&_textarea]:resize-y [&_textarea]:border-0 [&_textarea]:bg-transparent [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:placeholder:text-slate-400'

export function InventoryFormField({
  label,
  icon,
  error,
  full = false,
  hint,
  multiline = false,
  children,
}: {
  label: string
  icon: ReactNode
  error?: string
  full?: boolean
  hint?: ReactNode
  multiline?: boolean
  children: ReactNode
}) {
  const invalid = Boolean(error)
  return (
    <label className={cn('grid min-w-0 gap-2.5', full && 'col-span-full')}>
      <span className="text-sm font-bold text-[#163f6b]">{label}</span>
      <span
        className={cn(
          'flex gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5',
          multiline ? 'min-h-28 items-start py-3' : 'min-h-14 items-center',
          invalid
            ? 'border-red-400 focus-within:border-red-500'
            : 'border-slate-200 focus-within:border-[#1e5a9c]',
          controlChrome,
        )}
      >
        <span
          className={cn(
            'shrink-0',
            invalid ? 'text-red-500' : 'text-slate-400',
            multiline && 'mt-0.5',
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
        {children}
      </span>
      {error ? (
        <small className="font-semibold text-red-600" role="alert">
          {error}
        </small>
      ) : null}
      {hint}
    </label>
  )
}