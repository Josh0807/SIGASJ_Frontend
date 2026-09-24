import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import ActivityFeedback from '../../actividades-fontanero/components/ActivityFeedback'
import { formatAveriaAdminDateTimeOrUnavailable } from '../admin/formatAveriaAdminDate'
import { AVERIA_UNAVAILABLE_LABEL } from '../admin/types'
import { useMateriales } from '../../inventario/useMateriales'
import {
  formatSolicitudDate,
  formatSolicitudStatus,
} from '../../inventario/solicitudes-materiales/solicitudMaterialesUtils'
import type { SolicitudMaterialesListItem } from '../../inventario/solicitudes-materiales/types'
import type { SalidaAveria } from '../../inventario/salidas/types'
import {
  adminAveriaReturnPath,
  fontaneroAveriaReturnPath,
  salidaDesdeAveriaHref,
  solicitudAdminRevisionHref,
  solicitudFontaneroDetalleHref,
  solicitudMaterialesDesdeAveriaHref,
  solicitudesAdminRevisionHref,
} from './averiaInventarioPaths'
import { useAveriaInventario, type AveriaInventarioVariant } from './useAveriaInventario'

const CATALOG_PAGE_SIZE = 10

const AveriaCatalogoMateriales = () => {
  const [catalogPage, setCatalogPage] = useState(1)
  const [nombreInput, setNombreInput] = useState('')
  const [nombreQuery, setNombreQuery] = useState('')
  const catalog = useMateriales({
    activo: true,
    page: catalogPage,
    limit: CATALOG_PAGE_SIZE,
    nombre: nombreQuery || undefined,
  })

  const searchCatalog = (event: FormEvent) => {
    event.preventDefault()
    setCatalogPage(1)
    setNombreQuery(nombreInput.trim())
  }

  return (
    <div className="averias-inventario__block">
      <h3>Catálogo y existencias</h3>
      <form className="averias-inventario__search" onSubmit={searchCatalog}>
        <label>
          Buscar material
          <input
            type="search"
            value={nombreInput}
            onChange={(event) => setNombreInput(event.target.value)}
            placeholder="Nombre del material"
          />
        </label>
        <button
          className="gallery-admin__button"
          type="button"
          onClick={() => {
            setCatalogPage(1)
            setNombreQuery(nombreInput.trim())
          }}
        >
          Buscar
        </button>
      </form>
      {catalog.loading ? (
        <p className="averias-admin__muted" role="status">
          Consultando materiales…
        </p>
      ) : null}
      {catalog.error ? (
        <ActivityFeedback variant="error" message={catalog.error} />
      ) : null}
      {!catalog.loading && !catalog.error && catalog.result.data.length === 0 ? (
        <p className="averias-admin__muted">{AVERIA_MATERIALES_SIN_CATALOGO}</p>
      ) : null}
      {!catalog.loading && catalog.result.data.length > 0 ? (
        <div className="averias-inventario__table-wrap">
          <table className="averias-inventario__table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Categoría</th>
                <th>Unidad</th>
                <th>Stock actual</th>
                <th>Disponibilidad</th>
              </tr>
            </thead>
            <tbody>
              {catalog.result.data.map((material) => {
                const sinExistencias = material.stockActual <= 0
                return (
                  <tr key={material.id}>
                    <td>{material.nombre}</td>
                    <td>{material.categoria?.nombre ?? '—'}</td>
                    <td>{material.unidadMedida}</td>
                    <td>{material.stockActual}</td>
                    <td
                      className={
                        sinExistencias ? 'averias-inventario__stock--zero' : undefined
                      }
                    >
                      {sinExistencias
                        ? AVERIA_MATERIALES_SIN_EXISTENCIAS
                        : 'Disponible'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      {!catalog.loading && catalog.result.totalPages > 1 ? (
        <div className="averias-inventario__pager">
          <button
            className="gallery-admin__button"
            type="button"
            disabled={catalogPage <= 1}
            onClick={() => setCatalogPage((page) => Math.max(1, page - 1))}
          >
            Anterior
          </button>
          <span>
            Página {catalog.result.page} de {catalog.result.totalPages}
          </span>
          <button
            className="gallery-admin__button"
            type="button"
            disabled={catalogPage >= catalog.result.totalPages}
            onClick={() =>
              setCatalogPage((page) =>
                Math.min(catalog.result.totalPages, page + 1),
              )
            }
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </div>
  )
}

export const AVERIA_MATERIALES_FONTANERO_TITLE = 'Materiales de la avería'
export const AVERIA_MATERIALES_ADMIN_TITLE = 'Materiales y movimientos'
export const AVERIA_MATERIALES_SOLICITAR_LABEL = 'Solicitar materiales'
export const AVERIA_MATERIALES_SALIDA_LABEL = 'Registrar salida'
export const AVERIA_MATERIALES_SIN_SOLICITUDES =
  'No hay solicitudes de materiales asociadas a esta avería.'
export const AVERIA_MATERIALES_SIN_SALIDAS =
  'No hay salidas de inventario asociadas a esta avería.'
export const AVERIA_MATERIALES_SIN_CATALOGO =
  'No hay materiales registrados en el catálogo.'
export const AVERIA_MATERIALES_SIN_EXISTENCIAS = 'Sin existencias'
export const AVERIA_MATERIALES_SECRETARIA_SOLICITUDES =
  'La consulta y revisión de solicitudes de materiales corresponde a Administradora.'

type AveriaMaterialesSectionProps = {
  averiaId: number
  codigoSeguimiento: string
  variant: AveriaInventarioVariant
  canRegistrarSalida?: boolean
  canRevisarSolicitudes?: boolean
  onUnauthorized?: () => void
}

const materialLabel = (
  detalle: NonNullable<SolicitudMaterialesListItem['detalles']>[number],
) => detalle.material?.nombre ?? `Material #${detalle.idMaterial}`

const salidaMaterialLabel = (salida: SalidaAveria) =>
  salida.material?.nombre ?? `Material #${salida.idMaterial}`

const AveriaMaterialesSection = ({
  averiaId,
  codigoSeguimiento,
  variant,
  canRegistrarSalida = false,
  canRevisarSolicitudes = false,
  onUnauthorized,
}: AveriaMaterialesSectionProps) => {
  const isFontanero = variant === 'fontanero'
  const includeSolicitudes = isFontanero || canRevisarSolicitudes
  const returnPath = isFontanero
    ? fontaneroAveriaReturnPath(averiaId)
    : adminAveriaReturnPath(averiaId)
  const title = isFontanero
    ? AVERIA_MATERIALES_FONTANERO_TITLE
    : AVERIA_MATERIALES_ADMIN_TITLE
  const headingId = isFontanero
    ? 'averia-fontanero-materiales-heading'
    : 'averia-admin-materiales-heading'

  const inventario = useAveriaInventario({
    averiaId,
    variant,
    includeSolicitudes,
    onUnauthorized,
  })

  const solicitarHref = solicitudMaterialesDesdeAveriaHref(
    averiaId,
    codigoSeguimiento,
    returnPath,
  )
  const salidaHref = salidaDesdeAveriaHref(averiaId, returnPath)

  return (
    <section
      className={`averias-admin__section averias-inventario ${
        isFontanero ? 'averias-fontanero__materiales' : ''
      }`}
      aria-labelledby={headingId}
    >
      <div className="averias-inventario__header">
        <h2 id={headingId}>{title}</h2>
        <div className="averias-inventario__toolbar">
          {isFontanero ? (
            <Link className="gallery-admin__button" to={solicitarHref}>
              {AVERIA_MATERIALES_SOLICITAR_LABEL}
            </Link>
          ) : null}
          {canRegistrarSalida ? (
            <Link className="gallery-admin__button" to={salidaHref}>
              {AVERIA_MATERIALES_SALIDA_LABEL}
            </Link>
          ) : null}
          {canRevisarSolicitudes ? (
            <Link className="gallery-admin__link" to={solicitudesAdminRevisionHref()}>
              Revisar solicitudes
            </Link>
          ) : null}
        </div>
      </div>

      {isFontanero ? <AveriaCatalogoMateriales /> : null}

      <div className="averias-inventario__block">
        <h3>Solicitudes</h3>
        {!includeSolicitudes ? (
          <p className="averias-admin__muted">{AVERIA_MATERIALES_SECRETARIA_SOLICITUDES}</p>
        ) : null}
        {includeSolicitudes && inventario.solicitudesLoading ? (
          <p className="averias-admin__muted" role="status">
            Consultando solicitudes…
          </p>
        ) : null}
        {includeSolicitudes && inventario.solicitudesError ? (
          <div>
            <ActivityFeedback variant="error" message={inventario.solicitudesError} />
            <button
              className="gallery-admin__button"
              type="button"
              onClick={inventario.refetch}
            >
              Reintentar solicitudes
            </button>
          </div>
        ) : null}
        {includeSolicitudes &&
        !inventario.solicitudesLoading &&
        !inventario.solicitudesError &&
        inventario.solicitudes.length === 0 ? (
          <p className="averias-admin__muted">{AVERIA_MATERIALES_SIN_SOLICITUDES}</p>
        ) : null}
        {includeSolicitudes && inventario.solicitudes.length > 0 ? (
          <ul className="averias-inventario__list">
            {inventario.solicitudes.map((solicitud) => (
              <li key={solicitud.id}>
                <p>
                  <strong>{solicitud.codigo}</strong>
                  {' · '}
                  {formatSolicitudStatus(solicitud.estado)}
                  {' · '}
                  {solicitud.fechaSolicitud
                    ? formatSolicitudDate(solicitud.fechaSolicitud)
                    : AVERIA_UNAVAILABLE_LABEL}
                </p>
                {solicitud.observacion ? (
                  <p className="averias-admin__prewrap">{solicitud.observacion}</p>
                ) : null}
                {solicitud.detalles && solicitud.detalles.length > 0 ? (
                  <ul>
                    {solicitud.detalles.map((detalle) => (
                      <li key={detalle.id}>
                        {materialLabel(detalle)}: {detalle.cantidad}
                        {detalle.material?.unidadMedida
                          ? ` ${detalle.material.unidadMedida}`
                          : ''}
                        {detalle.observacion ? ` · ${detalle.observacion}` : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="averias-admin__muted">
                    {solicitud.cantidadMateriales
                      ? `${solicitud.cantidadMateriales} material(es) solicitados`
                      : 'Sin detalle de materiales'}
                  </p>
                )}
                {isFontanero ? (
                  <Link
                    className="gallery-admin__link"
                    to={solicitudFontaneroDetalleHref(solicitud.id)}
                  >
                    Ver solicitud
                  </Link>
                ) : null}
                {canRevisarSolicitudes ? (
                  <Link
                    className="gallery-admin__link"
                    to={solicitudAdminRevisionHref(solicitud.id)}
                  >
                    Abrir en Inventario
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="averias-inventario__block">
        <h3>Salidas</h3>
        {inventario.salidasLoading ? (
          <p className="averias-admin__muted" role="status">
            Consultando salidas…
          </p>
        ) : null}
        {inventario.salidasError ? (
          <div>
            <ActivityFeedback variant="error" message={inventario.salidasError} />
            <button
              className="gallery-admin__button"
              type="button"
              onClick={() => {
                inventario.refetch()
              }}
            >
              Reintentar salidas
            </button>
          </div>
        ) : null}
        {!inventario.salidasLoading &&
        !inventario.salidasError &&
        inventario.salidas.length === 0 ? (
          <p className="averias-admin__muted">{AVERIA_MATERIALES_SIN_SALIDAS}</p>
        ) : null}
        {inventario.salidas.length > 0 ? (
          <div className="averias-inventario__table-wrap">
            <table className="averias-inventario__table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Cantidad</th>
                  <th>Fecha</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                {inventario.salidas.map((salida) => (
                  <tr key={salida.id}>
                    <td>{salidaMaterialLabel(salida)}</td>
                    <td>
                      {salida.cantidad}
                      {salida.material?.unidadMedida
                        ? ` ${salida.material.unidadMedida}`
                        : ''}
                    </td>
                    <td>
                      {formatAveriaAdminDateTimeOrUnavailable(
                        salida.fechaMovimiento,
                        AVERIA_UNAVAILABLE_LABEL,
                      )}
                    </td>
                    <td>{salida.observacion ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default AveriaMaterialesSection
