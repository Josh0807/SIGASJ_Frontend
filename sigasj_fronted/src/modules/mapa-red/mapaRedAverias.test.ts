import { describe, expect, it } from 'vitest'
import {
  countAveriasBySector,
  extractAveriaCoords,
  filterAveriasBySector,
  matchSectorIdFromComunidad,
  toAveriaMapaItem,
} from './mapaRedAverias'
import type { AveriaListItem } from '../averias/admin/types'

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

describe('mapaRedAverias — sector y coordenadas reales', () => {
  it('relaciona sectorComunidad con el catálogo (alias y variantes)', () => {
    expect(matchSectorIdFromComunidad('Sector Centro')).toBe('centro')
    expect(matchSectorIdFromComunidad('centro')).toBe('centro')
    expect(matchSectorIdFromComunidad('Las Palmas')).toBe('las-palmas')
    expect(matchSectorIdFromComunidad('Sector Norte')).toBe('norte')
    expect(matchSectorIdFromComunidad('El Cruce')).toBe('el-cruce')
    expect(matchSectorIdFromComunidad('La Esperanza')).toBe('la-esperanza')
    expect(matchSectorIdFromComunidad('San Juan')).toBeNull()
  })

  it('no inventa coordenadas desde dirección textual', () => {
    const item = toAveriaMapaItem(baseItem())
    expect(item.coords).toBeNull()
    expect(item.coordsSource).toBeNull()
    expect(item.sectorId).toBe('centro')
    expect(
      extractAveriaCoords(baseItem() as AveriaListItem & Record<string, unknown>),
    ).toBeNull()
  })

  it('acepta coordenadas válidas de Costa Rica y marca origen real', () => {
    const withCoords = {
      ...baseItem({
        id: 7,
        sectorComunidad: 'Sector Norte',
        latitud: 10.2205,
        longitud: -85.5571,
      }),
    }
    const mapped = toAveriaMapaItem(withCoords)
    expect(mapped.sectorId).toBe('norte')
    expect(mapped.coords).toEqual({ lat: 10.2205, lng: -85.5571 })
    expect(mapped.coordsSource).toBe('real')
  })

  it('rechaza coordenadas fuera de rango o fuera de Costa Rica', () => {
    expect(
      extractAveriaCoords({
        ...baseItem(),
        latitud: 91,
        longitud: -85.55,
      } as AveriaListItem & Record<string, unknown>),
    ).toBeNull()

    expect(
      extractAveriaCoords({
        ...baseItem(),
        latitud: 40.4,
        longitud: -3.7,
      } as AveriaListItem & Record<string, unknown>),
    ).toBeNull()

    expect(
      extractAveriaCoords({
        ...baseItem(),
        latitud: 10.22,
        longitud: null,
      } as AveriaListItem & Record<string, unknown>),
    ).toBeNull()
  })

  it('filtra y cuenta averías por sector usando solo GPS real', () => {
    const items = [
      toAveriaMapaItem(
        baseItem({
          id: 1,
          sectorComunidad: 'Sector Centro',
          latitud: 10.2188,
          longitud: -85.5565,
        }),
      ),
      toAveriaMapaItem(
        baseItem({
          id: 2,
          sectorComunidad: 'Sector Norte',
          latitud: 10.221,
          longitud: -85.557,
        }),
      ),
      toAveriaMapaItem(
        baseItem({
          id: 3,
          sectorComunidad: 'Sector Centro',
          // sin coords: cuenta por sector, pero no aparece en mapa
        }),
      ),
      toAveriaMapaItem(
        baseItem({
          id: 4,
          sectorComunidad: 'San Juan',
          latitud: 10.219,
          longitud: -85.555,
        }),
      ),
    ]

    const counts = countAveriasBySector(items)
    expect(counts.centro).toBe(2)
    expect(counts.norte).toBe(1)
    expect(counts['las-palmas']).toBe(0)

    const centro = filterAveriasBySector(items, 'centro')
    expect(centro.map((a) => a.id)).toEqual([1, 3])

    const conGps = items.filter((item) => item.coords != null)
    expect(conGps).toHaveLength(3)
    expect(conGps.every((item) => item.coordsSource === 'real')).toBe(true)
    expect(conGps.find((item) => item.id === 4)?.sectorId).toBeNull()
  })

  it('mantiene sector y coords independientes (sector textual + GPS del reporte)', () => {
    const item = toAveriaMapaItem(
      baseItem({
        id: 50,
        sectorComunidad: 'Las Palmas',
        latitud: 10.2192,
        longitud: -85.5548,
        codigoSeguimiento: 'AV-2026-0050',
      }),
    )

    expect(item).toMatchObject({
      codigoSeguimiento: 'AV-2026-0050',
      sectorId: 'las-palmas',
      sectorComunidad: 'Las Palmas',
      coordsSource: 'real',
      coords: { lat: 10.2192, lng: -85.5548 },
    })
  })
})
