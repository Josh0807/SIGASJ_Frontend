import { act, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ConfirmDialog from './ConfirmDialog'

const pressKey = (
  element: Element,
  key: string,
  options: { activate?: boolean; shiftKey?: boolean } = {},
) => {
  const down = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    shiftKey: options.shiftKey ?? false,
  })

  element.dispatchEvent(down)

  if (options.activate && (key === 'Enter' || key === ' ')) {
    element.dispatchEvent(
      new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }),
    )

    if (!down.defaultPrevented && element instanceof HTMLElement) {
      element.click()
    }
  }
}

const DialogHarness = () => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button ref={triggerRef} type="button" className="dialog-trigger" onClick={() => setIsOpen(true)}>
        Abrir
      </button>
      <ConfirmDialog
        isOpen={isOpen}
        title="Cerrar sesión"
        message="¿Está seguro de que desea cerrar sesión?"
        confirmLabel="Cerrar sesión"
        confirmDanger
        returnFocusRef={triggerRef}
        onCancel={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
      />
    </>
  )
}

describe('ConfirmDialog', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('renderiza título, mensaje y acciones cuando está abierto', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ConfirmDialog
          isOpen
          title="Cerrar sesión"
          message="¿Está seguro de que desea cerrar sesión?"
          confirmLabel="Cerrar sesión"
          onCancel={() => {}}
          onConfirm={() => {}}
        />,
      )
    })

    expect(container.querySelector('.confirm-dialog__title')?.textContent).toBe(
      'Cerrar sesión',
    )
    expect(container.querySelector('.confirm-dialog__message')?.textContent).toBe(
      '¿Está seguro de que desea cerrar sesión?',
    )
    expect(container.textContent).toContain('Cancelar')
    expect(container.textContent).toContain('Cerrar sesión')
    expect(container.querySelector('[role="alertdialog"]')).not.toBeNull()
    expect(container.querySelector('[aria-modal="true"]')).not.toBeNull()

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('asocia título y descripción accesibles al diálogo de confirmación', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ConfirmDialog
          isOpen
          title="Cerrar sesión"
          message="Confirme si desea cerrar sesión. Deberá iniciar sesión nuevamente para acceder al panel administrativo."
          cancelLabel="Cancelar"
          confirmLabel="Cerrar sesión"
          confirmDanger
          onCancel={() => {}}
          onConfirm={() => {}}
        />,
      )
    })

    const panel = container.querySelector('[role="alertdialog"]') as HTMLElement
    const title = container.querySelector('.confirm-dialog__title') as HTMLHeadingElement
    const message = container.querySelector('.confirm-dialog__message') as HTMLParagraphElement
    const cancelButton = container.querySelector(
      '.confirm-dialog__button--secondary',
    ) as HTMLButtonElement
    const confirmButton = container.querySelector(
      '.confirm-dialog__button--danger',
    ) as HTMLButtonElement

    expect(panel).not.toBeNull()
    expect(panel.getAttribute('aria-modal')).toBe('true')
    expect(panel.getAttribute('aria-labelledby')).toBe(title.id)
    expect(panel.getAttribute('aria-describedby')).toBe(message.id)
    expect(title.tagName).toBe('H2')
    expect(title.textContent).toBe('Cerrar sesión')
    expect(message.textContent).toContain('Confirme si desea cerrar sesión')
    expect(message.textContent).toContain('iniciar sesión nuevamente')
    expect(cancelButton.type).toBe('button')
    expect(cancelButton.textContent).toBe('Cancelar')
    expect(confirmButton.type).toBe('button')
    expect(confirmButton.textContent).toBe('Cerrar sesión')

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('no renderiza contenido cuando está cerrado', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ConfirmDialog
          isOpen={false}
          title="Cerrar sesión"
          message="¿Está seguro de que desea cerrar sesión?"
          confirmLabel="Cerrar sesión"
          onCancel={() => {}}
          onConfirm={() => {}}
        />,
      )
    })

    expect(container.querySelector('.confirm-dialog')).toBeNull()

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('ejecuta onCancel con Escape o botón Cancelar', async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ConfirmDialog
          isOpen
          title="Cerrar sesión"
          message="¿Está seguro de que desea cerrar sesión?"
          confirmLabel="Cerrar sesión"
          onCancel={onCancel}
          onConfirm={onConfirm}
        />,
      )
    })

    const cancelButton = container.querySelector(
      '.confirm-dialog__button--secondary',
    ) as HTMLButtonElement

    await act(async () => {
      cancelButton.focus()
      pressKey(cancelButton, 'Escape')
    })

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()

    onCancel.mockClear()

    await act(async () => {
      root.render(
        <ConfirmDialog
          isOpen
          title="Cerrar sesión"
          message="¿Está seguro de que desea cerrar sesión?"
          confirmLabel="Cerrar sesión"
          onCancel={onCancel}
          onConfirm={onConfirm}
        />,
      )
    })

    const cancelButtonAgain = container.querySelector(
      '.confirm-dialog__button--secondary',
    ) as HTMLButtonElement

    await act(async () => {
      cancelButtonAgain.click()
    })

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('permite navegar entre acciones con Tab y Shift+Tab', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ConfirmDialog
          isOpen
          title="Cerrar sesión"
          message="¿Está seguro de que desea cerrar sesión?"
          confirmLabel="Cerrar sesión"
          confirmDanger
          onCancel={() => {}}
          onConfirm={() => {}}
        />,
      )
    })

    const cancelButton = container.querySelector(
      '.confirm-dialog__button--secondary',
    ) as HTMLButtonElement
    const confirmButton = container.querySelector(
      '.confirm-dialog__button--danger',
    ) as HTMLButtonElement

    expect(document.activeElement).toBe(cancelButton)

    await act(async () => {
      pressKey(cancelButton, 'Tab')
    })

    expect(document.activeElement).toBe(confirmButton)

    await act(async () => {
      pressKey(confirmButton, 'Tab', { shiftKey: true })
    })

    expect(document.activeElement).toBe(cancelButton)

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('activa acciones con Enter y Space en el botón enfocado', async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ConfirmDialog
          isOpen
          title="Cerrar sesión"
          message="¿Está seguro de que desea cerrar sesión?"
          confirmLabel="Cerrar sesión"
          confirmDanger
          onCancel={onCancel}
          onConfirm={onConfirm}
        />,
      )
    })

    const cancelButton = container.querySelector(
      '.confirm-dialog__button--secondary',
    ) as HTMLButtonElement

    await act(async () => {
      cancelButton.focus()
      pressKey(cancelButton, 'Enter', { activate: true })
    })

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()

    onCancel.mockClear()
    onConfirm.mockClear()

    await act(async () => {
      root.render(
        <ConfirmDialog
          isOpen
          title="Cerrar sesión"
          message="¿Está seguro de que desea cerrar sesión?"
          confirmLabel="Cerrar sesión"
          confirmDanger
          onCancel={onCancel}
          onConfirm={onConfirm}
        />,
      )
    })

    const confirmButtonAgain = container.querySelector(
      '.confirm-dialog__button--danger',
    ) as HTMLButtonElement

    await act(async () => {
      confirmButtonAgain.focus()
      pressKey(confirmButtonAgain, ' ', { activate: true })
    })

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('ejecuta onConfirm desde el botón de confirmación', async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ConfirmDialog
          isOpen
          title="Cerrar sesión"
          message="¿Está seguro de que desea cerrar sesión?"
          confirmLabel="Cerrar sesión"
          confirmDanger
          onCancel={onCancel}
          onConfirm={onConfirm}
        />,
      )
    })

    const confirmButton = container.querySelector(
      '.confirm-dialog__button--danger',
    ) as HTMLButtonElement

    await act(async () => {
      confirmButton.click()
    })

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('ejecuta onConfirm una sola vez aunque se dispare repetidamente', async () => {
    const onConfirm = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ConfirmDialog
          isOpen
          title="Cerrar sesión"
          message="¿Está seguro de que desea cerrar sesión?"
          confirmLabel="Cerrar sesión"
          confirmDanger
          onCancel={() => {}}
          onConfirm={onConfirm}
        />,
      )
    })

    const confirmButton = container.querySelector(
      '.confirm-dialog__button--danger',
    ) as HTMLButtonElement

    expect(confirmButton).not.toBeNull()

    await act(async () => {
      confirmButton.click()
      confirmButton.click()
    })

    expect(onConfirm).toHaveBeenCalledTimes(1)

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('restaura el foco al elemento de origen al cerrarse', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<DialogHarness />)
    })

    const trigger = container.querySelector('.dialog-trigger') as HTMLButtonElement

    await act(async () => {
      trigger.click()
    })

    const cancelButton = container.querySelector(
      '.confirm-dialog__button--secondary',
    ) as HTMLButtonElement

    expect(document.activeElement).toBe(cancelButton)

    await act(async () => {
      cancelButton.click()
    })

    expect(document.activeElement).toBe(trigger)

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('restaura el foco al cancelar con Escape', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<DialogHarness />)
    })

    const trigger = container.querySelector('.dialog-trigger') as HTMLButtonElement

    await act(async () => {
      trigger.click()
    })

    const cancelButton = container.querySelector(
      '.confirm-dialog__button--secondary',
    ) as HTMLButtonElement

    await act(async () => {
      pressKey(cancelButton, 'Escape')
    })

    expect(document.activeElement).toBe(trigger)

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('no restaura el foco al confirmar', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    const ConfirmHarness = () => {
      const triggerRef = useRef<HTMLButtonElement>(null)
      const [isOpen, setIsOpen] = useState(false)

      return (
        <>
          <button
            ref={triggerRef}
            type="button"
            className="dialog-trigger"
            onClick={() => setIsOpen(true)}
          >
            Abrir
          </button>
          <button type="button" className="background-action">
            Acción posterior
          </button>
          <ConfirmDialog
            isOpen={isOpen}
            title="Cerrar sesión"
            message="¿Está seguro de que desea cerrar sesión?"
            confirmLabel="Cerrar sesión"
            confirmDanger
            returnFocusRef={triggerRef}
            onCancel={() => setIsOpen(false)}
            onConfirm={() => setIsOpen(false)}
          />
        </>
      )
    }

    await act(async () => {
      root.render(<ConfirmHarness />)
    })

    const trigger = container.querySelector('.dialog-trigger') as HTMLButtonElement
    const backgroundAction = container.querySelector(
      '.background-action',
    ) as HTMLButtonElement

    await act(async () => {
      trigger.click()
    })

    const confirmButton = container.querySelector(
      '.confirm-dialog__button--danger',
    ) as HTMLButtonElement

    await act(async () => {
      confirmButton.focus()
      backgroundAction.focus()
      expect(document.activeElement).toBe(backgroundAction)
      confirmButton.click()
    })

    expect(document.activeElement).toBe(backgroundAction)

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('mantiene el foco dentro del diálogo al usar Tab', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <>
          <button type="button" className="background-action">
            Fuera del diálogo
          </button>
          <ConfirmDialog
            isOpen
            title="Cerrar sesión"
            message="¿Está seguro de que desea cerrar sesión?"
            confirmLabel="Cerrar sesión"
            confirmDanger
            onCancel={() => {}}
            onConfirm={() => {}}
          />
        </>,
      )
    })

    const cancelButton = container.querySelector(
      '.confirm-dialog__button--secondary',
    ) as HTMLButtonElement
    const confirmButton = container.querySelector(
      '.confirm-dialog__button--danger',
    ) as HTMLButtonElement
    const outsideButton = container.querySelector(
      '.background-action',
    ) as HTMLButtonElement

    expect(document.activeElement).toBe(cancelButton)

    await act(async () => {
      pressKey(cancelButton, 'Tab')
    })

    expect(document.activeElement).toBe(confirmButton)

    await act(async () => {
      pressKey(confirmButton, 'Tab')
    })

    expect(document.activeElement).toBe(cancelButton)
    expect(document.activeElement).not.toBe(outsideButton)

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })
})
