import type { ReactNode } from 'react'

/** Clase del input de fecha automática (solo lectura, compacto y grisáceo). */
export const PUBLIC_READONLY_DATE_INPUT_CLASS =
  'box-border h-10 w-full max-w-[13.5rem] cursor-default rounded-[10px] border border-sigasj-border bg-slate-100 px-3 text-sm font-medium leading-10 text-sigasj-muted [font-family:var(--font-body)] disabled:opacity-100'

type FieldCaptionProps = {
  label: ReactNode
  /** true = obligatorio (*), false = (opcional), undefined = sin marca */
  required?: boolean
  hint?: ReactNode
}

/**
 * Caption de campo para labels con `display: grid`.
 * Agrupa texto + asterisco en una sola celda para que el * no caiga a otra fila.
 */
export const FieldCaption = ({
  label,
  required,
  hint,
}: FieldCaptionProps) => (
  <>
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
      <span>{label}</span>
      {required === true ? (
        <>
          <span className="text-rose-600" aria-hidden="true">
            *
          </span>
          <span className="sr-only">obligatorio</span>
        </>
      ) : null}
      {required === false ? (
        <span className="font-medium text-sigasj-muted">(opcional)</span>
      ) : null}
    </span>
    {hint ? (
      <span className="text-sm font-medium text-sigasj-muted">{hint}</span>
    ) : null}
  </>
)

type ReadonlyDateFieldProps = {
  label?: string
  value: string
  className?: string
}

/** Fecha de solicitud / reporte generada automáticamente. */
export const ReadonlyDateField = ({
  label = 'Fecha de solicitud',
  value,
  className = '',
}: ReadonlyDateFieldProps) => (
  <label className={`grid gap-2 font-bold text-sigasj-ink ${className}`.trim()}>
    <span>{label}</span>
    <input
      className={PUBLIC_READONLY_DATE_INPUT_CLASS}
      value={value}
      readOnly
      disabled
      aria-readonly="true"
      title="Fecha generada automáticamente; no se puede editar"
    />
  </label>
)
