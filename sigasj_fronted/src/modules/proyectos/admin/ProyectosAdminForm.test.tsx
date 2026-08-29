import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProyectosAdminForm from './ProyectosAdminForm'
import {
  ESTADOS_PROYECTO,
  emptyProyectoFormValues,
  toProyectoFormValues,
  type AdminProyecto,
  type ProyectoFormValues,
} from './types'

const setInputValue = (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const proto =
    input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

const changeSelect = (select: HTMLSelectElement, value: string) => {
  select.value = value
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('emptyProyectoFormValues / toProyectoFormValues', () => {
  it('parte de campos vacíos para un alta', () => {
    expect(emptyProyectoFormValues()).toEqual({
      nombre: '',
      descripcion: '',
      encargadoRealizacion: '',
      duracion: '',
      estado: '',
      imagenPrincipalUrl: null,
    })
  })

  it('carga los campos reales del proyecto para edición', () => {
    const proyecto: Pick<
      AdminProyecto,
      'nombre' | 'descripcion' | 'encargadoRealizacion' | 'duracion' | 'estado' | 'imagenPrincipal'
    > = {
      nombre: 'Ampliación de Acueducto',
      descripcion: null,
      encargadoRealizacion: 'Ing. María',
      duracion: '8 meses',
      estado: 'EN_PROCESO',
      imagenPrincipal: null,
    }

    expect(toProyectoFormValues(proyecto)).toEqual({
      nombre: 'Ampliación de Acueducto',
      descripcion: '',
      encargadoRealizacion: 'Ing. María',
      duracion: '8 meses',
      estado: 'EN_PROCESO',
      imagenPrincipalUrl: null,
    })
  })

  it('no deja undefined en campos opcionales nulos al editar', () => {
    const values = toProyectoFormValues({
      nombre: 'Tanque',
      descripcion: null,
      encargadoRealizacion: null,
      duracion: null,
      estado: 'PENDIENTE',
      imagenPrincipal: null,
    })

    expect(values).toEqual({
      nombre: 'Tanque',
      descripcion: '',
      encargadoRealizacion: '',
      duracion: '',
      estado: 'PENDIENTE',
      imagenPrincipalUrl: null,
    })
    expect(Object.values(values).every((value) => value !== undefined)).toBe(true)
  })
})

describe('ProyectosAdminForm', () => {
  it('usa un único formulario para alta y edición', () => {
    const createMarkup = renderToStaticMarkup(
      <ProyectosAdminForm
        mode="create"
        initialValues={emptyProyectoFormValues()}
        onSubmit={async () => undefined}
        onCancel={() => undefined}
      />,
    )
    const editMarkup = renderToStaticMarkup(
      <ProyectosAdminForm
        mode="edit"
        initialValues={toProyectoFormValues({
          nombre: 'Tanque de almacenamiento',
          descripcion: 'Obra de almacenamiento',
          encargadoRealizacion: null,
          duracion: '12 meses',
          estado: 'COMPLETADO',
        })}
        onSubmit={async () => undefined}
        onCancel={() => undefined}
      />,
    )

    expect(createMarkup).toContain('Nuevo proyecto')
    expect(editMarkup).toContain('Editar proyecto')
    expect(createMarkup).toContain('Nombre del proyecto')
    expect(createMarkup).toContain('Descripción')
    expect(createMarkup).toContain('Encargado de realización')
    expect(createMarkup).toContain('Duración')
    expect(createMarkup).toContain('Estado')
    expect(createMarkup).toContain('name="nombre"')
    expect(createMarkup).toContain('name="descripcion"')
    expect(createMarkup).toContain('name="encargadoRealizacion"')
    expect(createMarkup).toContain('name="duracion"')
    expect(createMarkup).toContain('name="estado"')
    expect(createMarkup).toContain('proyectos-admin__form')
    expect(createMarkup).toContain('proyectos-admin__form-row')
    expect(createMarkup).toContain('proyectos-admin__form-actions')
    expect(createMarkup).not.toContain('fetch(')
    expect(createMarkup).not.toContain('/admin/proyectos')
    expect(editMarkup).toContain('Tanque de almacenamiento')
    expect(editMarkup).toContain('value="COMPLETADO"')
    expect(editMarkup).toContain('disabled')
    expect(editMarkup).toContain(
      'El cambio de estado de ejecución todavía no está disponible.',
    )
    expect(editMarkup).not.toContain('undefined')
    expect(editMarkup).not.toContain('EN_EJECUCION')
  })

  it('asocia labels visibles a cada campo y usa los controles del contrato Backend', () => {
    const markup = renderToStaticMarkup(
      <ProyectosAdminForm
        mode="create"
        initialValues={emptyProyectoFormValues()}
        onSubmit={async () => undefined}
        onCancel={() => undefined}
      />,
    )

    expect(markup).toContain('for="proyectos-form-nombre"')
    expect(markup).toContain('id="proyectos-form-nombre"')
    expect(markup).toContain('type="text"')
    expect(markup).toContain('for="proyectos-form-descripcion"')
    expect(markup).toContain('<textarea')
    expect(markup).toContain('rows="6"')
    expect(markup).toContain('for="proyectos-form-encargado"')
    expect(markup).toContain('name="encargadoRealizacion"')
    expect(markup).toContain('for="proyectos-form-duracion"')
    expect(markup).toContain('name="duracion"')
    expect(markup).toContain('for="proyectos-form-imagen-principal"')
    expect(markup).toContain('name="imagenPrincipal"')
    expect(markup).toContain('type="file"')
    expect(markup).not.toContain('type="number"')
    expect(markup).not.toContain('type="date"')
    expect(markup).not.toContain('name="activo"')
    expect(markup).not.toContain('Visible en')
    expect(markup).not.toContain('Publicar')
  })

  it('expone solo los estados reales del Backend', () => {
    const markup = renderToStaticMarkup(
      <ProyectosAdminForm
        mode="create"
        initialValues={emptyProyectoFormValues()}
        onSubmit={async () => undefined}
        onCancel={() => undefined}
      />,
    )

    for (const estado of ESTADOS_PROYECTO) {
      expect(markup).toContain(`value="${estado}"`)
    }
    expect(markup).toContain('Pendiente')
    expect(markup).toContain('En proceso')
    expect(markup).toContain('Completado')
    expect(markup).toMatch(/<option[^>]*value="PENDIENTE"[^>]*>Pendiente<\/option>/)
    expect(markup).toMatch(/<option[^>]*value="EN_PROCESO"[^>]*>En proceso<\/option>/)
    expect(markup).toMatch(/<option[^>]*value="COMPLETADO"[^>]*>Completado<\/option>/)
    expect(markup).not.toMatch(/value="Pendiente"/)
    expect(markup).not.toMatch(/value="En proceso"/)
    expect(markup).not.toMatch(/value="Completado"/)
    expect(markup).not.toContain('EN_EJECUCION')
    expect(markup).not.toContain('Inactivo')
  })
})

describe('ProyectosAdminForm — envío', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  const renderForm = async (
    props: Partial<Parameters<typeof ProyectosAdminForm>[0]> = {},
  ) => {
    const onSubmit = props.onSubmit ?? vi.fn(async () => undefined)
    const onCancel = props.onCancel ?? vi.fn()

    await act(async () => {
      root.render(
        <ProyectosAdminForm
          mode={props.mode ?? 'create'}
          initialValues={props.initialValues ?? emptyProyectoFormValues()}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      )
    })

    return { onSubmit, onCancel }
  }

  it('no dispara onSubmit si el nombre está vacío o solo tiene espacios', async () => {
    const { onSubmit } = await renderForm()
    const nombre = container.querySelector('#proyectos-form-nombre') as HTMLInputElement
    const form = container.querySelector('form') as HTMLFormElement

    await act(async () => {
      setInputValue(nombre, '   ')
      form.requestSubmit()
    })

    expect(onSubmit).not.toHaveBeenCalled()
    expect(container.textContent).toContain('El nombre del proyecto es obligatorio.')
    expect(nombre.getAttribute('aria-invalid')).toBe('true')
    expect(nombre.getAttribute('aria-describedby')).toBe('proyectos-form-nombre-error')
    expect(container.querySelector('#proyectos-form-nombre-error')?.textContent).toBe(
      'El nombre del proyecto es obligatorio.',
    )
  })

  it('exige encargado, duración y un estado real antes de enviar', async () => {
    const { onSubmit } = await renderForm()
    const form = container.querySelector('form') as HTMLFormElement

    await act(async () => {
      setInputValue(
        container.querySelector('#proyectos-form-nombre') as HTMLInputElement,
        'Obra Norte',
      )
      form.requestSubmit()
    })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Debe indicar el encargado.')

    await act(async () => {
      setInputValue(
        container.querySelector('#proyectos-form-encargado') as HTMLInputElement,
        'Ing. María',
      )
      form.requestSubmit()
    })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(container.textContent).toContain('La duración es obligatoria.')

    await act(async () => {
      setInputValue(
        container.querySelector('#proyectos-form-duracion') as HTMLInputElement,
        '8 meses',
      )
      form.requestSubmit()
    })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Seleccione un estado válido.')
  })

  it('permite descripción vacía porque el Backend no la exige', async () => {
    const { onSubmit } = await renderForm()

    await act(async () => {
      setInputValue(
        container.querySelector('#proyectos-form-nombre') as HTMLInputElement,
        'Obra Norte',
      )
      setInputValue(
        container.querySelector('#proyectos-form-encargado') as HTMLInputElement,
        'Ing. María',
      )
      setInputValue(
        container.querySelector('#proyectos-form-duracion') as HTMLInputElement,
        '8 meses',
      )
      changeSelect(
        container.querySelector('#proyectos-form-estado') as HTMLSelectElement,
        'PENDIENTE',
      )
      container.querySelector('form')?.requestSubmit()
    })

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Obra Norte',
        descripcion: '',
        estado: 'PENDIENTE',
      }),
      null,
      false,
    )
  })

  it('envía los valores recortados al onSubmit y no llama HTTP', async () => {
    const onSubmit = vi.fn(async () => undefined)
    await renderForm({ onSubmit })

    await act(async () => {
      setInputValue(
        container.querySelector('#proyectos-form-nombre') as HTMLInputElement,
        '  Ampliación de Acueducto  ',
      )
      setInputValue(
        container.querySelector('#proyectos-form-descripcion') as HTMLTextAreaElement,
        '  Red principal  ',
      )
      setInputValue(
        container.querySelector('#proyectos-form-encargado') as HTMLInputElement,
        '  Ing. María  ',
      )
      setInputValue(
        container.querySelector('#proyectos-form-duracion') as HTMLInputElement,
        '  8 meses  ',
      )
      changeSelect(
        container.querySelector('#proyectos-form-estado') as HTMLSelectElement,
        'EN_PROCESO',
      )
      container.querySelector('form')?.requestSubmit()
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(
      {
        nombre: 'Ampliación de Acueducto',
        descripcion: 'Red principal',
        encargadoRealizacion: 'Ing. María',
        duracion: '8 meses',
        estado: 'EN_PROCESO',
        imagenPrincipalUrl: null,
      },
      null,
      false,
    )
    expect(container.innerHTML).not.toContain('fetchWithAuth')
  })

  it('conserva la duración como texto libre, sin concatenar unidades', async () => {
    const onSubmit = vi.fn(async () => undefined)
    await renderForm({ onSubmit })

    await act(async () => {
      setInputValue(
        container.querySelector('#proyectos-form-nombre') as HTMLInputElement,
        'Obra Norte',
      )
      setInputValue(
        container.querySelector('#proyectos-form-encargado') as HTMLInputElement,
        'Ing. María',
      )
      setInputValue(
        container.querySelector('#proyectos-form-duracion') as HTMLInputElement,
        '6',
      )
      changeSelect(
        container.querySelector('#proyectos-form-estado') as HTMLSelectElement,
        'PENDIENTE',
      )
      container.querySelector('form')?.requestSubmit()
    })

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ duracion: '6' }),
      null,
      false,
    )
    expect(onSubmit.mock.calls[0][0].duracion).not.toMatch(/meses|días|dias/i)
  })

  const validFormValues: ProyectoFormValues = {
    nombre: 'Obra Norte',
    descripcion: '',
    encargadoRealizacion: 'Ing. María',
    duracion: '8 meses',
    estado: 'PENDIENTE',
  }

  const submitButton = () =>
    Array.from(container.querySelectorAll('button')).find(
      (button) => button.getAttribute('type') === 'submit',
    ) as HTMLButtonElement

  it('bloquea un segundo envío y muestra Guardando… en el alta', async () => {
    let resolveSubmit: (() => void) | undefined
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve
        }),
    )

    await renderForm({
      onSubmit,
      initialValues: validFormValues,
    })

    const form = container.querySelector('form') as HTMLFormElement

    await act(async () => {
      form.requestSubmit()
      form.requestSubmit()
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(form.getAttribute('aria-busy')).toBe('true')
    expect(submitButton().disabled).toBe(true)
    expect(submitButton().textContent).toBe('Guardando…')

    await act(async () => {
      form.requestSubmit()
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveSubmit?.()
    })
  })

  it('muestra Actualizando… en edición y no dispara dos solicitudes', async () => {
    const onSubmit = vi.fn(
      () =>
        new Promise<void>(() => undefined),
    )

    await renderForm({
      mode: 'edit',
      onSubmit,
      initialValues: toProyectoFormValues({
        nombre: 'Tanque de almacenamiento',
        descripcion: 'Obra de almacenamiento',
        encargadoRealizacion: 'Ing. María',
        duracion: '12 meses',
        estado: 'COMPLETADO',
      }),
    })

    const form = container.querySelector('form') as HTMLFormElement

    await act(async () => {
      form.requestSubmit()
      form.requestSubmit()
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(submitButton().disabled).toBe(true)
    expect(submitButton().textContent).toBe('Actualizando…')
  })

  it('muestra el estado actual en edición y no permite cambiarlo todavía', async () => {
    await renderForm({
      mode: 'edit',
      initialValues: toProyectoFormValues({
        nombre: 'Tanque de almacenamiento',
        descripcion: 'Obra de almacenamiento',
        encargadoRealizacion: 'Ing. María',
        duracion: '12 meses',
        estado: 'COMPLETADO',
      }),
    })

    const estado = container.querySelector(
      '#proyectos-form-estado',
    ) as HTMLSelectElement

    expect(estado.value).toBe('COMPLETADO')
    expect(estado.disabled).toBe(true)
    expect(container.textContent).toContain(
      'El cambio de estado de ejecución todavía no está disponible.',
    )
  })

  it('permite cancelar sin enviar', async () => {
    const onCancel = vi.fn()
    const { onSubmit } = await renderForm({ onCancel })

    const cancel = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Cancelar',
    )

    await act(async () => {
      cancel?.click()
    })

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('muestra el error de validación del Backend cuando el guardado responde 400', async () => {
    const onSubmit = vi.fn(async () => {
      throw new Error('HTTP 400: El nombre del proyecto es obligatorio')
    })
    await renderForm({
      onSubmit,
      initialValues: {
        nombre: 'Obra Norte',
        descripcion: '',
        encargadoRealizacion: 'Ing. María',
        duracion: '8 meses',
        estado: 'PENDIENTE',
      },
    })

    await act(async () => {
      container.querySelector('form')?.requestSubmit()
    })

    expect(container.textContent).toContain('El nombre del proyecto es obligatorio')
    expect(container.textContent).not.toContain('HTTP 400')
    expect(container.querySelector('#proyectos-form-nombre-error')?.textContent).toBe(
      'El nombre del proyecto es obligatorio',
    )
    expect(
      (container.querySelector('#proyectos-form-nombre') as HTMLInputElement).getAttribute(
        'aria-invalid',
      ),
    ).toBe('true')
    expect(
      (container.querySelector('#proyectos-form-nombre') as HTMLInputElement).getAttribute(
        'aria-describedby',
      ),
    ).toBe('proyectos-form-nombre-error')
    expect(submitButton().disabled).toBe(false)
    expect(submitButton().textContent).toBe('Guardar')
  })

  it('muestra el error de guardado cuando onSubmit rechaza', async () => {
    const onSubmit = vi.fn(async () => {
      throw new Error('HTTP 500: Error interno')
    })
    await renderForm({
      onSubmit,
      initialValues: {
        nombre: 'Obra Norte',
        descripcion: '',
        encargadoRealizacion: 'Ing. María',
        duracion: '8 meses',
        estado: 'PENDIENTE',
      },
    })

    await act(async () => {
      container.querySelector('form')?.requestSubmit()
    })

    expect(container.textContent).toContain(
      'No fue posible guardar los cambios. Intente nuevamente.',
    )
    expect(container.textContent).not.toContain('Error interno')
    expect(container.textContent).not.toContain('SELECT')
    expect(submitButton().disabled).toBe(false)
    expect(submitButton().textContent).toBe('Guardar')
    expect(container.querySelector('form')?.getAttribute('aria-describedby')).toBe(
      'proyectos-form-error',
    )
    expect(container.querySelector('#proyectos-form-error')?.getAttribute('role')).toBe(
      'alert',
    )
    expect(submitButton().disabled).toBe(false)
    expect(container.querySelector('form')?.hasAttribute('aria-busy')).toBe(false)

    await act(async () => {
      container.querySelector('form')?.requestSubmit()
    })

    expect(onSubmit).toHaveBeenCalledTimes(2)
  })

  it('no duplica el manejo de 401 ni convierte un 403 en logout', async () => {
    const onSubmit = vi.fn(async () => {
      throw new Error('HTTP 401: Unauthorized')
    })
    await renderForm({
      onSubmit,
      initialValues: validFormValues,
    })

    await act(async () => {
      container.querySelector('form')?.requestSubmit()
    })

    expect(container.textContent).not.toContain('La sesión no es válida')
    expect(container.textContent).not.toContain('Cierre sesión')
    expect(container.textContent).not.toContain(
      'No fue posible guardar los cambios. Intente nuevamente.',
    )
    expect(submitButton().disabled).toBe(false)

    const forbiddenSubmit = vi.fn(async () => {
      throw new Error('HTTP 403: Acceso denegado')
    })
    await renderForm({
      onSubmit: forbiddenSubmit,
      initialValues: validFormValues,
    })

    await act(async () => {
      container.querySelector('form')?.requestSubmit()
    })

    expect(container.textContent).not.toContain('Cerrar sesión')
    expect(container.textContent).not.toContain('logout')
    expect(submitButton().disabled).toBe(false)
  })

  it('permite completar y enviar el formulario con teclado', async () => {
    const { onSubmit, onCancel } = await renderForm()
    const nombre = container.querySelector('#proyectos-form-nombre') as HTMLInputElement
    const descripcion = container.querySelector(
      '#proyectos-form-descripcion',
    ) as HTMLTextAreaElement
    const encargado = container.querySelector(
      '#proyectos-form-encargado',
    ) as HTMLInputElement
    const duracion = container.querySelector('#proyectos-form-duracion') as HTMLInputElement
    const estado = container.querySelector('#proyectos-form-estado') as HTMLSelectElement
    const cancel = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Cancelar',
    ) as HTMLButtonElement
    const guardar = submitButton()

    for (const control of [nombre, descripcion, encargado, duracion, estado, cancel, guardar]) {
      expect(control.tabIndex).toBeGreaterThanOrEqual(0)
      control.focus()
      expect(document.activeElement).toBe(control)
    }

    await act(async () => {
      setInputValue(nombre, 'Obra Norte')
      setInputValue(encargado, 'Ing. María')
      setInputValue(duracion, '8 meses')
      changeSelect(estado, 'PENDIENTE')
      guardar.focus()
      guardar.click()
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('permite seleccionar una imagen válida, muestra su vista previa y la envía al submit', async () => {
    const onSubmit = vi.fn(async () => undefined)
    await renderForm({
      onSubmit,
      initialValues: validFormValues,
    })

    const fileInput = container.querySelector(
      '#proyectos-form-imagen-principal',
    ) as HTMLInputElement
    const file = new File(['fake-image'], 'portada.png', { type: 'image/png' })

    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
      })
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(container.textContent).toContain('Nueva portada (sin guardar)')

    await act(async () => {
      container.querySelector('form')?.requestSubmit()
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Obra Norte' }),
      file,
      false,
    )
  })

  it('muestra error de validación cuando se selecciona un archivo no permitido o de tamaño excesivo', async () => {
    const onSubmit = vi.fn(async () => undefined)
    await renderForm({
      onSubmit,
      initialValues: validFormValues,
    })

    const fileInput = container.querySelector(
      '#proyectos-form-imagen-principal',
    ) as HTMLInputElement
    const invalidFile = new File(['text content'], 'doc.pdf', {
      type: 'application/pdf',
    })

    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: true,
      })
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(container.textContent).toContain(
      'Formato de imagen no permitido. Solo se aceptan imágenes JPG, PNG, WEBP o GIF.',
    )

    await act(async () => {
      container.querySelector('form')?.requestSubmit()
    })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('permite quitar una imagen asignada mediante el botón Quitar portada', async () => {
    const onSubmit = vi.fn(async () => undefined)
    await renderForm({
      onSubmit,
      initialValues: {
        ...validFormValues,
        imagenPrincipalUrl: 'https://example.com/portada.jpg',
      },
    })

    expect(container.textContent).toContain('Portada actual')

    const removeBtn = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Quitar portada',
    )

    await act(async () => {
      removeBtn?.click()
    })

    expect(container.textContent).toContain('No se ha asignado una imagen de portada')

    await act(async () => {
      container.querySelector('form')?.requestSubmit()
    })

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Obra Norte' }),
      null,
      true,
    )
  })
})

describe('ProyectosAdminForm — layout y accesibilidad', () => {
  it('declara estilos para desktop, tablet y celular sin rediseñar AdminLayout', async () => {
    const { readFileSync } = await import('node:fs')
    const { dirname, resolve } = await import('node:path')
    const { fileURLToPath } = await import('node:url')
    const css = readFileSync(
      resolve(dirname(fileURLToPath(import.meta.url)), '../../../index.css'),
      'utf8',
    )

    expect(css).toContain('.proyectos-admin__form')
    expect(css).toContain('.proyectos-admin__form-row')
    expect(css).toContain('.proyectos-admin__form-actions')
    expect(css).toContain('minmax(0, 1fr) minmax(0, 1fr)')
    expect(css).toContain('min-height: 9.5rem')
    expect(css).toContain('min-height: 44px')
    expect(css).toContain('@media (max-width: 1199px)')
    expect(css).toContain('@media (max-width: 760px)')
    expect(css).toContain('grid-template-columns: minmax(0, 1fr)')
    expect(css).toContain('textarea:focus-visible')
    expect(css).not.toContain('.admin-layout .proyectos-admin__form')
  })
})
