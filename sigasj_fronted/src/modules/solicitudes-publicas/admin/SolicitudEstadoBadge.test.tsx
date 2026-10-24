import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import SolicitudEstadoBadge from './SolicitudEstadoBadge'

describe('SolicitudEstadoBadge', () => {
  it('presenta estados administrativos legibles', () => {
    expect(renderToStaticMarkup(<SolicitudEstadoBadge estado="EN_REVISION" />)).toContain('En revisión')
    expect(renderToStaticMarkup(<SolicitudEstadoBadge estado="APROBADA" />)).toContain('Aprobada')
  })
})
