import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import AdminListQueryStates from './AdminListQueryStates'

describe('AdminListQueryStates', () => {
  it('muestra skeleton al cargar sin resultados', () => {
    const markup = renderToStaticMarkup(
      <AdminListQueryStates
        loading
        error={null}
        hasResults={false}
        loadingMessage="Cargando…"
        emptyMessage="Sin datos"
      >
        <p>oculto</p>
      </AdminListQueryStates>,
    )
    expect(markup).toContain('Cargando…')
    expect(markup).toContain('gallery-admin__skeleton')
    expect(markup).not.toContain('oculto')
  })

  it('conserva resultados previos si keepPreviousResultsWhileLoading', () => {
    const markup = renderToStaticMarkup(
      <AdminListQueryStates
        loading
        error={null}
        hasResults
        loadingMessage="Cargando…"
        emptyMessage="Sin datos"
        keepPreviousResultsWhileLoading
      >
        <p>listado</p>
      </AdminListQueryStates>,
    )
    expect(markup).toContain('listado')
    expect(markup).toContain('aria-busy="true"')
  })

  it('muestra error con botón Reintentar canónico', () => {
    const markup = renderToStaticMarkup(
      <AdminListQueryStates
        loading={false}
        error="Falló la consulta"
        hasResults={false}
        loadingMessage="Cargando…"
        emptyMessage="Sin datos"
        onRetry={vi.fn()}
      >
        <p>oculto</p>
      </AdminListQueryStates>,
    )
    expect(markup).toContain('Falló la consulta')
    expect(markup).toContain('gallery-admin__button--primary')
    expect(markup).toContain('Reintentar')
  })
})
