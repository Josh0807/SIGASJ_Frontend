import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from 'react-leaflet'
import type {
  Feature,
  FeatureCollection,
  LineString,
  MultiLineString,
  MultiPolygon,
  Point,
  Polygon,
} from 'geojson'
import L, { type Layer, type PathOptions } from 'leaflet'
import {
  IconCurrentLocation,
  IconLayersSubtract,
  IconMap,
  IconSatellite,
} from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import {
  HIDRANTES_GEOJSON,
  MAPA_RED_CENTER,
  MAPA_RED_DEFAULT_ZOOM,
  MAPA_RED_MAX_ZOOM,
  MAPA_RED_MIN_ZOOM,
  SECTORES_CATALOGO,
  TANQUES_GEOJSON,
  TUBERIAS_GEOJSON,
  VALVULAS_GEOJSON,
  hasGeoInfrastructure,
  hasValidatedSectorBoundaries,
  type InfraLineProperties,
  type InfraPointProperties,
  type SectorCatalogo,
  type SectorId,
} from './mapaRedGeo'
import {
  formatFechaReporte,
  getDemoSectorCenter,
  type AveriaMapaItem,
} from './mapaRedAverias'

type MapaRedMapProps = {
  selectedSectorId: SectorId
  onSelectSector: (id: SectorId) => void
  /** Averías activas con coordenadas válidas (o demoGeo). */
  averiasGeo?: AveriaMapaItem[]
  /** Sectores con avería activa y límite GeoJSON validado. */
  sectoresAfectadosIds?: SectorId[]
  /** Modo prueba visual; no altera leyenda productiva. */
  demoGeo?: boolean
  className?: string
}

type LayerToggles = {
  referencia: boolean
  sectores: boolean
  averias: boolean
  tuberias: boolean
  valvulas: boolean
  hidrantes: boolean
  tanques: boolean
}

type BasemapMode = 'hibrido' | 'satelite' | 'calles'

const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

/** Imagen aérea real (casas, techos, vegetación). */
const ESRI_IMAGERY_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const ESRI_IMAGERY_LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
const ESRI_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Source: Esri, Maxar, Earthstar Geographics'

const ALERT_PIN_HTML = `
  <div class="mapa-red__alert-pin">
    <span class="mapa-red__alert-pin-halo"></span>
    <span class="mapa-red__alert-pin-body" aria-hidden="true"></span>
  </div>
`

const ASADA_PIN_HTML = `
  <div class="mapa-red__pin">
    <span class="mapa-red__pin-halo"></span>
    <span class="mapa-red__pin-body">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path fill="currentColor" d="M12 2.2c-3.4 0-6.2 2.7-6.2 6.1 0 4.6 5.4 10.8 5.6 11.1.3.3.8.3 1.1 0 .2-.3 5.7-6.5 5.7-11.1C18.2 4.9 15.4 2.2 12 2.2zm0 8.4a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6z"/>
      </svg>
    </span>
  </div>
`

function MapResizeSync() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    const sync = () => map.invalidateSize({ animate: false })
    const frame = window.requestAnimationFrame(sync)
    window.addEventListener('resize', sync)
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => sync())
        : null
    observer?.observe(container.parentElement ?? container)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', sync)
      observer?.disconnect()
    }
  }, [map])
  return null
}

