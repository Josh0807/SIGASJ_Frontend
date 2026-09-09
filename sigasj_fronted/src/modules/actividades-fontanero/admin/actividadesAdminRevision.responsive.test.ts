import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('responsive — revisión administrativa', () => {
  const css = readFileSync(
    resolve(__dirname, '../../../index.css'),
    'utf8',
  )

  it('incluye breakpoints tablet y móvil para filtros y detalle', () => {
    expect(css).toContain('@media (max-width: 900px)')
    expect(css).toContain('@media (max-width: 640px)')
    expect(css).toContain(
      '@media (min-width: 641px) and (max-width: 900px)',
    )
    expect(css).toContain('.actividades-admin-revision__filters')
    expect(css).toContain('.actividades-admin-revision__correction')
    expect(css).toContain('.actividades-admin-revision__table td::before')
  })
})
