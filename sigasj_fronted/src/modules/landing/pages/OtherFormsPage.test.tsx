import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import OtherFormsPage from './OtherFormsPage'

describe('OtherFormsPage', () => {
  it('explica que los formularios adicionales son solo descargables', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <OtherFormsPage />
      </MemoryRouter>,
    )

    expect(markup).toContain('Otros Formularios')
    expect(markup).toContain('Estos documentos no se completan')
    expect(markup).toContain('No hay formularios adicionales publicados por el momento.')
    expect(markup).toContain('href="/#solicitudes-servicio"')
    expect(markup).not.toContain('Realizar solicitud')
  })
})
