import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import QuickAccessCard from './QuickAccessCard'

describe('QuickAccessCard', () => {
  it('renderiza título, descripción, ícono y enlace con React Router', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <QuickAccessCard
          title="Padrón de abonados"
          description="Consultar expediente de abonados"
          path="/admin/abonados"
          icon={<svg data-testid="icon-abonados" />}
        />
      </MemoryRouter>,
    )

    expect(markup).toContain('href="/admin/abonados"')
    expect(markup).toContain('Padrón de abonados')
    expect(markup).toContain('Consultar expediente de abonados')
    expect(markup).toContain('data-testid="icon-abonados"')
    expect(markup).toContain('quick-access-card')
  })

  it('no renderiza la tarjeta cuando isAuthorized es false', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <QuickAccessCard
          title="Módulo restringido"
          path="/admin/restringido"
          isAuthorized={false}
        />
      </MemoryRouter>,
    )

    expect(markup).toBe('')
  })

  it('renderiza la tarjeta normalmente cuando isAuthorized es true', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <QuickAccessCard
          title="Módulo autorizado"
          path="/admin/permitido"
          isAuthorized={true}
        />
      </MemoryRouter>,
    )

    expect(markup).toContain('Módulo autorizado')
    expect(markup).toContain('href="/admin/permitido"')
  })

  it('renderiza badge opcional si se proporciona badgeText', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <QuickAccessCard
          title="Lecturas"
          path="/admin/lecturas"
          badgeText="Nuevo"
        />
      </MemoryRouter>,
    )

    expect(markup).toContain('Nuevo')
    expect(markup).toContain('quick-access-card__badge')
  })
})
