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
const MODERN_ACTION_CLASS =
  'gallery-admin__button !inline-flex !min-h-12 !items-center !justify-center !rounded-2xl !border-0 !bg-linear-to-r !from-blue-600 !to-sky-500 !px-6 !font-extrabold !text-white !no-underline !shadow-[0_10px_24px_rgba(37,99,235,0.25)] !transition-all !duration-300 hover:!-translate-y-1 hover:!text-white hover:!shadow-[0_15px_30px_rgba(37,99,235,0.35)] active:!translate-y-0 active:!scale-[0.97] disabled:!cursor-not-allowed disabled:!opacity-55 disabled:hover:!translate-y-0'

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
    <div className="averias-inventario__block !mb-6 !rounded-3xl !border !border-blue-100 !bg-white/90 !p-6 !shadow-[0_8px_24px_rgba(30,90,156,0.08)]">
      <h3 className="!mb-5 !text-xl !font-black !tracking-[-0.02em] !text-[#073b73]">Catálogo y existencias</h3>
      <form className="averias-inventario__search !mb-6 !grid !min-w-0 !gap-3 md:!grid-cols-[minmax(0,1fr)_auto] md:!items-end" onSubmit={searchCatalog}>
        <label className="!grid !min-w-0 !gap-2 !text-xs !font-extrabold !uppercase !tracking-[0.08em] !text-blue-600">
          Buscar material
          <input
            className="!box-border !min-h-14 !w-full !min-w-0 !rounded-2xl !border !border-blue-200 !bg-white !px-5 !text-base !font-semibold !normal-case !tracking-normal !text-[#073b73] !shadow-sm !outline-none !transition-all placeholder:!font-medium placeholder:!text-slate-400 hover:!border-blue-300 focus:!border-blue-500 focus:!ring-4 focus:!ring-blue-100"
            type="search"
            value={nombreInput}
            onChange={(event) => setNombreInput(event.target.value)}
            placeholder="Nombre del material"
          />
        </label>
        <button
          className={MODERN_ACTION_CLASS}
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
        <div className="averias-inventario__table-wrap !overflow-x-auto !rounded-2xl !border !border-blue-100 !bg-white">
          <table className="averias-inventario__table !w-full !border-collapse">
            <thead className="!bg-linear-to-r !from-blue-50 !to-sky-50">
              <tr className="!border-b !border-blue-100">
                <th className="!px-4 !py-4 !text-left !text-xs !font-extrabold !uppercase !tracking-[0.06em] !text-blue-700">Material</th>
                <th className="!px-4 !py-4 !text-left !text-xs !font-extrabold !uppercase !tracking-[0.06em] !text-blue-700">Categoría</th>
                <th className="!px-4 !py-4 !text-left !text-xs !font-extrabold !uppercase !tracking-[0.06em] !text-blue-700">Unidad</th>
                <th className="!px-4 !py-4 !text-left !text-xs !font-extrabold !uppercase !tracking-[0.06em] !text-blue-700">Stock actual</th>
                <th className="!px-4 !py-4 !text-left !text-xs !font-extrabold !uppercase !tracking-[0.06em] !text-blue-700">Disponibilidad</th>
              </tr>
            </thead>
            <tbody>
              {catalog.result.data.map((material) => {
                const sinExistencias = material.stockActual <= 0
                return (
                  <tr className="!border-b !border-slate-100 !transition-colors last:!border-0 hover:!bg-blue-50/50" key={material.id}>
                    <td className="!px-4 !py-4 !font-bold !text-[#073b73]">{material.nombre}</td>
                    <td className="!px-4 !py-4 !text-slate-600">{material.categoria?.nombre ?? '—'}</td>
                    <td className="!px-4 !py-4 !text-slate-600">{material.unidadMedida}</td>
                    <td className="!px-4 !py-4 !font-bold !text-[#073b73]">{material.stockActual}</td>
                    <td
                      className={`!px-4 !py-4 !font-bold ${
                        sinExistencias
                          ? 'averias-inventario__stock--zero !text-rose-600'
                          : '!text-emerald-700'
                      }`}
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
            className={MODERN_ACTION_CLASS}
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
            className={MODERN_ACTION_CLASS}
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
        isFontanero
          ? 'averias-fontanero__materiales averia-hierarchy-card !w-full'
          : ''
      }`}
      aria-labelledby={headingId}
    >
      <div className={isFontanero ? 'averias-inventario__header !mb-6 !grid !grid-cols-1 !gap-0 !border-b-0 !pb-0' : 'averias-inventario__header'}>
        <h2 className={isFontanero ? 'averia-hierarchy-card__title' : undefined} id={headingId}>{title}</h2>
        {!isFontanero ? (
        <div className="averias-inventario__toolbar">
          {canRegistrarSalida ? (
            <Link className={MODERN_ACTION_CLASS} to={salidaHref}>
              {AVERIA_MATERIALES_SALIDA_LABEL}
            </Link>
          ) : null}
          {canRevisarSolicitudes ? (
            <Link className={MODERN_ACTION_CLASS} to={solicitudesAdminRevisionHref()}>
              Revisar solicitudes
            </Link>
          ) : null}
        </div>
        ) : null}
      </div>

      {isFontanero ? <AveriaCatalogoMateriales /> : null}

      <div className={isFontanero ? 'averias-inventario__columns !grid !gap-5 lg:!grid-cols-2' : 'averias-inventario__columns'}>
      <div className={isFontanero ? 'averias-inventario__block !rounded-2xl !border !border-blue-100 !bg-white/90 !p-5 !shadow-[0_7px_18px_rgba(30,90,156,0.07)]' : 'averias-inventario__block'}>
        <h3>Solicitudes</h3>
        {!includeSolicitudes ? (
          <p className="averias-admin__muted !rounded-2xl !border !border-dashed !border-blue-200 !bg-blue-50/60 !p-5 !text-center !font-medium !text-slate-500">{AVERIA_MATERIALES_SECRETARIA_SOLICITUDES}</p>
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
              className={MODERN_ACTION_CLASS}
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
          <p className="averias-admin__muted !rounded-2xl !border !border-dashed !border-blue-200 !bg-blue-50/60 !p-5 !text-center !font-medium !text-slate-500">{AVERIA_MATERIALES_SIN_SOLICITUDES}</p>
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
                    className={MODERN_ACTION_CLASS}
                    to={solicitudFontaneroDetalleHref(solicitud.id)}
                  >
                    Ver solicitud
                  </Link>
                ) : null}
                {canRevisarSolicitudes ? (
                  <Link
                    className={MODERN_ACTION_CLASS}
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

      <div className={isFontanero ? 'averias-inventario__block !rounded-2xl !border !border-blue-100 !bg-white/90 !p-5 !shadow-[0_7px_18px_rgba(30,90,156,0.07)]' : 'averias-inventario__block'}>
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
              className={MODERN_ACTION_CLASS}
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
          <p className="averias-admin__muted !rounded-2xl !border !border-dashed !border-blue-200 !bg-blue-50/60 !p-5 !text-center !font-medium !text-slate-500">{AVERIA_MATERIALES_SIN_SALIDAS}</p>
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
      </div>
      {isFontanero ? (
        <div className="!mt-6 !flex !flex-wrap !justify-end !gap-3 !border-t !border-blue-100 !pt-6">
          <Link className={MODERN_ACTION_CLASS} to={solicitarHref}>
            {AVERIA_MATERIALES_SOLICITAR_LABEL}
          </Link>
          {canRegistrarSalida ? (
            <Link className={MODERN_ACTION_CLASS} to={salidaHref}>
              {AVERIA_MATERIALES_SALIDA_LABEL}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export default AveriaMaterialesSection
