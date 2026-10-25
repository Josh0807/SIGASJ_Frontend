import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FormulariosDescargablesAdminPage from './FormulariosDescargablesAdminPage'
import * as api from './formulariosDescargablesApi'
import type { FormularioDescargableAdmin } from './types'

vi.mock('./formulariosDescargablesApi', async () => {
  const actual = await vi.importActual<typeof api>(
    './formulariosDescargablesApi',
  )
  return {
    ...actual,
    listFormulariosDescargablesAdmin: vi.fn(),
    createFormularioDescargable: vi.fn(),
    updateFormularioDescargable: vi.fn(),
    replaceFormularioDescargableArchivo: vi.fn(),
    setFormularioDescargableEstado: vi.fn(),
  }
})

vi.mock('./validateFormularioDescargable', () => ({
  validateFormularioDescargablePdf: vi.fn(async () => null),
  validateNombreFormularioDescargable: vi.fn((nombre: string) =>
    nombre.trim() ? null : 'El nombre es obligatorio.',
  ),
  validateDescripcionFormularioDescargable: vi.fn(() => null),
}))

const activo: FormularioDescargableAdmin = {
  id: 1,
  nombre: 'Formulario A',
  descripcion: 'Descripción corta',
  nombreArchivoOriginal: 'a.pdf',
  activo: true,
  fechaPublicacion: '2026-10-25T12:00:00.000Z',
  createdAt: '2026-10-20T08:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
}

const inactivo: FormularioDescargableAdmin = {
  id: 2,
  nombre: 'Formulario B',
  descripcion: null,
  nombreArchivoOriginal: 'b.pdf',
  activo: false,
  fechaPublicacion: null,
  createdAt: '2026-10-21T08:00:00.000Z',
  updatedAt: '2026-10-21T08:00:00.000Z',
}

