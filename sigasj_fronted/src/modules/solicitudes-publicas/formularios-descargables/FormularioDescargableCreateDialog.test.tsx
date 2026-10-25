import { act, type ComponentProps } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import FormularioDescargableCreateDialog from './FormularioDescargableCreateDialog'
import { FORMULARIO_DESCARGABLE_MAX_BYTES } from './types'
import * as validators from './validateFormularioDescargable'

async function mount(
  props: Partial<ComponentProps<typeof FormularioDescargableCreateDialog>> = {},
) {
  const onSave = props.onSave ?? vi.fn().mockResolvedValue(undefined)
  const onCancel = props.onCancel ?? vi.fn()
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(
      <FormularioDescargableCreateDialog
        submitting={props.submitting ?? false}
        onCancel={onCancel}
        onSave={onSave}
      />,
    )
  })
  return {
    container,
    onSave,
    onCancel,
    form: container.querySelector('form') as HTMLFormElement,
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

const setInput = async (el: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  await act(async () => {
    setter?.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

const setFile = async (
  container: HTMLElement,
  input: HTMLInputElement,
  file: File | null,
) => {
  await act(async () => {
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: file ? [file] : [],
    })
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
  // validateFormularioDescargablePdf usa FileReader asíncrono.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
  if (file && file.name.toLowerCase().endsWith('.pdf') && file.type === 'application/pdf') {
    // Si pasó validación UX, debe mostrarse el nombre.
    if (!container.textContent?.includes(file.name)) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20))
      })
    }
  }
}

