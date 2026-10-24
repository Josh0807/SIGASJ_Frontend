import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import FormSuccessResult from './FormSuccessResult'

describe('FormSuccessResult', () => {
  it('destaca el código y ofrece copiarlo', () => {
    const markup = renderToStaticMarkup(
      <FormSuccessResult
        title="Solicitud enviada correctamente"
        description="Conserve este código para consultar el estado de su trámite."
        highlightLabel="Código de seguimiento"
        highlightValue="SOL-2026-A82K91"
      />,
    )
    expect(markup).toContain('SOL-2026-A82K91')
    expect(markup).toContain('Copiar código')
    expect(markup).toContain('Conserve este código')
  })
})