async function mount() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(
      <MemoryRouter>
        <FormulariosDescargablesAdminPage />
      </MemoryRouter>,
    )
  })
  await act(async () => {
    await Promise.resolve()
    await new Promise((resolve) => setTimeout(resolve, 0))
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

const clickButton = async (container: ParentNode, label: string) => {
  const button = [...container.querySelectorAll('button')].find((item) =>
    item.textContent?.includes(label),
  ) as HTMLButtonElement | undefined
  expect(button).toBeTruthy()
  await act(async () => {
    button!.click()
  })
}

const dialogForm = (container: HTMLElement) => {
  const dialog = container.querySelector('[role="dialog"]') as HTMLElement | null
  expect(dialog).toBeTruthy()
  if (dialog instanceof HTMLFormElement) return dialog
  const form = dialog!.querySelector('form')
  expect(form).toBeTruthy()
  return form as HTMLFormElement
}

beforeEach(() => {
  vi.mocked(api.listFormulariosDescargablesAdmin).mockResolvedValue([
    activo,
    inactivo,
  ])
  vi.mocked(api.createFormularioDescargable).mockReset()
  vi.mocked(api.updateFormularioDescargable).mockReset()
  vi.mocked(api.replaceFormularioDescargableArchivo).mockReset()
  vi.mocked(api.setFormularioDescargableEstado).mockReset()
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('FormulariosDescargablesAdminPage', () => {
  it('lista activos e inactivos con nombre, archivo y estado', async () => {
    const view = await mount()
    expect(view.container.textContent).toContain('Formularios descargables')
    expect(view.container.textContent).toContain('Formulario A')
    expect(view.container.textContent).toContain('Formulario B')
    expect(view.container.textContent).toContain('a.pdf')
    expect(view.container.textContent).toContain('b.pdf')
    expect(view.container.textContent).toContain('Activo')
    expect(view.container.textContent).toContain('Inactivo')
    expect(view.container.textContent).toContain('Sin descripción.')
    expect(view.container.textContent).toContain('No publicada')
    expect(view.container.textContent).not.toMatch(/uploads\//i)
    expect(view.container.textContent).not.toMatch(/storageKey/i)
    await view.cleanup()
  })

  it('muestra empty state con acción agregar', async () => {
    vi.mocked(api.listFormulariosDescargablesAdmin).mockResolvedValueOnce([])
    const view = await mount()
    expect(view.container.textContent).toContain(
      'Aún no hay formularios descargables registrados.',
    )
    expect(view.container.textContent).toContain('Agregar formulario')
    await view.cleanup()
  })

  it('muestra error de listado y permite reintentar', async () => {
    vi.mocked(api.listFormulariosDescargablesAdmin)
      .mockRejectedValueOnce(new Error('HTTP 500: fail'))
      .mockResolvedValueOnce([activo])
    const view = await mount()
    expect(view.container.querySelector('[role="alert"]')?.textContent).toMatch(
      /servidor/i,
    )
    expect(view.container.textContent).toContain('Reintentar')
    await clickButton(view.container, 'Reintentar')
    await act(async () => {
      await Promise.resolve()
    })
    expect(view.container.textContent).toContain('Formulario A')
    await view.cleanup()
  })

  it('crea formulario y actualiza el listado sin F5', async () => {
    const creado: FormularioDescargableAdmin = {
      ...activo,
      id: 3,
      nombre: 'Formulario C',
      nombreArchivoOriginal: 'c.pdf',
      activo: false,
    }
    vi.mocked(api.createFormularioDescargable).mockResolvedValueOnce(creado)
    const view = await mount()
    await clickButton(view.container, 'Agregar formulario')
    const form = dialogForm(view.container)

    const nombre = form.querySelector(
      'input[name="nombre"]',
    ) as HTMLInputElement
    const descripcion = form.querySelector('textarea') as HTMLTextAreaElement
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set
    const textSetter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    )?.set
    await act(async () => {
      valueSetter?.call(nombre, 'Formulario C')
      nombre.dispatchEvent(new Event('input', { bubbles: true }))
      textSetter?.call(descripcion, 'Descripción del formulario C')
      descripcion.dispatchEvent(new Event('input', { bubbles: true }))
    })

    const fileInput = [...form.querySelectorAll('input')].find(
      (input) => input.type === 'file',
    ) as HTMLInputElement
    const file = new File(['%PDF-1.4'], 'c.pdf', { type: 'application/pdf' })
    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        configurable: true,
        value: [file],
      })
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await act(async () => {
      await Promise.resolve()
    })

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(api.createFormularioDescargable).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Formulario C',
        descripcion: 'Descripción del formulario C',
        activo: false,
      }),
    )
    expect(view.container.textContent).toContain('Formulario C')
    expect(view.container.textContent).toMatch(
      /Formulario registrado correctamente/i,
    )
    await view.cleanup()
  })

  it('error de creación no agrega fila falsa y conserva el dialog', async () => {
    vi.mocked(api.createFormularioDescargable).mockRejectedValueOnce(
      new Error('HTTP 400: PDF inválido'),
    )
    const view = await mount()
    await clickButton(view.container, 'Agregar formulario')
    const form = dialogForm(view.container)
    const nombre = form.querySelector(
      'input[name="nombre"]',
    ) as HTMLInputElement
    const descripcion = form.querySelector('textarea') as HTMLTextAreaElement
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set
    const textSetter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    )?.set
    await act(async () => {
      valueSetter?.call(nombre, 'Formulario Fallido')
      nombre.dispatchEvent(new Event('input', { bubbles: true }))
      textSetter?.call(descripcion, 'Desc')
      descripcion.dispatchEvent(new Event('input', { bubbles: true }))
    })
    const fileInput = [...form.querySelectorAll('input')].find(
      (input) => input.type === 'file',
    ) as HTMLInputElement
    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        configurable: true,
        value: [
          new File(['%PDF-1.4'], 'x.pdf', { type: 'application/pdf' }),
        ],
      })
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await act(async () => {
      await Promise.resolve()
    })
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(view.container.textContent).not.toContain('Formulario Fallido')
    expect(view.container.querySelector('[role="dialog"]')).toBeTruthy()
    expect(view.container.querySelector('[role="alert"]')?.textContent).toMatch(
      /PDF inválido|datos enviados/i,
    )
    await view.cleanup()
  })

  it('edita metadata sin llamar al endpoint de archivo', async () => {
    vi.mocked(api.updateFormularioDescargable).mockResolvedValueOnce({
      ...activo,
      nombre: 'Formulario A editado',
      descripcion: 'Nueva desc',
    })
    const view = await mount()
    const card = [...view.container.querySelectorAll('article')].find((item) =>
      item.textContent?.includes('Formulario A'),
    ) as HTMLElement
    await clickButton(card, 'Editar')
    const form = dialogForm(view.container)
    const nombre = form.querySelector('input') as HTMLInputElement
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set
    await act(async () => {
      valueSetter?.call(nombre, 'Formulario A editado')
      nombre.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(api.updateFormularioDescargable).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ nombre: 'Formulario A editado' }),
    )
    expect(api.replaceFormularioDescargableArchivo).not.toHaveBeenCalled()
    expect(view.container.textContent).toContain('Formulario A editado')
    await view.cleanup()
  })

  it('inactiva con confirmación y conserva el registro', async () => {
    vi.mocked(api.setFormularioDescargableEstado).mockResolvedValueOnce({
      ...activo,
      activo: false,
    })
    const view = await mount()
    const card = [...view.container.querySelectorAll('article')].find((item) =>
      item.textContent?.includes('Formulario A'),
    ) as HTMLElement
    await clickButton(card, 'Inactivar')
    expect(document.body.textContent).toMatch(
      /dejará de estar disponible públicamente/i,
    )
    await clickButton(document.body, 'Inactivar formulario')
    await act(async () => {
      await Promise.resolve()
    })
    expect(api.setFormularioDescargableEstado).toHaveBeenCalledWith(1, false)
    expect(view.container.textContent).toContain('Formulario A')
    await view.cleanup()
  })

  it('si falla el cambio de estado, el badge permanece Activo', async () => {
    vi.mocked(api.setFormularioDescargableEstado).mockRejectedValueOnce(
      new Error('HTTP 500: fail'),
    )
    const view = await mount()
    const card = [...view.container.querySelectorAll('article')].find((item) =>
      item.textContent?.includes('Formulario A'),
    ) as HTMLElement
    await clickButton(card, 'Inactivar')
    await clickButton(document.body, 'Inactivar formulario')
    await act(async () => {
      await Promise.resolve()
    })
    expect(view.container.querySelector('[role="alert"]')?.textContent).toMatch(
      /servidor/i,
    )
    expect(card.textContent).toContain('Activo')
    await view.cleanup()
  })

  it('reemplazo fallido conserva el PDF anterior', async () => {
    vi.mocked(api.replaceFormularioDescargableArchivo).mockRejectedValueOnce(
      new Error('HTTP 400: PDF inválido'),
    )
    const view = await mount()
    const card = [...view.container.querySelectorAll('article')].find((item) =>
      item.textContent?.includes('Formulario A'),
    ) as HTMLElement
    await clickButton(card, 'Reemplazar PDF')
    const form = dialogForm(view.container)
    expect(form.textContent).toContain('a.pdf')

    const fileInput = [...form.querySelectorAll('input')].find(
      (input) => input.type === 'file',
    ) as HTMLInputElement
    const file = new File(['%PDF-1.4'], 'nuevo.pdf', { type: 'application/pdf' })
    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        configurable: true,
        value: [file],
      })
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await act(async () => {
      await Promise.resolve()
    })

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    const confirm = document.body.querySelector(
      '[role="alertdialog"]',
    ) as HTMLElement
    expect(confirm).toBeTruthy()
    await clickButton(confirm, 'Reemplazar PDF')
    await act(async () => {
      await Promise.resolve()
    })

    // El listado conserva el PDF confirmado por el servidor (a.pdf).
    expect(card.textContent).toContain('a.pdf')
    expect(card.textContent).not.toContain('nuevo.pdf')
    expect(api.replaceFormularioDescargableArchivo).toHaveBeenCalled()
    await view.cleanup()
  })

  it('no muestra acción Eliminar', async () => {
    const view = await mount()
    expect(view.container.textContent).not.toMatch(/Eliminar/i)
    await view.cleanup()
  })
})
