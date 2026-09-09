import type { ReactNode } from 'react'
import type { ActivityFeedbackVariant } from '../utils/activityFeedbackMessages'

export type ActivityFeedbackProps = {
  variant: ActivityFeedbackVariant
  message: ReactNode
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  action?: ReactNode
  className?: string
  testId?: string
}

const variantRole = (
  variant: ActivityFeedbackVariant,
): 'alert' | 'status' =>
  variant === 'error' || variant === 'warning' ? 'alert' : 'status'

/**
 * Mensaje visual reutilizable del módulo de actividades (inline, sin toast).
 */
const ActivityFeedback = ({
  variant,
  message,
  title,
  dismissible = false,
  onDismiss,
  action,
  className = '',
  testId,
}: ActivityFeedbackProps) => {
  const classes = [
    'activity-feedback',
    `activity-feedback--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} role={variantRole(variant)} data-testid={testId}>
      <div className="activity-feedback__body">
        {title ? <p className="activity-feedback__title">{title}</p> : null}
        <div className="activity-feedback__message">{message}</div>
        {action ? <div className="activity-feedback__action">{action}</div> : null}
      </div>
      {dismissible ? (
        <button
          type="button"
          className="activity-feedback__dismiss"
          aria-label="Cerrar mensaje"
          onClick={onDismiss}
        >
          Cerrar
        </button>
      ) : null}
    </div>
  )
}

export default ActivityFeedback
