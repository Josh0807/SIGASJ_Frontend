import { act, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { createRoot } from 'react-dom/client'
import FechaFeriadoPicker from './FechaFeriadoPicker'

const mount = async (ui: ReactNode) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(ui)
  })
  return {
    container,
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('FechaFeriadoPicker', () => {
  it('marca feriados de abril 2026 (Semana Santa y Juan Santamaría)', async () => {
    const onChange = vi.fn()
    const view = await mount(
      <FechaFeriadoPicker
        label="Fecha de inicio"
        value="2026-04-01"
        onChange={onChange}
      />,
    )
    try {
      const trigger = view.container.querySelector(
        'button[aria-haspopup="dialog"]',
      ) as HTMLButtonElement
      await act(async () => {
        trigger.click()
      })

      const dialog = document.querySelector('[role="dialog"]') as HTMLElement
      expect(dialog).toBeTruthy()
      const feriado = dialog.querySelector('button[aria-label*="feriado"]')
      expect(feriado).toBeTruthy()
      expect(dialog.textContent).toMatch(/feriado/i)
      expect(
        dialog.querySelector(
          'button[aria-label*="Jueves Santo"], button[title*="Jueves Santo"]',
        ),
      ).toBeTruthy()
      expect(
        dialog.querySelector(
          'button[title*="Juan Santamaría"], button[aria-label*="Juan Santamaría"]',
        ),
      ).toBeTruthy()
    } finally {
      await view.cleanup()
    }
  })

  it('permite elegir un día y cierra el panel', async () => {
    const onChange = vi.fn()
    const view = await mount(
      <FechaFeriadoPicker
        label="Fecha de fin"
        value=""
        onChange={onChange}
      />,
    )
    try {
      const trigger = view.container.querySelector(
        'button[aria-haspopup="dialog"]',
      ) as HTMLButtonElement
      await act(async () => {
        trigger.click()
      })
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement
      const dia = Array.from(dialog.querySelectorAll('button[aria-label]')).find(
        (b) => /15\//.test(b.getAttribute('aria-label') || ''),
      )
      expect(dia).toBeTruthy()
      await act(async () => {
        ;(dia as HTMLButtonElement).click()
      })
      expect(onChange).toHaveBeenCalled()
      expect(document.querySelector('[role="dialog"]')).toBeNull()
    } finally {
      await view.cleanup()
    }
  })
})
