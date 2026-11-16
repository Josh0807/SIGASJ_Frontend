import {
  IconAlertTriangle,
  IconMapPin,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import './mapa-red.css'
import MapaRedMap from './MapaRedMap'
import {
  applyDemoGeoAverias,
  countAveriasBySector,
  filterAveriasBySector,
} from './mapaRedAverias'
import {
  SECTORES_CATALOGO,
  buscarSectores,
  sectorPorId,
  type SectorId,
} from './mapaRedGeo'
import { MAPA_RED_TITLE } from './mapaRedPaths'
import { useMapaRedAveriasActivas } from './useMapaRedAveriasActivas'

export type MapaRedPanelProps = {
  showPageTitle?: boolean
  compact?: boolean
  className?: string
}

export default function MapaRedPanel({
  showPageTitle = false,
  compact = false,
  className = '',
}: MapaRedPanelProps) {
  const [selectedId, setSelectedId] = useState<SectorId>('centro')
  const [query, setQuery] = useState('')

  const {
    averias: averiasRaw,
    loading,
    error,
    unauthorized,
    forbidden,
    lastUpdatedAt,
    refetch,
  } = useMapaRedAveriasActivas()

  /** Puntos rojos automáticos para averías activas. Al resolverse dejan de aparecer. */
  const averias = useMemo(
    () => applyDemoGeoAverias(averiasRaw, true),
    [averiasRaw],
  )

  const matches = useMemo(() => buscarSectores(query), [query])
  const selected = sectorPorId(selectedId)

  const countsBySector = useMemo(() => countAveriasBySector(averias), [averias])
  const sectorAverias = useMemo(
    () => filterAveriasBySector(averias, selectedId),
    [averias, selectedId],
  )
  const averiasConCoords = useMemo(
    () => averias.filter((item) => item.coords != null),
    [averias],
  )
  const sectoresAfectadosConLimite = useMemo(
    () =>
      SECTORES_CATALOGO.filter(
        (s) => s.limiteGeoJson != null && countsBySector[s.id] > 0,
      ).map((s) => s.id),
    [countsBySector],
  )

  const hasAlert = sectorAverias.length > 0
  const sectoresAfectadosIdsCount = useMemo(
    () => SECTORES_CATALOGO.filter((s) => countsBySector[s.id] > 0).length,
    [countsBySector],
  )

  const onSearchChange = (value: string) => {
    setQuery(value)
    const found = buscarSectores(value)
    if (found.length === 1) setSelectedId(found[0].id)
  }

  const updatedLabel =
    lastUpdatedAt == null
      ? null
      : `Actualizado ${new Intl.DateTimeFormat('es-CR', {
          timeStyle: 'short',
        }).format(new Date(lastUpdatedAt))}`

  return (
    <div
      className={`mapa-red mapa-red--split${compact ? ' mapa-red--compact' : ''}${className ? ` ${className}` : ''}`}
    >
      {showPageTitle ? (
        <h1 id="mapa-red-title" className="mapa-red__title">
          {MAPA_RED_TITLE} – San Juan
        </h1>
      ) : null}

      <section
        className={showPageTitle ? 'mapa-red__stage' : 'mapa-red__shell'}
        aria-label={MAPA_RED_TITLE}
      >
        <div className="mapa-red__shell-head">
          {!showPageTitle ? (
            <h2 className="mapa-red__shell-title">
              {MAPA_RED_TITLE} – San Juan
            </h2>
          ) : null}
          <label className="mapa-red__shell-search">
            <IconSearch size={17} color="#94a3b8" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar sector…"
              value={query}
              onChange={(event) => onSearchChange(event.target.value)}
              aria-label="Buscar sector"
            />
          </label>
          <div className="mapa-red__refresh-wrap">
            {updatedLabel ? (
              <span className="mapa-red__updated">{updatedLabel}</span>
            ) : null}
            <button
              type="button"
              className="mapa-red__refresh-btn"
              onClick={() => refetch()}
              disabled={loading}
              aria-label="Actualizar averías activas"
            >
              <IconRefresh
                size={16}
                className={loading ? 'mapa-red__spin' : undefined}
                aria-hidden="true"
              />
              Actualizar
            </button>
          </div>
        </div>

        <div className="mapa-red__sectors" role="listbox" aria-label="Sectores">
          {SECTORES_CATALOGO.map((sector) => {
            const dimmed = query.trim() && !matches.some((m) => m.id === sector.id)
            const active = selectedId === sector.id
            const alertCount = countsBySector[sector.id]
            return (
              <button
                key={sector.id}
                type="button"
                role="option"
                aria-selected={active}
                className={`mapa-red__sector-chip${active ? ' is-active' : ''}${
                  dimmed ? ' is-dim' : ''
                }${alertCount > 0 ? ' has-alert' : ''}`}
                style={
                  alertCount > 0
                    ? { ['--sector-color' as string]: '#dc2626' }
                    : { ['--sector-color' as string]: sector.color }
                }
                onClick={() => setSelectedId(sector.id)}
              >
                <IconMapPin size={14} aria-hidden="true" />
                {sector.nombre.replace('Sector ', '')}
                {alertCount > 0 ? (
                  <span className="mapa-red__sector-badge" aria-label={`${alertCount} averías`}>
                    {alertCount}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        {error || unauthorized || forbidden ? (
          <div className="mapa-red__error" role="alert">
            <span>
              {unauthorized || forbidden
                ? 'No tiene permiso para consultar averías activas.'
                : error}
            </span>
            {!unauthorized && !forbidden ? (
              <button type="button" onClick={() => refetch()}>
                Reintentar
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="mapa-red__main">
          <div className={`mapa-red__map-card${hasAlert ? ' mapa-red__map-card--alert' : ''}`}>
            <MapaRedMap
              selectedSectorId={selectedId}
              onSelectSector={setSelectedId}
              averiasGeo={averiasConCoords}
              sectoresAfectadosIds={sectoresAfectadosConLimite}
              demoGeo
            />
          </div>

          <aside
            className={`mapa-red__detail-card${hasAlert ? ' mapa-red__detail-card--alert' : ''}`}
            aria-label="Información operativa de la red"
          >
            <div className="mapa-red__info-head">
              <div>
                <p className="mapa-red__info-kicker">Panel operativo</p>
                <h3 className="mapa-red__info-title">{selected.nombre}</h3>
              </div>
              {hasAlert ? (
                <span className="mapa-red__info-alert-pill">
                  <IconAlertTriangle size={14} aria-hidden="true" />
                  Avería activa
                </span>
              ) : (
                <span className="mapa-red__info-ok-pill">Sin alertas</span>
              )}
            </div>

            <div className="mapa-red__stat-grid" aria-label="Resumen de averías">
              <div className="mapa-red__stat">
                <span>Averías activas</span>
                <strong>{loading && !averias.length ? '…' : averias.length}</strong>
              </div>
              <div
                className={`mapa-red__stat${sectoresAfectadosIdsCount ? ' is-alert' : ''}`}
              >
                <span>Sectores afectados</span>
                <strong>{sectoresAfectadosIdsCount}</strong>
              </div>
              <div className={`mapa-red__stat${hasAlert ? ' is-alert' : ''}`}>
                <span>En este sector</span>
                <strong>{sectorAverias.length}</strong>
              </div>
              <div className="mapa-red__stat">
                <span>Puntos en mapa</span>
                <strong>{averiasConCoords.length}</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
