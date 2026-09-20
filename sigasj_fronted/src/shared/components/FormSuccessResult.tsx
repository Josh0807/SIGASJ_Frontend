import { forwardRef } from 'react'
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
      className = '',
      titleClassName = '',
      highlightLabelClassName = '',
      highlightValueClassName = '',
    },
    ref,
  ) => {
    const classes = [
      'form-success-result',
      'max-w-3xl shadow-sm',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={ref} className={classes} role="status" tabIndex={-1}>
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
