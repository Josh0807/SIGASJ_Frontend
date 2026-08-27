import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProyectosAdminPagination from './ProyectosAdminPagination'
import { clampProyectosPage } from './types'

describe('clampProyectosPage', () => {
  it('no permite una página menor que 1 ni mayor que totalPages', () => {
    expect(clampProyectosPage(0, 4)).toBe(1)
    expect(clampProyectosPage(-2, 4)).toBe(1)
    expect(clampProyectosPage(5, 4)).toBe(4)
    expect(clampProyectosPage(2, 4)).toBe(2)
    expect(clampProyectosPage(3, 0)).toBe(1)
  })
})

describe('ProyectosAdminPagination', () => {
  it('no muestra controles cuando total es 0', () => {
    const markup = renderToStaticMarkup(
      <ProyectosAdminPagination
        page={1}
        totalPages={0}
        total={0}
        onPageChange={() => undefined}
      />,
    )

    expect(markup).toBe('')
  })

  it('usa page y totalPages del Backend', () => {
    const markup = renderToStaticMarkup(
      <ProyectosAdminPagination
        page={2}
        totalPages={5}
        total={48}
        onPageChange={() => undefined}
      />,
    )

    expect(markup).toContain('Página 2 de 5')
    expect(markup).toContain('Anterior')
    expect(markup).toContain('Siguiente')
    expect(markup).not.toContain('currentPage')
    expect(markup).not.toContain('perPage')
  })
})
