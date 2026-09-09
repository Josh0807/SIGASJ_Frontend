import { act, type ReactElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ActivityFeedback from './ActivityFeedback'

describe('ActivityFeedback', () => {
  let container: HTMLDivElement
  let root: Root

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  const mount = (ui: ReactElement) => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => {
      root.render(ui)
    })
  }

  it('usa role=status en éxito e info, y role=alert en error/warning', () => {
    mount(<ActivityFeedback variant="success" message="Listo" />)
    expect(container.querySelector('[role="status"]')).not.toBeNull()

    act(() => {
      root.render(<ActivityFeedback variant="error" message="Falló" />)
    })
    expect(container.querySelector('[role="alert"]')).not.toBeNull()

    act(() => {
      root.render(<ActivityFeedback variant="warning" message="Revise" />)
    })
    expect(container.querySelector('[role="alert"]')).not.toBeNull()
  })

  it('permite cerrar el mensaje sin duplicar el dismiss', () => {
    const onDismiss = vi.fn()
    mount(
      <ActivityFeedback
        variant="success"
        message="Guardado"
        dismissible
        onDismiss={onDismiss}
        testId="feedback-dismiss"
      />,
    )

    const dismissButtons = container.querySelectorAll(
      '.activity-feedback__dismiss',
    )
    expect(dismissButtons).toHaveLength(1)
    act(() => {
      ;(dismissButtons[0] as HTMLButtonElement).click()
    })
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(
      container.querySelector('[data-testid="feedback-dismiss"]'),
    ).not.toBeNull()
  })

  it('renderiza acción de reintento una sola vez', () => {
    mount(
      <ActivityFeedback
        variant="error"
        message="No se pudo cargar"
        action={
          <button type="button" className="activity-feedback__retry">
            Reintentar
          </button>
        }
      />,
    )

    expect(container.querySelectorAll('.activity-feedback__retry')).toHaveLength(
      1,
    )
    expect(container.textContent).toContain('No se pudo cargar')
    expect(container.textContent).toContain('Reintentar')
  })
})
