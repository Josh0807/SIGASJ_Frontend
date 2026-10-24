import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import RequestTrackingPage from './RequestTrackingPage'

describe('RequestTrackingPage', () => {
  it('muestra la consulta pública responsive por código', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <RequestTrackingPage />
      </MemoryRouter>,
    )

    expect(markup).toContain('Seguimiento de Solicitudes')
    expect(markup).toContain('name="codigoSeguimiento"')
    expect(markup).toContain('Consultar solicitud')
    expect(markup).toContain('max-[640px]:grid-cols-1')
    expect(markup).toContain('href="/#solicitudes-servicio"')
  })

  it('precarga el código recibido desde la confirmación', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/solicitudes/seguimiento?codigo=SOL-2026-A82K91']}>
        <RequestTrackingPage />
      </MemoryRouter>,
    )
    expect(markup).toContain('value="SOL-2026-A82K91"')
  })
})
