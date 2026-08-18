import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react'

export type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string
  cancelLabel?: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
  returnFocusRef?: RefObject<HTMLElement | null>
  confirmDanger?: boolean
  dialogRole?: 'dialog' | 'alertdialog'
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  cancelLabel = 'Cancelar',
  confirmLabel,
  onCancel,
  onConfirm,
  returnFocusRef,
  confirmDanger = false,
  dialogRole = 'alertdialog',
}: ConfirmDialogProps) => {
  const titleId = useId()
  const messageId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const confirmingRef = useRef(false)
  const shouldRestoreFocusRef = useRef(true)

  useEffect(() => {
    if (!isOpen) {
      confirmingRef.current = false
      shouldRestoreFocusRef.current = true
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    const focusReturnTarget = returnFocusRef?.current
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow

      if (shouldRestoreFocusRef.current) {
        focusReturnTarget?.focus()
      }
    }
  }, [isOpen, returnFocusRef])

  const getFocusableActions = useCallback((): HTMLButtonElement[] => {
    return [cancelRef.current, confirmRef.current].filter(
      (item): item is HTMLButtonElement => item instanceof HTMLButtonElement,
    )
  }, [])

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const focusables = getFocusableActions()

    if (focusables.length === 0) {
      return
    }

    const currentIndex = focusables.findIndex((item) => item === document.activeElement)
    const nextIndex = event.shiftKey
      ? currentIndex <= 0
        ? focusables.length - 1
        : currentIndex - 1
      : currentIndex < 0 || currentIndex >= focusables.length - 1
        ? 0
        : currentIndex + 1

    event.preventDefault()
    focusables[nextIndex]?.focus()
  }

  const handleConfirm = () => {
    if (confirmingRef.current) {
      return
    }

    confirmingRef.current = true
    shouldRestoreFocusRef.current = false
    onConfirm()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="confirm-dialog"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="confirm-dialog__panel"
        role={dialogRole}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onKeyDown={handleDialogKeyDown}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="confirm-dialog__title">
          {title}
        </h2>
        <p id={messageId} className="confirm-dialog__message">
          {message}
        </p>
        <div className="confirm-dialog__actions">
          <button
            ref={cancelRef}
            type="button"
            className="confirm-dialog__button confirm-dialog__button--secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`confirm-dialog__button${
              confirmDanger ? ' confirm-dialog__button--danger' : ''
            }`}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