const pdfFile = (name = 'formulario.pdf', contents = '%PDF-1.4\n') =>
  new File([contents], name, { type: 'application/pdf' })

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('FormularioDescargableCreateDialog', () => {
  it('renderiza nombre, descripción, PDF, estado y guardar', async () => {
    const view = await mount()
    expect(view.form.textContent).toContain('Nombre del formulario')
    expect(view.form.textContent).toContain('Descripción breve')
    expect(view.form.textContent).toContain('Archivo PDF')
    expect(view.form.textContent).toContain('Estado')
    expect(view.form.textContent).toContain('Activo')
    expect(view.form.textContent).toContain('Inactivo')
    expect(view.form.textContent).toContain('Guardar formulario')
    expect(view.form.textContent).not.toContain('Fecha de publicación')
    await view.cleanup()
  })

  it('rechaza nombre vacío sin request', async () => {
    const view = await mount()
    await setInput(
      view.form.querySelector('textarea') as HTMLTextAreaElement,
      'Descripción válida',
    )
    await setFile(
      view.container,
      [...view.form.querySelectorAll('input')].find(
        (i) => i.type === 'file',
      ) as HTMLInputElement,
      pdfFile(),
    )
    await act(async () => {
      view.form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      )
    })
    expect(view.container.querySelector('[role="alert"]')?.textContent).toMatch(
      /nombre/i,
    )
    expect(view.onSave).not.toHaveBeenCalled()
    await view.cleanup()
  })

  it('rechaza nombre solo espacios sin request', async () => {
    const view = await mount()
    await setInput(
      view.form.querySelector('input[name="nombre"]') as HTMLInputElement,
      '   ',
    )
    await setInput(
      view.form.querySelector('textarea') as HTMLTextAreaElement,
      'Descripción',
    )
    await setFile(
      view.container,
      [...view.form.querySelectorAll('input')].find(
        (i) => i.type === 'file',
      ) as HTMLInputElement,
      pdfFile(),
    )
    await act(async () => {
      view.form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      )
    })
    expect(view.onSave).not.toHaveBeenCalled()
    await view.cleanup()
  })

  it('rechaza descripción vacía sin request', async () => {
    const view = await mount()
    await setInput(
      view.form.querySelector('input[name="nombre"]') as HTMLInputElement,
      'Formulario X',
    )
    await setFile(
      view.container,
      [...view.form.querySelectorAll('input')].find(
        (i) => i.type === 'file',
      ) as HTMLInputElement,
      pdfFile(),
    )
    await act(async () => {
      view.form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      )
    })
    expect(view.container.querySelector('[role="alert"]')?.textContent).toMatch(
      /descripción/i,
    )
    expect(view.onSave).not.toHaveBeenCalled()
    await view.cleanup()
  })

  it('rechaza descripción solo espacios sin request', async () => {
    const view = await mount()
    await setInput(
      view.form.querySelector('input[name="nombre"]') as HTMLInputElement,
      'Formulario X',
    )
    await setInput(
      view.form.querySelector('textarea') as HTMLTextAreaElement,
      '     ',
    )
    await setFile(
      view.container,
      [...view.form.querySelectorAll('input')].find(
        (i) => i.type === 'file',
      ) as HTMLInputElement,
      pdfFile(),
    )
    await act(async () => {
      view.form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      )
    })
    expect(view.onSave).not.toHaveBeenCalled()
    await view.cleanup()
  })

  it('rechaza PDF ausente sin request', async () => {
    const view = await mount()
    await setInput(
      view.form.querySelector('input[name="nombre"]') as HTMLInputElement,
      'Formulario X',
    )
    await setInput(
      view.form.querySelector('textarea') as HTMLTextAreaElement,
      'Descripción válida',
    )
    await act(async () => {
      view.form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      )
    })
    expect(view.container.querySelector('[role="alert"]')?.textContent).toMatch(
      /PDF/i,
    )
    expect(view.onSave).not.toHaveBeenCalled()
    await view.cleanup()
  })

  it('rechaza JPG antes del submit', async () => {
    const view = await mount()
    const fileInput = [...view.form.querySelectorAll('input')].find(
      (i) => i.type === 'file',
    ) as HTMLInputElement
    await setFile(
      view.container,
      fileInput,
      new File(['fake'], 'foto.jpg', { type: 'image/jpeg' }),
    )
    expect(view.container.querySelector('[role="alert"]')?.textContent).toMatch(
      /\.pdf|application\/pdf/i,
    )
    await view.cleanup()
  })

  it('rechaza DOCX antes del submit', async () => {
    const view = await mount()
    const fileInput = [...view.form.querySelectorAll('input')].find(
      (i) => i.type === 'file',
    ) as HTMLInputElement
    await setFile(
      view.container,
      fileInput,
      new File(['fake'], 'doc.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }),
    )
    expect(view.container.querySelector('[role="alert"]')?.textContent).toBeTruthy()
    await view.cleanup()
  })

  it('rechaza PDF sobre tamaño máximo', async () => {
    const view = await mount()
    const file = pdfFile()
    Object.defineProperty(file, 'size', {
      value: FORMULARIO_DESCARGABLE_MAX_BYTES + 1,
    })
    const fileInput = [...view.form.querySelectorAll('input')].find(
      (i) => i.type === 'file',
    ) as HTMLInputElement
    await setFile(view.container, fileInput, file)
    expect(view.container.querySelector('[role="alert"]')?.textContent).toMatch(
      /10 MB/i,
    )
    await view.cleanup()
  })

  it('envía payload completo con estado Inactivo por defecto', async () => {
    vi.spyOn(validators, 'validateFormularioDescargablePdf').mockResolvedValue(
      null,
    )
    const view = await mount()
    const file = pdfFile('conexion.pdf')
    await setInput(
      view.form.querySelector('input[name="nombre"]') as HTMLInputElement,
      'Solicitud de conexión',
    )
    await setInput(
      view.form.querySelector('textarea') as HTMLTextAreaElement,
      'Para solicitar conexión nueva',
    )
    await setFile(
      view.container,
      [...view.form.querySelectorAll('input')].find(
        (i) => i.type === 'file',
      ) as HTMLInputElement,
      file,
    )
    expect(view.container.textContent).toContain('conexion.pdf')
    await act(async () => {
      view.form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      )
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(view.onSave).toHaveBeenCalledTimes(1)
    expect(view.onSave).toHaveBeenCalledWith({
      nombre: 'Solicitud de conexión',
      descripcion: 'Para solicitar conexión nueva',
      activo: false,
      archivo: file,
    })
    await view.cleanup()
  })

  it('envía estado Activo cuando se selecciona', async () => {
    vi.spyOn(validators, 'validateFormularioDescargablePdf').mockResolvedValue(
      null,
    )
    const view = await mount()
    const file = pdfFile()
    await setInput(
      view.form.querySelector('input[name="nombre"]') as HTMLInputElement,
      'Formulario activo',
    )
    await setInput(
      view.form.querySelector('textarea') as HTMLTextAreaElement,
      'Descripción',
    )
    const activoRadio = view.form.querySelector(
      'input[value="activo"]',
    ) as HTMLInputElement
    await act(async () => {
      activoRadio.click()
      activoRadio.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await setFile(
      view.container,
      [...view.form.querySelectorAll('input')].find(
        (i) => i.type === 'file',
      ) as HTMLInputElement,
      file,
    )
    await act(async () => {
      view.form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      )
    })
    await act(async () => {
      await Promise.resolve()
    })
    expect(view.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ activo: true }),
    )
    await view.cleanup()
  })

  it('evita doble submit', async () => {
    vi.spyOn(validators, 'validateFormularioDescargablePdf').mockResolvedValue(
      null,
    )
    let resolveSave!: () => void
    const onSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve
        }),
    )
    const view = await mount({ onSave })
    const file = pdfFile()
    await setInput(
      view.form.querySelector('input[name="nombre"]') as HTMLInputElement,
      'Formulario',
    )
    await setInput(
      view.form.querySelector('textarea') as HTMLTextAreaElement,
      'Desc',
    )
    await setFile(
      view.container,
      [...view.form.querySelectorAll('input')].find(
        (i) => i.type === 'file',
      ) as HTMLInputElement,
      file,
    )
    await act(async () => {
      view.form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      )
      view.form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      )
    })
    expect(onSave).toHaveBeenCalledTimes(1)
    await act(async () => {
      resolveSave()
    })
    await view.cleanup()
  })

  it('cancelar no dispara onSave', async () => {
    const view = await mount()
    const cancel = [...view.form.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Cancelar'),
    ) as HTMLButtonElement
    await act(async () => {
      cancel.click()
    })
    expect(view.onCancel).toHaveBeenCalled()
    expect(view.onSave).not.toHaveBeenCalled()
    await view.cleanup()
  })

  it('permite quitar el PDF seleccionado y vuelve a exigir archivo', async () => {
    vi.spyOn(validators, 'validateFormularioDescargablePdf').mockResolvedValue(
      null,
    )
    const view = await mount()
    const fileInput = [...view.form.querySelectorAll('input')].find(
      (i) => i.type === 'file',
    ) as HTMLInputElement
    await setFile(view.container, fileInput, pdfFile('seleccionado.pdf'))
    expect(view.container.textContent).toContain('seleccionado.pdf')
    const quitar = [...view.container.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Quitar'),
    ) as HTMLButtonElement
    await act(async () => {
      quitar.click()
    })
    expect(view.container.textContent).not.toContain('seleccionado.pdf')
    await setInput(
      view.form.querySelector('input[name="nombre"]') as HTMLInputElement,
      'Formulario',
    )
    await setInput(
      view.form.querySelector('textarea') as HTMLTextAreaElement,
      'Desc',
    )
    await act(async () => {
      view.form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      )
    })
    expect(view.onSave).not.toHaveBeenCalled()
    expect(view.container.querySelector('[role="alert"]')?.textContent).toMatch(
      /PDF/i,
    )
    await view.cleanup()
  })
})
