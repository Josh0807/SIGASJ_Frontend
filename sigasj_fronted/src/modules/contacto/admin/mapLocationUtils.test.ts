import { describe, expect, it } from 'vitest'
import {
  formatCoordinate,
  parseCoordinatesFromMapsUrl,
} from './mapLocationUtils'

describe('parseCoordinatesFromMapsUrl', () => {
  it('extrae coordenadas de URL con formato @lat,lng,zoom', () => {
    expect(
      parseCoordinatesFromMapsUrl(
        'https://www.google.com/maps/@10.2188017,-85.5565018,19z',
      ),
    ).toEqual({
      latitude: 10.2188017,
      longitude: -85.5565018,
      zoom: 19,
    })
  })

  it('extrae coordenadas de parámetro q=lat,lng', () => {
    expect(
      parseCoordinatesFromMapsUrl(
        'https://maps.google.com/maps?q=10.21,-85.55&output=embed',
      ),
    ).toEqual({
      latitude: 10.21,
      longitude: -85.55,
    })
  })

  it('extrae coordenadas de enlaces con !3d y !4d', () => {
    expect(
      parseCoordinatesFromMapsUrl(
        'https://www.google.com/maps/place/ASADA/@10.1,-85.5,17z/data=!3d10.2188017!4d-85.5565018',
      ),
    ).toEqual({
      latitude: 10.2188017,
      longitude: -85.5565018,
      zoom: 17,
    })
  })
})

describe('formatCoordinate', () => {
  it('formatea con precisión razonable', () => {
    expect(formatCoordinate(10.2188017)).toBe('10.2188017')
  })
})
