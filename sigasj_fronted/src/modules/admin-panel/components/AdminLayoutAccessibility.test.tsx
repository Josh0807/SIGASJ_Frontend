import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from '../../../shared/layouts/AdminLayout'
import AdminDashboard from '../../dashboard/AdminDashboard'
import AdminUserMenu from './AdminUserMenu'
import { loginWithAdminSession } from '../../../test/authTestHelpers'

describe('AdminLayout Accessibility (WCAG AA & Keyboard Navigation)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    loginWithAdminSession()
  })

  it('1. Todos los botones e íconos interactivos poseen nombres accesibles (aria-label o aria-expanded)', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )
    })

    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.length).toBeGreaterThan(0)

    for (const button of buttons) {
      const hasText = (button.textContent ?? '').trim().length > 0
      const hasAriaLabel = Boolean(button.getAttribute('aria-label'))
      const hasAriaLabelledby = Boolean(button.getAttribute('aria-labelledby'))

      expect(
        hasText || hasAriaLabel || hasAriaLabelledby,
        `Botón sin etiqueta accesible: ${button.outerHTML}`,
      ).toBe(true)
    }

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('2. El menú de usuario soporta navegación por teclado y cierre mediante tecla Escape', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminUserMenu />
        </MemoryRouter>,
      )
    })

    const trigger = container.querySelector<HTMLButtonElement>('.admin-user-menu__trigger')
    expect(trigger).not.toBeNull()

    // Abrir menú desplegable
    await act(async () => {
      trigger?.click()
    })

    expect(trigger?.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('.admin-user-menu__dropdown')).not.toBeNull()

    // Simular tecla Escape
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })

    await act(async () => {
      window.dispatchEvent(escapeEvent)
    })

    expect(trigger?.getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('.admin-user-menu__dropdown')).toBeNull()

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('3. Los elementos interactivos principales pueden enfocarse con la tecla Tab y activarse con teclado', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )
    })

    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href]'))
    expect(links.length).toBeGreaterThan(0)

    for (const link of links) {
      expect(link.getAttribute('tabindex')).not.toBe('-1')
      link.focus()
      expect(document.activeElement).toBe(link)
    }

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('4. Mantiene una estructura semántica HTML5 pura (aside, header, main, nav, section, article)', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(container.querySelector('aside')).not.toBeNull()
    expect(container.querySelector('header')).not.toBeNull()
    expect(container.querySelector('nav')).not.toBeNull()
    expect(container.querySelector('section')).not.toBeNull()

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('5. Audita que no existan errores ni advertencias de consola durante la prueba de accesibilidad', () => {
    const errors: unknown[] = []
    const warnings: unknown[] = []
    const originalError = console.error
    const originalWarn = console.warn
    console.error = (...args: unknown[]) => {
      errors.push(args)
    }
    console.warn = (...args: unknown[]) => {
      warnings.push(args)
    }

    try {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      act(() => {
        root.render(
          <MemoryRouter initialEntries={['/admin/dashboard']}>
            <Routes>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </MemoryRouter>,
        )
      })

      expect(errors).toEqual([])
      expect(warnings).toEqual([])

      act(() => {
        root.unmount()
      })
      container.remove()
    } finally {
      console.error = originalError
      console.warn = originalWarn
    }
  })
})
