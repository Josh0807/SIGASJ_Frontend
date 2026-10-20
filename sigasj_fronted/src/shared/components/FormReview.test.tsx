import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import FormReview from './FormReview'
import FormWizard from './FormWizard'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('FormReview', () => {
  it('agrupa los datos, muestra documentos y permite volver a corregir', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <FormWizard
          initialStep={2}
          completeLabel="Enviar solicitud"
          steps={[
            { id: 'persona', title: 'Datos del solicitante', content: <input name="nombre" /> },
            { id: 'documentos', title: 'Documentos', content: <input name="archivo" type="file" /> },
            {
              id: 'revision',
              title: 'Revisión final',
              content: (
                <FormReview
                  sections={[
                    {
                      id: 'persona',
                      title: 'Datos del solicitante',
                      stepIndex: 0,
                      items: [
                        { label: 'Nombre completo', value: 'Ana Rodríguez' },
                        { label: 'Correo', value: 'ana@example.com' },
                      ],
                    },
                  ]}
                  documentsStepIndex={1}
                  documents={[
                    { id: 'cedula', name: 'cedula.pdf', size: 1536, type: 'application/pdf' },
                  ]}
                />
              ),
            },
          ]}
        />,
      )
    })

    expect(container.textContent).toContain('Datos del solicitante')
    expect(container.textContent).toContain('Ana Rodríguez')
    expect(container.textContent).toContain('ana@example.com')
    expect(container.textContent).toContain('Documentos seleccionados')
    expect(container.textContent).toContain('cedula.pdf')
    expect(container.textContent).toContain('1.5 KB')

    const correctInformation = [...container.querySelectorAll('button')]
      .find((button) => button.textContent?.includes('Corregir información')) as HTMLButtonElement
    await act(async () => correctInformation.click())
    expect(container.textContent).toContain('Paso 1 de 3')

    await act(async () => root.unmount())
    container.remove()
  })

  it('muestra un estado comprensible cuando no hay documentos', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <FormWizard steps={[
          { id: 'revision', title: 'Revisión', content: <FormReview sections={[]} /> },
        ]} />,
      )
    })

    expect(container.textContent).toContain('No se seleccionaron documentos.')
    await act(async () => root.unmount())
    container.remove()
  })
})
