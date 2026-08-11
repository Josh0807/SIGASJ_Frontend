import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TransparencyCard from './TransparencyCard'

describe('TransparencyCard', () => {
  it('abre PDF en pestaña nueva con atributos de seguridad', () => {
    const markup = renderToStaticMarkup(
      <TransparencyCard
        id="1"
        name="Informe anual"
        description="Resumen del informe de calidad del agua."
        fileUrl="/uploads/transparencia/informe.pdf"
        fileType="pdf"
      />,
    )

    expect(markup).toContain('Ver documento')
    expect(markup).toContain('href="/uploads/transparencia/informe.pdf"')
    expect(markup).toContain('target="_blank"')
    expect(markup).toContain('rel="noopener noreferrer"')
    expect(markup).not.toContain('download=')
  })

  it('abre imágenes en pestaña nueva con etiqueta correspondiente', () => {
    const markup = renderToStaticMarkup(
      <TransparencyCard
        id="2"
        name="Muestreo"
        description="Fotografía del punto de muestreo."
        fileUrl="/uploads/transparencia/muestreo.jpg"
        fileType="jpg"
      />,
    )

    expect(markup).toContain('Ver imagen')
    expect(markup).toContain('data-file-type="jpg"')
    expect(markup).toContain('target="_blank"')
    expect(markup).toContain('rel="noopener noreferrer"')
  })

  it('no renderiza tarjetas incompletas', () => {
    const markup = renderToStaticMarkup(
      <TransparencyCard
        id="3"
        name=""
        description="Sin nombre"
        fileUrl="/uploads/transparencia/doc.pdf"
        fileType="pdf"
      />,
    )

    expect(markup).toBe('')
  })
})
