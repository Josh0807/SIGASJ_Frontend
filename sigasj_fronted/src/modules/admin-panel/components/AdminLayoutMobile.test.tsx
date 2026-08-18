import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from '../../../shared/layouts/AdminLayout'
import AdminDashboard from '../../dashboard/AdminDashboard'

describe('AdminLayout Mobile Integration', () => {
  beforeEach(() => {
    // Simular pantalla móvil (< 760px)
    window.matchMedia = ((query: string) => ({
      matches: query.includes('760px'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    })) as unknown as typeof window.matchMedia
  })

  it('1. Renderiza el botón de menú desplegable móvil (.admin-menu-toggle) con aria-label en la cabecera', () => {
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

    const toggleBtn = container.querySelector<HTMLButtonElement>('.admin-menu-toggle')
    expect(toggleBtn).not.toBeNull()
    expect(toggleBtn?.getAttribute('aria-label')).toBe('Abrir menú administrativo')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('2. Permite abrir y cerrar el menú desplegable móvil desde el botón y desde el telón de fondo', async () => {
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

    const toggleBtn = container.querySelector<HTMLButtonElement>('.admin-menu-toggle')
    expect(toggleBtn).not.toBeNull()

    // Abrir menú móvil
    await act(async () => {
      toggleBtn?.click()
    })

    const backdrop = container.querySelector<HTMLButtonElement>('.admin-nav-backdrop')
    const layout = container.querySelector('.admin-layout')
    expect(backdrop).not.toBeNull()
    expect(layout?.classList.contains('admin-layout--nav-open')).toBe(true)

    // Cerrar menú haciendo clic en el backdrop
    await act(async () => {
      backdrop?.click()
    })

    expect(layout?.classList.contains('admin-layout--nav-open')).toBe(false)

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('3. Audita que la experiencia móvil se ejecute sin errores ni advertencias en consola', () => {
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
