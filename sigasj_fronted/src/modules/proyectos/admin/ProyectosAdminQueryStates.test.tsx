import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProyectosAdminQueryStates from './ProyectosAdminQueryStates'

describe('ProyectosAdminQueryStates', () => {
  it('muestra skeleton de carga y no una tabla vacía', () => {
    const markup = renderToStaticMarkup(
      <ProyectosAdminQueryStates
        loading
        error={null}
        hasResults={false}
        hasActiveFilters={false}
        onRetry={() => undefined}
      >
        <table>
          <tbody>
            <tr>
              <td>no debe verse</td>
            </tr>
          </tbody>
        </table>
      </ProyectosAdminQueryStates>,
    )

    expect(markup).toContain('Cargando proyectos…')
    expect(markup).toContain('gallery-admin__skeleton')
    expect(markup).toContain('indicator-card__skeleton')
    expect(markup).not.toContain('no debe verse')
    expect(markup).not.toContain('No hay proyectos registrados.')
    expect(markup).not.toContain('No se encontraron proyectos')
  })

  it('muestra el error y permite reintentar', () => {
    const markup = renderToStaticMarkup(
      <ProyectosAdminQueryStates
        loading={false}
        error="No fue posible cargar los proyectos."
        hasResults={false}
        hasActiveFilters={false}
        onRetry={vi.fn()}
      >
        <p>resultados</p>
      </ProyectosAdminQueryStates>,
    )

    expect(markup).toContain('No fue posible cargar los proyectos.')
    expect(markup).toContain('Reintentar')
    expect(markup).toContain('role="alert"')
    expect(markup).not.toContain('resultados')
    expect(markup).not.toContain('404')
  })

  it('distingue lista vacía general y vacía por filtros', () => {
    const empty = renderToStaticMarkup(
      <ProyectosAdminQueryStates
        loading={false}
        error={null}
        hasResults={false}
        hasActiveFilters={false}
        onRetry={() => undefined}
      >
        <p>resultados</p>
      </ProyectosAdminQueryStates>,
    )
    const filtered = renderToStaticMarkup(
      <ProyectosAdminQueryStates
        loading={false}
        error={null}
        hasResults={false}
        hasActiveFilters
        onRetry={() => undefined}
      >
        <p>resultados</p>
      </ProyectosAdminQueryStates>,
    )

    expect(empty).toContain('No hay proyectos registrados.')
    expect(empty).not.toContain('filtros seleccionados')
    expect(filtered).toContain(
      'No se encontraron proyectos con los filtros seleccionados.',
    )
    expect(filtered).not.toContain('No hay proyectos registrados.')
    expect(filtered).not.toContain('404')
  })

  it('muestra los resultados cuando la consulta responde con datos', () => {
    const markup = renderToStaticMarkup(
      <ProyectosAdminQueryStates
        loading={false}
        error={null}
        hasResults
        hasActiveFilters={false}
        onRetry={() => undefined}
      >
        <table>
          <caption>Listado de proyectos</caption>
        </table>
      </ProyectosAdminQueryStates>,
    )

    expect(markup).toContain('Listado de proyectos')
    expect(markup).not.toContain('Cargando proyectos…')
  })
})
