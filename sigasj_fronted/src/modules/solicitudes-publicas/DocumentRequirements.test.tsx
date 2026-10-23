import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import DocumentRequirements from './DocumentRequirements'

describe('DocumentRequirements', () => {
  it('explica el requisito antes del selector y permite retirar archivos', () => {
    const file = new File(['contenido'], 'cedula.pdf', { type: 'application/pdf' })
    const onFilesChange = vi.fn()
    const markup = renderToStaticMarkup(<DocumentRequirements slug="arreglo-pago" files={[file]} onFilesChange={onFilesChange} />)
    expect(markup).toContain('Copia de la cédula del propietario')
    expect(markup).toContain('Obligatorio')
    expect(markup).toContain('cedula.pdf')
    expect(markup).toContain('Quitar cedula.pdf')
    expect(markup).toContain('Listo para adjuntar')
  })

  it('oculta el selector para afiliación', () => {
    const markup = renderToStaticMarkup(<DocumentRequirements slug="afiliacion" files={[]} onFilesChange={vi.fn()} />)
    expect(markup).toContain('Requisitos de la solicitud')
    expect(markup).not.toContain('Elegir archivos')
  })
})