function AveriasMapCamera({
  sector,
  averias,
}: {
  sector: SectorCatalogo
  averias: AveriaMapaItem[]
}) {
  const map = useMap()
  const prevSectorId = useRef<SectorId | null>(null)
  const prevAveriasKey = useRef('')

  // Carga / Actualizar: encuadrar TODOS los pines para que se vean.
  useEffect(() => {
    const key = averias
      .map((item) => item.id)
      .sort((a, b) => a - b)
      .join(',')
    if (!key || key === prevAveriasKey.current) return
    prevAveriasKey.current = key

    const points = averias
      .filter((item) => item.coords)
      .map((item) => L.latLng(item.coords!.lat, item.coords!.lng))
    if (points.length >= 2) {
      map.fitBounds(L.latLngBounds(points), {
        padding: [48, 48],
        maxZoom: 17,
        animate: true,
      })
      return
    }
    if (points.length === 1) {
      map.flyTo(points[0], 17, { duration: 0.6 })
    }
  }, [map, averias])

  // Chip de sector: enfocar ese grupo (sin ocultar el overview en el primer render).
  useEffect(() => {
    if (prevSectorId.current === null) {
      prevSectorId.current = sector.id
      return
    }
    if (prevSectorId.current === sector.id) return
    prevSectorId.current = sector.id

    if (sector.limiteGeoJson) {
      const layer = L.geoJSON(sector.limiteGeoJson as never)
      map.flyToBounds(layer.getBounds(), {
        padding: [36, 36],
        maxZoom: 16,
        duration: 0.75,
      })
      return
    }

    const inSector = averias.filter(
      (item) => item.sectorId === sector.id && item.coords,
    )
    if (inSector.length >= 2) {
      map.fitBounds(
        L.latLngBounds(
          inSector.map((item) => L.latLng(item.coords!.lat, item.coords!.lng)),
        ),
        { padding: [40, 40], maxZoom: 18, animate: true },
      )
      return
    }

    const center = getDemoSectorCenter(sector.id)
    map.flyTo([center.lat, center.lng], 17.5, { duration: 0.7 })
  }, [map, sector, averias])

  return null
}

function MapToolbar({
  layersOpen,
  onToggleLayers,
  basemap,
  onCycleBasemap,
}: {
  layersOpen: boolean
  onToggleLayers: () => void
  basemap: BasemapMode
  onCycleBasemap: () => void
}) {
  const map = useMap()
  const basemapLabel =
    basemap === 'hibrido'
      ? 'Vista: Híbrido (satélite + nombres)'
      : basemap === 'satelite'
        ? 'Vista: Satélite'
        : 'Vista: Calles'

  return createPortal(
    <div className="mapa-red__tools">
      <button
        type="button"
        className="mapa-red__tool-btn"
        aria-label="Centrar en San Juan"
        title="Centrar en San Juan"
        onClick={() => {
          map.flyTo(MAPA_RED_CENTER, 17, { duration: 0.7 })
        }}
      >
        <IconCurrentLocation size={17} aria-hidden="true" stroke={2} />
      </button>
      <button
        type="button"
        className={`mapa-red__tool-btn${basemap !== 'calles' ? ' is-active' : ''}`}
        aria-label={basemapLabel}
        title={basemapLabel}
        onClick={onCycleBasemap}
      >
        {basemap === 'calles' ? (
          <IconMap size={17} aria-hidden="true" stroke={2} />
        ) : (
          <IconSatellite size={17} aria-hidden="true" stroke={2} />
        )}
      </button>
      <button
        type="button"
        className={`mapa-red__tool-btn${layersOpen ? ' is-active' : ''}`}
        aria-label="Capas del mapa"
        aria-expanded={layersOpen}
        title="Capas"
        onClick={onToggleLayers}
      >
        <IconLayersSubtract size={17} aria-hidden="true" stroke={2} />
      </button>
    </div>,
    map.getContainer(),
  )
}

const pointStyle = (
  tipo: InfraPointProperties['tipo'],
): PathOptions & { radius: number } => {
  if (tipo === 'valvula') {
    return { color: '#0f172a', fillColor: '#fff', fillOpacity: 1, weight: 2, radius: 7 }
  }
  if (tipo === 'hidrante') {
    return { color: '#fff', fillColor: '#dc2626', fillOpacity: 1, weight: 1.5, radius: 7 }
  }
  return { color: '#fff', fillColor: '#1e5a9c', fillOpacity: 1, weight: 1.5, radius: 8 }
}

function bindInfraPopup(
  feature: Feature<Point, InfraPointProperties>,
  layer: Layer,
) {
  const props = feature.properties
  if (!props) return
  layer.bindPopup(
    `<strong>${props.etiqueta}</strong><br/><span>${props.tipo}</span>`,
  )
}

function bindLinePopup(
  feature: Feature<LineString | MultiLineString, InfraLineProperties>,
  layer: Layer,
) {
  const props = feature.properties
  if (!props) return
  layer.bindPopup(`<strong>${props.etiqueta}</strong><br/><span>Tubería</span>`)
}

