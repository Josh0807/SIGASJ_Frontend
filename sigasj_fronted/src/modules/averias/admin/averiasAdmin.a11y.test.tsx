import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AveriasAdminPage from './AveriasAdminPage'
import AveriaStatusBadge from './AveriaStatusBadge'
import { AVERIAS_ADMIN_UI_FIXTURE } from './fixtures/averiasAdminList.fixture'
import * as averiasAdminApi from '../services/averiasAdminApi'

const styles = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../../index.css'),
  'utf8',
)

describe('accesibilidad del listado administrativo de averías', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.spyOn(averiasAdminApi, 'getAdminAverias').mockResolvedValue(
      AVERIAS_ADMIN_UI_FIXTURE,
    )
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  it('asocia labels, usa tabla semántica y acciones reales', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AveriasAdminPage />
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(
      container.querySelector('label[for="averias-admin-buscar"]'),
    ).toBeTruthy()
    expect(
      container.querySelector('label[for="averias-admin-estado"]'),
    ).toBeTruthy()
    expect(
      container.querySelector('label[for="averias-admin-prioridad"]'),
    ).toBeTruthy()
    expect(
      container.querySelector('label[for="averias-admin-tipo"]'),
    ).toBeTruthy()
    expect(
      container.querySelector('label[for="averias-admin-fecha-desde"]'),
    ).toBeTruthy()
    expect(
      container.querySelector('label[for="averias-admin-fecha-hasta"]'),
    ).toBeTruthy()
    expect(container.querySelector('form[role="search"]')).toBeTruthy()
    expect(container.querySelector('table caption')?.textContent).toBe(
      'Listado de averías',
    )
    expect(container.querySelectorAll('th[scope="col"]').length).toBe(11)

    const detail = [...container.querySelectorAll('a')].find(
      (anchor) => anchor.textContent === 'Ver detalle',
    )
    expect(detail?.tagName).toBe('A')
    expect(detail?.getAttribute('href')).toBe('/admin/averias/1')
    expect(container.querySelector('div[onclick]')).toBeNull()

    const next = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Siguiente',
    )
    expect(next?.tagName).toBe('BUTTON')
    expect(next?.tabIndex).toBeGreaterThanOrEqual(0)
  })

  it('expone focus visible y badges con texto, no solo color', () => {
    expect(styles).toContain('.averias-admin .gallery-admin__field input:focus-visible')
    expect(styles).toContain('.averias-admin .gallery-admin__button:focus-visible')
    expect(styles).toContain('.averias-admin .gallery-admin__link:focus-visible')
    expect(styles).toContain('.averias-admin__cards')
    expect(styles).toMatch(/@media \(max-width: 760px\)[\s\S]*\.averias-admin__cards/)
    expect(styles).toMatch(/@media \(max-width: 1199px\)[\s\S]*\.averias-admin__detail-grid/)
  })

  it('muestra el texto de cada estado previsto', async () => {
    const cases = [
      ['RECIBIDA', 'Recibida'],
      ['ASIGNADA', 'Asignada'],
      ['PENDIENTE_ATENCION', 'Pendiente de atención'],
      ['EN_ATENCION', 'En atención'],
      ['RESUELTA', 'Resuelta'],
    ] as const

    for (const [estado, label] of cases) {
      await act(async () => {
        root.render(<AveriaStatusBadge estado={estado} />)
      })
      expect(container.textContent).toContain(label)
    }
  })
})
