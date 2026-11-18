import {
  IconAlertTriangle,
  IconMapPin,
  IconRefresh,
} from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ADMIN_COPY } from '../../shared/admin/adminCopy'
import { Alert, Button, EmptyState } from '../../shared/ui'
import './mapa-red.css'
import MapaRedMap from './MapaRedMap'
import {
  applySectorUbicacionGeoAverias,
  countAveriasBySector,
  filterAveriasBySector,
  formatFechaReporte,
} from './mapaRedAverias'
import {
  SECTORES_CATALOGO,
  sectorPorId,
  type SectorId,
} from './mapaRedGeo'
import { MAPA_RED_TITLE } from './mapaRedPaths'
import { useMapaRedAveriasActivas } from './useMapaRedAveriasActivas'

export type MapaRedPanelProps = {
  showPageTitle?: boolean
  compact?: boolean
  /** Oculta el h2 interno (p. ej. cuando el dashboard ya titula la sección). */
  hideShellTitle?: boolean
  className?: string
}

export default function MapaRedPanel({
  showPageTitle = false,
  compact = false,
  hideShellTitle = false,
  className = '',
}: MapaRedPanelProps) {
  const [selectedId, setSelectedId] = useState<SectorId>('centro')
  const [selectedAveriaId, setSelectedAveriaId] = useState<number | null>(null)

  const {
    averias: averiasRaw,
    loading,
    error,
    unauthorized,
    forbidden,
    lastUpdatedAt,
    refetch,
  } = useMapaRedAveriasActivas()

  /** Puntos por sector + dirección en San Juan (sin coordenadas GPS). */
  const averias = useMemo(
    () => applySectorUbicacionGeoAverias(averiasRaw),
    [averiasRaw],
  )

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

  useEffect(() => {
    if (
      selectedAveriaId != null &&
      !sectorAverias.some((item) => item.id === selectedAveriaId)
    ) {
      setSelectedAveriaId(null)
    }
  }, [sectorAverias, selectedAveriaId])

  const selectSector = (id: SectorId) => {
    setSelectedId(id)
    setSelectedAveriaId(null)
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
        {!showPageTitle && !hideShellTitle ? (
          <h2 className="mapa-red__shell-title">
            {MAPA_RED_TITLE} – San Juan
          </h2>
        ) : null}

        <div className="mapa-red__toolbar">
          <div className="mapa-red__sectors" role="listbox" aria-label="Sectores">
            {SECTORES_CATALOGO.map((sector) => {
              const active = selectedId === sector.id
              const alertCount = countsBySector[sector.id]
              return (
                <button
                  key={sector.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`mapa-red__sector-chip${active ? ' is-active' : ''}${
                    alertCount > 0 ? ' has-alert' : ''
                  }`}
                  style={
                    alertCount > 0
                      ? { ['--sector-color' as string]: '#dc2626' }
                      : { ['--sector-color' as string]: sector.color }
                  }
                  onClick={() => selectSector(sector.id)}
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
          <div className="mapa-red__refresh-wrap">
            {updatedLabel ? (
              <span className="mapa-red__updated">{updatedLabel}</span>
            ) : null}
            <Button
              type="button"
              className="mapa-red__refresh-btn"
              size="sm"
              variant="secondary"
              onClick={() => refetch()}
              disabled={loading}
              aria-label="Actualizar averías activas"
              leftIcon={
                <IconRefresh
                  size={16}
                  className={loading ? 'mapa-red__spin' : undefined}
                  aria-hidden="true"
                />
              }
            >
              Actualizar
            </Button>
          </div>
        </div>

        {error || unauthorized || forbidden ? (
          <Alert tone="danger" className="mapa-red__error" role="alert">
            <p className="m-0">
              {unauthorized || forbidden
                ? 'No tiene permiso para consultar averías activas.'
                : error}
            </p>
            {!unauthorized && !forbidden ? (
              <Button
                type="button"
                className="mt-3"
                size="sm"
                onClick={() => refetch()}
                leftIcon={<IconRefresh size={16} aria-hidden="true" />}
              >
                {ADMIN_COPY.retry}
              </Button>
            ) : null}
          </Alert>
        ) : null}

        <div className="mapa-red__main">
          <div className={`mapa-red__map-card${hasAlert ? ' mapa-red__map-card--alert' : ''}`}>
            <MapaRedMap
              selectedSectorId={selectedId}
              onSelectSector={selectSector}
              averiasGeo={averiasConCoords}
              selectedAveriaId={selectedAveriaId}
              onSelectAveria={setSelectedAveriaId}
              sectoresAfectadosIds={sectoresAfectadosConLimite}
              demoGeo={false}
            />
          </div>

          <aside
            className={`mapa-red__detail-card${hasAlert ? ' mapa-red__detail-card--alert' : ''}`}
            aria-label="Averías del sector"
          >
            <div className="mapa-red__info-head">
              <div>
                <h3 className="mapa-red__info-title">{selected.nombre}</h3>
                <p className="mapa-red__info-sub">
                  Averías activas ubicadas por dirección en San Juan
                </p>
              </div>
              {hasAlert ? (
                <span className="mapa-red__info-alert-pill">
                  <IconAlertTriangle size={14} aria-hidden="true" />
                  {sectorAverias.length} activa
                  {sectorAverias.length === 1 ? '' : 's'}
                </span>
              ) : (
                <span className="mapa-red__info-ok-pill">Sin alertas</span>
              )}
            </div>

            <div className="mapa-red__stat-row" aria-label="Resumen de averías">
              <div className="mapa-red__stat mapa-red__stat--compact">
                <span>Activas</span>
                <strong>{loading && !averias.length ? '…' : averias.length}</strong>
              </div>
              <div
                className={`mapa-red__stat mapa-red__stat--compact${sectoresAfectadosIdsCount ? ' is-alert' : ''}`}
              >
                <span>Sectores</span>
                <strong>{sectoresAfectadosIdsCount}</strong>
              </div>
              <div
                className={`mapa-red__stat mapa-red__stat--compact${hasAlert ? ' is-alert' : ''}`}
              >
                <span>En este sector</span>
                <strong>{sectorAverias.length}</strong>
              </div>
            </div>

            <div className="mapa-red__averia-panel">
              {loading && !averias.length ? (
                <p className="mapa-red__averia-empty">Cargando averías…</p>
              ) : sectorAverias.length === 0 ? (
                <EmptyState
                  className="mapa-red__empty"
                  icon={<IconMapPin size={22} aria-hidden="true" />}
                  title={
                    averias.length === 0
                      ? 'Sin averías activas'
                      : 'Sin averías en este sector'
                  }
                  description={
                    averias.length === 0
                      ? 'Cuando se reporte una avería con sector y dirección, aparecerá aquí y en el mapa.'
                      : 'Elija otro sector o actualice para ver reportes nuevos.'
                  }
                />
              ) : (
                <ul className="mapa-red__averia-list">
                  {sectorAverias.map((averia) => {
                    const active = selectedAveriaId === averia.id
                    return (
                      <li key={averia.id}>
                        <button
                          type="button"
                          className={`mapa-red__averia-item${active ? ' is-selected' : ''}`}
                          onClick={() => setSelectedAveriaId(averia.id)}
                          aria-pressed={active}
                        >
                          <span className="mapa-red__averia-code">
                            {averia.codigoSeguimiento}
                          </span>
                          <span className="mapa-red__averia-addr">
                            {averia.ubicacion}
                          </span>
                          <span className="mapa-red__averia-meta">
                            {averia.estadoLabel}
                            {' · '}
                            {formatFechaReporte(averia.fechaReporte)}
                          </span>
                        </button>
                        <Link
                          className="mapa-red__averia-link"
                          to={averia.detailPath}
                        >
                          Detalle
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
