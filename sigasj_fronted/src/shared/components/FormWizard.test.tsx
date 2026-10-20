import { act, type ComponentProps } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import FormWizard from './FormWizard'
import FormWizardFieldError, { useFormWizardField } from './FormWizardFieldError'
import type { FormWizardStep } from '../props/FormWizardProps'
import { emailField, numericField, requiredSelection, requiredText } from '../utils/formValidationSchemas'
import { z } from 'zod'

const mounted: Array<{ container: HTMLDivElement; root: Root }> = []

const mount = async (steps: readonly FormWizardStep[], props: Partial<ComponentProps<typeof FormWizard>> = {}) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  mounted.push({ container, root })

  await act(async () => {
    root.render(<FormWizard steps={steps} {...props} />)
  })
  return { container, root }
}

const buttonByText = (container: HTMLElement, text: string) =>
  [...container.querySelectorAll('button')].find((button) => button.textContent?.includes(text)) as HTMLButtonElement

afterEach(async () => {
  for (const item of mounted.splice(0)) {
    await act(async () => item.root.unmount())
    item.container.remove()
  }
})

describe('FormWizard', () => {
  const steps: FormWizardStep[] = [
    { id: 'solicitante', title: 'Datos del solicitante', content: <input name="nombre" defaultValue="" /> },
    { id: 'inmueble', title: 'Datos del inmueble', content: <input name="finca" defaultValue="" /> },
    { id: 'revision', title: 'Revisión', content: <p>Revise los datos antes de enviar.</p> },
  ]

  it('muestra el paso actual y un indicador de progreso accesible', async () => {
    const { container } = await mount(steps)

    expect(container.textContent).toContain('Paso 1 de 3')
    expect(container.querySelector('[aria-current="step"]')?.textContent).toContain('Datos del solicitante')
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('33')
    expect(container.querySelector('[data-wizard-step="solicitante"]')?.hasAttribute('hidden')).toBe(false)
    expect(container.querySelector('[data-wizard-step="inmueble"]')?.hasAttribute('hidden')).toBe(true)
  })

  it('avanza, retrocede y conserva los valores porque los pasos permanecen montados', async () => {
    const onStepChange = vi.fn()
    const { container } = await mount(steps, { onStepChange })
    const nameInput = container.querySelector('[name="nombre"]') as HTMLInputElement
    nameInput.value = 'Ana Rodríguez'

    await act(async () => buttonByText(container, 'Siguiente').click())
    expect(container.textContent).toContain('Paso 2 de 3')
    expect(onStepChange).toHaveBeenLastCalledWith(1, steps[1])

    await act(async () => buttonByText(container, 'Anterior').click())
    expect(container.textContent).toContain('Paso 1 de 3')
    expect((container.querySelector('[name="nombre"]') as HTMLInputElement).value).toBe('Ana Rodríguez')
  })

  it('deshabilita el avance y explica la validación pendiente', async () => {
    const invalidSteps: FormWizardStep[] = [
      { id: 'required', title: 'Datos obligatorios', content: <input required />, canAdvance: false, validationMessage: 'Completa los campos obligatorios.' },
      { id: 'review', title: 'Revisión', content: <p>Resumen</p> },
    ]
    const { container } = await mount(invalidSteps)
    const next = buttonByText(container, 'Siguiente')

    expect(next.disabled).toBe(true)
    expect(next.getAttribute('aria-describedby')).toBeTruthy()
    expect(container.querySelector('[role="status"]')?.textContent).toContain('Completa los campos obligatorios.')
  })

  it('solicita confirmación antes de ejecutar la acción final', async () => {
    const onComplete = vi.fn()
    const { container } = await mount(steps, { initialStep: 2, completeLabel: 'Enviar solicitud', onComplete })

    expect(container.textContent).toContain('Paso 3 de 3')
    expect(container.textContent).toContain('Revise los datos antes de enviar.')
    await act(async () => buttonByText(container, 'Enviar solicitud').click())
    expect(onComplete).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Confirmar envío de solicitud')
    await act(async () => buttonByText(container, 'Confirmar y enviar').click())
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('impide envíos duplicados mientras la solicitud está en proceso', async () => {
    let resolveSubmission: (() => void) | undefined
    const onComplete = vi.fn(() => new Promise<void>((resolve) => { resolveSubmission = resolve }))
    const { container } = await mount(steps, { initialStep: 2, completeLabel: 'Enviar solicitud', onComplete })

    await act(async () => buttonByText(container, 'Enviar solicitud').click())
    const confirm = buttonByText(container, 'Confirmar y enviar')
    await act(async () => {
      confirm.click()
      confirm.click()
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(container.textContent).toContain('Enviando…')
    expect(buttonByText(container, 'Enviando…').disabled).toBe(true)

    await act(async () => resolveSubmission?.())
    expect(container.textContent).toContain('Enviar solicitud')
  })

  it('incluye controles adaptables para pantallas pequeñas', async () => {
    const { container } = await mount(steps)

    expect(container.innerHTML).toContain('max-[700px]:grid-cols-1')
    expect(container.innerHTML).toContain('max-[480px]:flex-col-reverse')
    expect(buttonByText(container, 'Anterior').type).toBe('button')
    expect(buttonByText(container, 'Siguiente').type).toBe('button')
  })

  it('valida solo el paso actual, muestra mensajes y enfoca el primer error', async () => {
    const values = { nombre: '', correo: '', monto: '', provincia: '' }
    const ValidatedFields = () => {
      const nombre = useFormWizardField('nombre')
      const correo = useFormWizardField('correo')
      return (
        <div>
          <label>Nombre<input name="nombre" {...nombre.inputProps} /></label>
          <FormWizardFieldError name="nombre" />
          <label>Correo<input name="correo" {...correo.inputProps} /></label>
          <FormWizardFieldError name="correo" />
          <label>Monto<input name="monto" /></label>
          <FormWizardFieldError name="monto" />
          <label>Provincia<select name="provincia" defaultValue=""><option value="">Seleccione</option></select></label>
          <FormWizardFieldError name="provincia" />
        </div>
      )
    }
    const validatedSteps: FormWizardStep[] = [
      {
        id: 'contacto',
        title: 'Contacto',
        content: <ValidatedFields />,
        validation: {
          schema: z.object({
            nombre: requiredText('el nombre completo'),
            correo: emailField,
            monto: numericField('el monto'),
            provincia: requiredSelection('una provincia'),
          }),
          getValues: () => values,
        },
      },
      { id: 'revision', title: 'Revisión', content: <p>Resumen</p> },
    ]
    const { container } = await mount(validatedSteps)

    await act(async () => {
      buttonByText(container, 'Siguiente').click()
      await new Promise((resolve) => window.requestAnimationFrame(resolve))
    })

    expect(container.textContent).toContain('Paso 1 de 2')
    expect(container.textContent).toContain('Ingresa el nombre completo.')
    expect(container.textContent).toContain('Ingresa el correo electrónico.')
    expect(container.textContent).toContain('Ingresa el monto.')
    expect(container.textContent).toContain('Selecciona una provincia.')
    expect(document.activeElement?.getAttribute('name')).toBe('nombre')
    expect(container.querySelector('[name="nombre"]')?.getAttribute('aria-invalid')).toBe('true')

    values.nombre = 'Ana Rodríguez'
    values.correo = 'ana@example.com'
    values.monto = '1500.50'
    values.provincia = 'Guanacaste'
    await act(async () => buttonByText(container, 'Siguiente').click())

    expect(container.textContent).toContain('Paso 2 de 2')
    expect(container.textContent).not.toContain('Ingresa el nombre completo.')
  })
})