export default function MapaRedMap({
  selectedSectorId,
  onSelectSector,
  averiasGeo = [],
  sectoresAfectadosIds = [],
  demoGeo = false,
  className = '',
}: MapaRedMapProps) {
  const [mounted] = useState(() => typeof window !== 'undefined')
  const [layersOpen, setLayersOpen] = useState(false)
  const [basemap, setBasemap] = useState<BasemapMode>('hibrido')
  const [layers, setLayers] = useState<LayerToggles>({
    referencia: true,
    sectores: true,
    averias: true,
    tuberias: true,
    valvulas: true,
    hidrantes: true,
    tanques: true,
  })

  const cycleBasemap = () => {
    setBasemap((current) => {
      if (current === 'hibrido') return 'satelite'
      if (current === 'satelite') return 'calles'
      return 'hibrido'
    })
  }

  const selected = SECTORES_CATALOGO.find((s) => s.id === selectedSectorId)!
  const showInfra = hasGeoInfrastructure()
  const showBoundaries = hasValidatedSectorBoundaries()
  const hasPipes = TUBERIAS_GEOJSON.features.length > 0
  const hasValves = VALVULAS_GEOJSON.features.length > 0
  const hasHydrants = HIDRANTES_GEOJSON.features.length > 0
  const hasTanks = TANQUES_GEOJSON.features.length > 0
  const afectados = useMemo(
    () => new Set(sectoresAfectadosIds),
    [sectoresAfectadosIds],
  )
  const geoAverias = useMemo(
    () => averiasGeo.filter((item) => item.coords != null),
    [averiasGeo],
  )

  const asadaIcon = useMemo(
    () =>
      L.divIcon({
        className: 'mapa-red__asada-marker',
        html: ASADA_PIN_HTML,
        iconSize: [40, 48],
        iconAnchor: [20, 44],
        popupAnchor: [0, -40],
      }),
    [],
  )

  const alertIcon = useMemo(
    () =>
      L.divIcon({
        className: 'mapa-red__alert-marker',
        html: ALERT_PIN_HTML,
        iconSize: [36, 44],
        iconAnchor: [18, 40],
        popupAnchor: [0, -36],
      }),
    [],
  )

  const sectorBoundaries = useMemo(() => {
    const features = SECTORES_CATALOGO.filter((s) => s.limiteGeoJson != null).map(
      (s) =>
        ({
          type: 'Feature',
          properties: { id: s.id, nombre: s.nombre, color: s.color },
          geometry: s.limiteGeoJson!,
        }) as Feature<Polygon | MultiPolygon, { id: SectorId; nombre: string; color: string }>,
    )
    return {
      type: 'FeatureCollection',
      features,
    } satisfies FeatureCollection<
      Polygon | MultiPolygon,
      { id: SectorId; nombre: string; color: string }
    >
  }, [])

  const toggleLayer = (key: keyof LayerToggles) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (!mounted) {
    return (
      <div className={`mapa-red__leaflet-host mapa-red__leaflet-host--loading ${className}`}>
        <p>Cargando mapa geográfico…</p>
      </div>
    )
  }

  return (
    <div
      className={`mapa-red__leaflet-host${basemap !== 'calles' ? ' mapa-red__leaflet-host--imagery' : ''}${className ? ` ${className}` : ''}`}
    >
      <MapContainer
        center={MAPA_RED_CENTER}
        zoom={MAPA_RED_DEFAULT_ZOOM}
        minZoom={MAPA_RED_MIN_ZOOM}
        maxZoom={MAPA_RED_MAX_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        className="mapa-red__leaflet"
        attributionControl
      >
        {basemap === 'calles' ? (
          <TileLayer key="osm" attribution={OSM_ATTRIBUTION} url={OSM_URL} />
        ) : (
          <>
            <TileLayer
              key="esri-imagery"
              attribution={ESRI_ATTRIBUTION}
              url={ESRI_IMAGERY_URL}
              maxZoom={19}
            />
            {basemap === 'hibrido' ? (
              <TileLayer
                key="esri-labels"
                url={ESRI_IMAGERY_LABELS_URL}
                opacity={0.95}
                maxZoom={19}
              />
            ) : null}
          </>
        )}
        <ZoomControl position="topleft" />
        <MapResizeSync />
        <AveriasMapCamera sector={selected} averias={geoAverias} />
        <MapToolbar
          layersOpen={layersOpen}
          onToggleLayers={() => setLayersOpen((open) => !open)}
          basemap={basemap}
          onCycleBasemap={cycleBasemap}
        />

        {layers.referencia ? (
          <Marker position={MAPA_RED_CENTER} icon={asadaIcon}>
            <Popup className="mapa-red__popup">
              <div className="mapa-red__popup-body">
                <strong>ASADA San Juan</strong>
                <span>Referencia comunitaria pública</span>
                <em>No es un nodo de la red de agua</em>
              </div>
            </Popup>
          </Marker>
        ) : null}

        {showBoundaries && layers.sectores ? (
          <GeoJSON
            key={`boundaries-${selectedSectorId}-${[...afectados].join(',')}`}
            data={sectorBoundaries}
            style={(feature) => {
              const id = feature?.properties?.id as SectorId | undefined
              const color = (feature?.properties?.color as string) || '#1e5a9c'
              const active = id === selectedSectorId
              const affected = id != null && afectados.has(id)
              if (affected) {
                return {
                  color: '#b91c1c',
                  weight: active ? 3.5 : 2.5,
                  fillColor: '#ef4444',
                  fillOpacity: active ? 0.38 : 0.28,
                }
              }
              return {
                color,
                weight: active ? 3 : 1.5,
                fillColor: color,
                fillOpacity: active ? 0.28 : 0.12,
              }
            }}
            onEachFeature={(feature, layer) => {
              const id = feature.properties?.id as SectorId | undefined
              const nombre = feature.properties?.nombre as string | undefined
              const affected = id != null && afectados.has(id)
              if (nombre) {
                layer.bindPopup(
                  affected
                    ? `<strong>${nombre}</strong><br/><span>Avería activa</span>`
                    : nombre,
                )
              }
              if (id) {
                layer.on({
                  click: () => onSelectSector(id),
                })
              }
            }}
          />
        ) : null}

        {layers.averias
          ? geoAverias.map((averia) =>
              averia.coords ? (
                <Marker
                  key={averia.id}
                  position={[averia.coords.lat, averia.coords.lng]}
                  icon={alertIcon}
                  eventHandlers={{
                    click: () => {
                      if (averia.sectorId) onSelectSector(averia.sectorId)
                    },
                  }}
                >
                  <Popup className="mapa-red__popup mapa-red__popup--alert">
                    <div className="mapa-red__popup-body">
                      <strong>{averia.codigoSeguimiento}</strong>
                      <span>
                        {averia.estadoLabel}
                        {averia.prioridad ? ` · ${averia.prioridad}` : ''}
                      </span>
                      <span>{averia.descripcion}</span>
                      <span>{averia.ubicacion}</span>
                      <span>{formatFechaReporte(averia.fechaReporte)}</span>
                      <Link className="mapa-red__popup-link" to={averia.detailPath}>
                        Ver detalle
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ) : null,
            )
          : null}

        {hasPipes && layers.tuberias ? (
          <GeoJSON
            data={TUBERIAS_GEOJSON as FeatureCollection}
            style={{ color: '#0891b2', weight: 4, opacity: 0.9 }}
            onEachFeature={(feature, layer) =>
              bindLinePopup(
                feature as Feature<LineString | MultiLineString, InfraLineProperties>,
                layer,
              )
            }
          />
        ) : null}

        {hasValves && layers.valvulas ? (
          <GeoJSON
            data={VALVULAS_GEOJSON as FeatureCollection}
            pointToLayer={(feature, latlng) => {
              const tipo =
                (feature.properties as InfraPointProperties | null)?.tipo ?? 'valvula'
              return L.circleMarker(latlng, pointStyle(tipo))
            }}
            onEachFeature={(feature, layer) =>
              bindInfraPopup(feature as Feature<Point, InfraPointProperties>, layer)
            }
          />
        ) : null}

        {hasHydrants && layers.hidrantes ? (
          <GeoJSON
            data={HIDRANTES_GEOJSON as FeatureCollection}
            pointToLayer={(feature, latlng) => {
              const tipo =
                (feature.properties as InfraPointProperties | null)?.tipo ?? 'hidrante'
              return L.circleMarker(latlng, pointStyle(tipo))
            }}
            onEachFeature={(feature, layer) =>
              bindInfraPopup(feature as Feature<Point, InfraPointProperties>, layer)
            }
          />
        ) : null}

        {hasTanks && layers.tanques ? (
          <GeoJSON
            data={TANQUES_GEOJSON as FeatureCollection}
            pointToLayer={(feature, latlng) => {
              const tipo =
                (feature.properties as InfraPointProperties | null)?.tipo ?? 'tanque'
              return L.circleMarker(latlng, pointStyle(tipo))
            }}
            onEachFeature={(feature, layer) =>
              bindInfraPopup(feature as Feature<Point, InfraPointProperties>, layer)
            }
          />
        ) : null}
      </MapContainer>

      <div className="mapa-red__legend mapa-red__legend--compact" aria-label="Leyenda">
        <div className="mapa-red__legend-item">
          <span className="mapa-red__swatch mapa-red__swatch--ref" />
          ASADA
        </div>
        <div className={`mapa-red__legend-item${geoAverias.length ? '' : ' is-muted'}`}>
          <span className="mapa-red__swatch mapa-red__swatch--alert" />
          {demoGeo ? 'Avería (demo)' : 'Avería'}
        </div>
        {showInfra ? (
          <div className="mapa-red__legend-item">
            <span className="mapa-red__swatch mapa-red__swatch--pipe" />
            Tubería
          </div>
        ) : null}
      </div>

      <div className="mapa-red__basemap-switch" role="group" aria-label="Tipo de mapa">
        <button
          type="button"
          className={basemap === 'hibrido' ? 'is-active' : undefined}
          onClick={() => setBasemap('hibrido')}
        >
          Híbrido
        </button>
        <button
          type="button"
          className={basemap === 'satelite' ? 'is-active' : undefined}
          onClick={() => setBasemap('satelite')}
        >
          Satélite
        </button>
        <button
          type="button"
          className={basemap === 'calles' ? 'is-active' : undefined}
          onClick={() => setBasemap('calles')}
        >
          Calles
        </button>
      </div>

      {layersOpen ? (
        <div className="mapa-red__layers-panel" role="dialog" aria-label="Capas del mapa">
          <strong>Capas</strong>
          <label className="mapa-red__layer-row">
            <input
              type="checkbox"
              checked={layers.referencia}
              onChange={() => toggleLayer('referencia')}
            />
            Referencia ASADA
          </label>
          <label className="mapa-red__layer-row">
            <input
              type="checkbox"
              checked={layers.averias}
              onChange={() => toggleLayer('averias')}
            />
            Averías activas
            {geoAverias.length === 0 ? ' (sin coords)' : ` (${geoAverias.length})`}
          </label>
          <label className={`mapa-red__layer-row${showBoundaries ? '' : ' is-disabled'}`}>
            <input
              type="checkbox"
              checked={layers.sectores}
              disabled={!showBoundaries}
              onChange={() => toggleLayer('sectores')}
            />
            Sectores{showBoundaries ? '' : ' (sin límites)'}
          </label>
          <label className={`mapa-red__layer-row${hasPipes ? '' : ' is-disabled'}`}>
            <input
              type="checkbox"
              checked={layers.tuberias}
              disabled={!hasPipes}
              onChange={() => toggleLayer('tuberias')}
            />
            Tuberías{hasPipes ? '' : ' (sin datos)'}
          </label>
          <label className={`mapa-red__layer-row${hasValves ? '' : ' is-disabled'}`}>
            <input
              type="checkbox"
              checked={layers.valvulas}
              disabled={!hasValves}
              onChange={() => toggleLayer('valvulas')}
            />
            Válvulas{hasValves ? '' : ' (sin datos)'}
          </label>
          <label className={`mapa-red__layer-row${hasHydrants ? '' : ' is-disabled'}`}>
            <input
              type="checkbox"
              checked={layers.hidrantes}
              disabled={!hasHydrants}
              onChange={() => toggleLayer('hidrantes')}
            />
            Hidrantes{hasHydrants ? '' : ' (sin datos)'}
          </label>
          <label className={`mapa-red__layer-row${hasTanks ? '' : ' is-disabled'}`}>
            <input
              type="checkbox"
              checked={layers.tanques}
              disabled={!hasTanks}
              onChange={() => toggleLayer('tanques')}
            />
            Tanques{hasTanks ? '' : ' (sin datos)'}
          </label>
        </div>
      ) : null}
    </div>
  )
}
