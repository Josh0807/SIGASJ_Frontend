import { describe, expect, it } from 'vitest'
import {
  applySectorUbicacionGeoAverias,
  coordsFromSectorUbicacion,
  countAveriasBySector,
  filterAveriasBySector,
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

describe('mapaRedAverias — solo direcciones en San Juan', () => {
  it('relaciona sector y pistas de ubicación', () => {
    expect(matchSectorIdFromComunidad('Sector Centro')).toBe('centro')
    expect(matchSectorIdFromComunidad('Centro')).toBe('centro')
    expect(matchSectorIdFromComunidad('San Juan')).toBe('centro')
    expect(
      matchSectorIdFromComunidad('Comunidad', '200 m norte, Sector El Cruce'),
    ).toBe('el-cruce')
  })

  it('ignora lat/lng del payload y ubica solo por dirección', () => {
    const item = toAveriaMapaItem(
      baseItem({
        latitud: 10.2188,
        longitud: -85.5565,
        ubicacion: '200 m este del tanque',
      }),
    )
    expect(item.coords).toBeNull()
    expect(item.coordsSource).toBeNull()

    const placed = applySectorUbicacionGeoAverias([item])
    expect(placed[0].coordsSource).toBe('sector')
    expect(placed[0].coords).not.toBeNull()
    expect(placed[0].coords).not.toEqual({ lat: 10.2188, lng: -85.5565 })
  })

  it('coloca averías por sector + ubicación específica', () => {
    const a = toAveriaMapaItem(
      baseItem({
        id: 10,
        sectorComunidad: 'Sector Norte',
        ubicacion: 'Frente a la escuela',
      }),
    )
    const b = toAveriaMapaItem(
      baseItem({
        id: 11,
        sectorComunidad: 'Sector Norte',
        ubicacion: '50 m sur del tanque',
      }),
    )
    const placed = applySectorUbicacionGeoAverias([a, b])
    expect(placed[0].coords).not.toEqual(placed[1].coords)
    expect(placed[0].coords!.lat).toBeGreaterThan(MAPA_RED_CENTER[0] - 0.01)
    expect(placed[0].coords!.lat).toBeLessThan(MAPA_RED_CENTER[0] + 0.01)
  })

  it('misma dirección produce el mismo punto', () => {
    const item = toAveriaMapaItem(
      baseItem({
        id: 21,
        sectorComunidad: 'Las Palmas',
        ubicacion: 'Calle principal, casa esquinera',
      }),
    )
    expect(coordsFromSectorUbicacion(item, 0)).toEqual(
      coordsFromSectorUbicacion(item, 0),
    )
  })

  it('separa sectores distintos con la misma dirección textual', () => {
    const placed = applySectorUbicacionGeoAverias([
      toAveriaMapaItem(
        baseItem({
          id: 40,
          sectorComunidad: 'Sector Norte',
          ubicacion: 'Frente a la pulpería',
        }),
      ),
      toAveriaMapaItem(
        baseItem({
          id: 41,
          sectorComunidad: 'El Cruce',
          ubicacion: 'Frente a la pulpería',
        }),
      ),
    ])
    const dist = Math.hypot(
      placed[0].coords!.lat - placed[1].coords!.lat,
      placed[0].coords!.lng - placed[1].coords!.lng,
    )
    expect(dist).toBeGreaterThan(0.001)
  })

  it('cuenta y filtra por sector de San Juan', () => {
    const items = applySectorUbicacionGeoAverias([
      toAveriaMapaItem(baseItem({ id: 1, sectorComunidad: 'Sector Centro' })),
      toAveriaMapaItem(baseItem({ id: 2, sectorComunidad: 'Sector Norte' })),
      toAveriaMapaItem(baseItem({ id: 3, sectorComunidad: 'Centro' })),
    ])
    expect(countAveriasBySector(items).centro).toBe(2)
    expect(countAveriasBySector(items).norte).toBe(1)
    expect(filterAveriasBySector(items, 'centro')).toHaveLength(2)
    expect(items.every((item) => item.coords != null)).toBe(true)
  })
})
