import { describe, expect, it } from 'vitest'
import {
  applyDemoGeoAverias,
  extractAveriaCoords,
  matchSectorIdFromComunidad,
  toAveriaMapaItem,
} from './mapaRedAverias'
import type { AveriaListItem } from '../averias/admin/types'
import { MAPA_RED_CENTER } from './mapaRedGeo'

const baseItem = (overrides: Partial<AveriaListItem> = {}): AveriaListItem => ({
  id: 1,
  codigoSeguimiento: 'AVG-1',
  fechaReporte: '2026-03-15T10:00:00.000Z',
  nombreReportante: 'Test',
  sectorComunidad: 'Sector Centro',
  ubicacion: 'Calle principal',
  descripcion: 'Fuga',
  estado: 'RECIBIDA',
  prioridad: 'Alta',
  tipoAveria: null,
  fontanero: null,
  ...overrides,
})

describe('mapaRedAverias', () => {
  it('relaciona sectorComunidad con el catálogo sin inventar geometría', () => {
    expect(matchSectorIdFromComunidad('Sector Centro')).toBe('centro')
    expect(matchSectorIdFromComunidad('Las Palmas')).toBe('las-palmas')
    expect(matchSectorIdFromComunidad('San Juan')).toBeNull()
  })

  it('no inventa coordenadas desde dirección textual', () => {
    const item = toAveriaMapaItem(baseItem())
    expect(item.coords).toBeNull()
    expect(extractAveriaCoords(baseItem() as AveriaListItem & Record<string, unknown>)).toBeNull()
  })

  it('acepta coordenadas válidas si el payload las trae', () => {
    const withCoords = {
      ...baseItem(),
      latitud: 10.2188,
      longitud: -85.5565,
    } as AveriaListItem & Record<string, unknown>
    expect(extractAveriaCoords(withCoords)).toEqual({
      lat: 10.2188,
      lng: -85.5565,
    })
  })

  it('demoGeo asigna puntos rojos de prueba sin tocar coords reales', () => {
    const sinCoords = toAveriaMapaItem(baseItem({ id: 10 }))
    const conCoords = toAveriaMapaItem({
      ...baseItem({ id: 11 }),
      ...({ latitud: 10.22, longitud: -85.55 } as object),
    } as AveriaListItem)

    const demo = applyDemoGeoAverias([sinCoords, conCoords], true)
    expect(demo[0].coords).not.toBeNull()
    expect(demo[0].coords!.lat).toBeGreaterThan(MAPA_RED_CENTER[0] - 0.02)
    expect(demo[0].coords!.lat).toBeLessThan(MAPA_RED_CENTER[0] + 0.02)
    expect(demo[1].coords).toEqual({ lat: 10.22, lng: -85.55 })

    const normal = applyDemoGeoAverias([sinCoords], false)
    expect(normal[0].coords).toBeNull()
  })

  it('demoGeo reparte averías del mismo sector en puntos distintos', () => {
    const sameSector = [
      toAveriaMapaItem(baseItem({ id: 21, sectorComunidad: 'Sector Norte' })),
      toAveriaMapaItem(baseItem({ id: 22, sectorComunidad: 'Sector Norte' })),
      toAveriaMapaItem(baseItem({ id: 23, sectorComunidad: 'Sector Norte' })),
    ]
    const demo = applyDemoGeoAverias(sameSector, true)
    const keys = new Set(
      demo.map((item) => `${item.coords!.lat.toFixed(6)},${item.coords!.lng.toFixed(6)}`),
    )
    expect(keys.size).toBe(3)
  })

  it('demoGeo separa sectores en anclas distintas', () => {
    const mixed = [
      toAveriaMapaItem(baseItem({ id: 31, sectorComunidad: 'Sector Centro' })),
      toAveriaMapaItem(baseItem({ id: 32, sectorComunidad: 'Sector Norte' })),
    ]
    const demo = applyDemoGeoAverias(mixed, true)
    const dist = Math.hypot(
      demo[0].coords!.lat - demo[1].coords!.lat,
      demo[0].coords!.lng - demo[1].coords!.lng,
    )
    expect(dist).toBeGreaterThan(0.001)
  })
})
