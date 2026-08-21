import { describe, expect, it } from 'vitest'
import {
  telHrefFromPhone,
  whatsappHrefFromPhone,
  buildGoogleMapsEmbedUrl,
} from './contacto.types'

describe('contacto phone helpers', () => {
  it('genera enlace WhatsApp con prefijo 506 para números locales', () => {
    expect(whatsappHrefFromPhone('8560-7584')).toBe('https://wa.me/50685607584')
  })

  it('genera tel con prefijo internacional', () => {
    expect(telHrefFromPhone('8560-7584')).toBe('tel:+50685607584')
  })

  it('conserva números que ya incluyen código de país', () => {
    expect(whatsappHrefFromPhone('+506 8888 9999')).toBe('https://wa.me/50688889999')
  })
})

describe('buildGoogleMapsEmbedUrl', () => {
  it('genera embed en español con coordenadas', () => {
    const url = buildGoogleMapsEmbedUrl({
      latitude: 10.2188017,
      longitude: -85.5565018,
      zoom: 18,
    })

    expect(url).toContain('hl=es')
    expect(url).toContain('output=embed')
    expect(url).toContain('10.2188017')
    expect(url).not.toContain('t=k')
  })
})
