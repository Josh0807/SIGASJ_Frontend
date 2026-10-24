import { IconCheck, IconCopy } from '@tabler/icons-react'
import { forwardRef, useState } from 'react'
import type { FormSuccessResultProps } from '../props/FormSuccessResultProps'

export type { FormSuccessResultProps }

const FormSuccessResult = forwardRef<HTMLDivElement, FormSuccessResultProps>(
  (
    {
      title,
      description,
      highlightLabel,
      highlightValue,
      meta = [],
      hint,
      actions,
      icon,
      className = '',
      titleClassName = '',
      highlightLabelClassName = '',
      highlightValueClassName = '',
    },
    ref,
  ) => {
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
    const classes = [
      'form-success-result',
      'max-w-3xl shadow-sm',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const copyHighlight = async () => {
      if (!highlightValue) return
      try {
        await navigator.clipboard.writeText(highlightValue)
        setCopyState('copied')
      } catch {
        setCopyState('error')
      }
    }

    return (
      <div ref={ref} className={classes} role="status" tabIndex={-1}>
        {icon ? <div className="form-success-result__icon" aria-hidden="true">{icon}</div> : null}
        <p className={['form-success-result__title', titleClassName].filter(Boolean).join(' ')}>{title}</p>
        {description ? <p className="form-success-result__description">{description}</p> : null}

        {highlightValue ? (
          <div className="form-success-result__highlight">
            {highlightLabel ? (
              <p className={['form-success-result__highlight-label', highlightLabelClassName].filter(Boolean).join(' ')}>
                {highlightLabel}
              </p>
            ) : null}
            <p className={['form-success-result__highlight-value', 'break-all', highlightValueClassName].filter(Boolean).join(' ')}>
              {highlightValue}
            </p>
            <button className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-[#1476cf] bg-white px-5 text-sm font-extrabold text-[#0b65b5] transition hover:bg-sky-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400" type="button" onClick={() => void copyHighlight()}>
              {copyState === 'copied' ? <IconCheck size={18} aria-hidden="true" /> : <IconCopy size={18} aria-hidden="true" />}
              {copyState === 'copied' ? 'Código copiado' : 'Copiar código'}
            </button>
            {copyState === 'error' ? <p className="mb-0 mt-2 text-sm font-semibold text-red-700" role="alert">No fue posible copiar automáticamente. Selecciona el código y cópialo manualmente.</p> : null}
          </div>
        ) : null}

        {meta.length > 0 ? (
          <dl className="form-success-result__meta">
            {meta.map((item) => (
              <div key={item.label} className="form-success-result__meta-item">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {hint ? <p className="form-success-result__hint">{hint}</p> : null}
        {actions ? <div className="form-success-result__actions">{actions}</div> : null}
      </div>
    )
  },
)

FormSuccessResult.displayName = 'FormSuccessResult'

export default FormSuccessResult
