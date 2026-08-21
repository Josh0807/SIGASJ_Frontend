import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import HeroSection from './HeroSection'
import {
  CONTACT_HREF,
  PAYMENTS_HREF,
  REPORT_FAULTS_HREF,
} from '../config/landingAnchors'

describe('HeroSection', () => {
  it('prioriza recibos como CTA principal y muestra accesos rápidos', () => {
    const markup = renderToStaticMarkup(<HeroSection />)

    expect(markup).toContain('hero__button--primary')
    expect(markup).toContain(`href="${PAYMENTS_HREF}"`)
    expect(markup).toContain(`href="${REPORT_FAULTS_HREF}"`)
    expect(markup).toContain('hero-services')
    expect(markup).toContain(`href="${CONTACT_HREF}"`)
  })
})
