import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import SolicitudesAdminHomePage from './SolicitudesAdminHomePage'
import {
  FORMULARIOS_DESCARGABLES_ADMIN_PATH,
  FORMULARIOS_OFICIALES_ADMIN_PATH,
  SOLICITUDES_ADMIN_TRAMITES_PATH,
} from './solicitudesAdminPaths'

describe('SolicitudesAdminHomePage', () => {
  it('presenta el acceso principal y dos secciones secundarias', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <SolicitudesAdminHomePage />
      </MemoryRouter>,
    )
    expect(markup).toContain('Gestión de solicitudes')
    expect(markup).toContain('Trámites digitales')
    expect(markup).toContain('grid-cols-2')
    expect(markup).toContain('max-[680px]:grid-cols-1')
    expect(markup).not.toContain('Centro de gestión')
    expect(markup).not.toContain('¿Qué desea administrar?')
    expect(markup).not.toContain('3 secciones disponibles')
    expect(markup).not.toContain('bg-teal')
    expect(markup).not.toContain('bg-violet')
    expect(markup).toContain(`href="${SOLICITUDES_ADMIN_TRAMITES_PATH}"`)
    expect(markup).toContain(`href="${FORMULARIOS_OFICIALES_ADMIN_PATH}"`)
    expect(markup).toContain(`href="${FORMULARIOS_DESCARGABLES_ADMIN_PATH}"`)
    expect((markup.match(/tabler-icon-arrow-right/g) ?? []).length).toBeGreaterThanOrEqual(3)
  })
})
