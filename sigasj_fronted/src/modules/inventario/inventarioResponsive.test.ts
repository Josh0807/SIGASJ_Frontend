import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const css = readFileSync('src/index.css', 'utf8')

describe('responsive del catálogo de materiales', () => {
  it('incluye adaptación móvil para tabla, formulario y acciones', () => {
    expect(css).toContain('@media (max-width: 760px)')
    expect(css).toContain('.materials-admin table, .materials-admin tbody, .materials-admin tr, .materials-admin td { display: block; }')
    expect(css).toContain('.materials-admin__filters, .materials-admin__form { grid-template-columns: 1fr;')
    expect(css).toContain('.materials-admin__row-actions, .materials-admin__state-action { width: 100%; }')
  })

  it('adapta el listado de alertas de reposición en pantallas pequeñas', () => {
    expect(css).toContain('.material-tracking table, .material-tracking tbody, .material-tracking tr, .material-tracking td')
    expect(css).toContain('.material-tracking__filters { align-items: stretch; flex-direction: column; }')
  })
})
