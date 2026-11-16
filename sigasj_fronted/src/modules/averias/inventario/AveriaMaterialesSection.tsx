import { useState, type FormEvent } from 'react'
import { IconPackage, IconPlus, IconSearch } from '@tabler/icons-react'
import ActivityFeedback from '../../actividades-fontanero/components/ActivityFeedback'
import { Alert } from '../../../shared/ui/Alert'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatAveriaAdminDateTimeOrUnavailable } from '../admin/formatAveriaAdminDate'
import { AVERIA_UNAVAILABLE_LABEL } from '../admin/types'
import { materialDisplayLabel } from '../../inventario/materialDisplayLabel'
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
const labelClass =
  'text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted'
const fieldClass =
  'min-h-11 w-full rounded-xl border border-sigasj-border bg-white px-3.5 text-[0.95rem] font-semibold text-sigasj-ink outline-none transition focus:border-sigasj-primary focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-sigasj-primary)_22%,transparent)]'

type CatalogProps = {
  canRegistrarSalida: boolean
  salidaBaseHref: (idMaterial?: number) => string
}

const AveriaCatalogoMateriales = ({
  canRegistrarSalida,
  salidaBaseHref,
}: CatalogProps) => {
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
    <div className="averias-inventario__block grid gap-3.5 rounded-2xl border border-sigasj-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="m-0 text-base font-extrabold tracking-tight text-sigasj-ink">
          Catálogo y existencias
        </h3>
        <Badge tone="info">
          {catalog.result.total} material
          {catalog.result.total === 1 ? '' : 'es'}
        </Badge>
      </div>

      <form
        className="averias-inventario__search flex flex-wrap items-end gap-3"
        onSubmit={searchCatalog}
      >
        <label className={`grid min-w-0 flex-1 gap-1.5 ${labelClass}`}>
          Buscar material
          <input
            className={`${fieldClass} !normal-case !tracking-normal`}
            type="search"
            value={nombreInput}
            onChange={(event) => setNombreInput(event.target.value)}
            placeholder="Nombre del material"
          />
        </label>
        <Button
          type="button"
          size="sm"
          leftIcon={<IconSearch size={16} aria-hidden="true" />}
          onClick={() => {
            setCatalogPage(1)
            setNombreQuery(nombreInput.trim())
          }}
        >
          Buscar
        </Button>
      </form>

      {catalog.loading ? (
        <p className="averias-admin__muted m-0" role="status">
          Consultando materiales…
        </p>
      ) : null}
      {catalog.error ? (
        <ActivityFeedback variant="error" message={catalog.error} />
      ) : null}
      {!catalog.loading && !catalog.error && catalog.result.data.length === 0 ? (
        <p className="averias-admin__muted m-0">{AVERIA_MATERIALES_SIN_CATALOGO}</p>
      ) : null}

      {!catalog.loading && catalog.result.data.length > 0 ? (
        <div className="averias-inventario__table-wrap overflow-x-auto rounded-xl border border-sigasj-border">
          <table className="averias-inventario__table w-full border-collapse text-left">
            <thead className="bg-sigasj-surface-soft text-[0.68rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted">
              <tr>
                <th className="px-3.5 py-3">Material</th>
                <th className="px-3.5 py-3">Categoría</th>
                <th className="px-3.5 py-3">Unidad</th>
                <th className="px-3.5 py-3">Stock actual</th>
                <th className="px-3.5 py-3">Disponibilidad</th>
                {canRegistrarSalida ? (
                  <th className="px-3.5 py-3 text-right">Acción</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {catalog.result.data.map((material) => {
                const sinExistencias = material.stockActual <= 0
                const nombre = materialDisplayLabel(material.nombre, material.nombre)
                const categoria = materialDisplayLabel(
                  material.categoria?.nombre,
                  '—',
                )
                return (
                  <tr
                    className="border-t border-sigasj-border transition-colors hover:bg-[color-mix(in_srgb,var(--color-sigasj-ice)_55%,white)]"
                    key={material.id}
                  >
                    <td className="px-3.5 py-3 font-bold text-sigasj-ink">
                      {nombre}
                    </td>
                    <td className="px-3.5 py-3 text-sm font-semibold text-sigasj-muted">
                      {categoria}
                    </td>
                    <td className="px-3.5 py-3 text-sm font-semibold text-sigasj-muted">
                      {material.unidadMedida}
                    </td>
                    <td className="px-3.5 py-3 font-bold tabular-nums text-sigasj-ink">
                      {material.stockActual}
                    </td>
                    <td
                      className={`px-3.5 py-3 font-bold ${
                        sinExistencias
                          ? 'averias-inventario__stock--zero text-sigasj-error'
                          : 'text-sigasj-success'
                      }`}
                    >
                      {sinExistencias
                        ? AVERIA_MATERIALES_SIN_EXISTENCIAS
                        : 'Disponible'}
                    </td>
                    {canRegistrarSalida ? (
                      <td className="px-3.5 py-3 text-right">
                        {sinExistencias ? (
                          <span className="text-sm font-semibold text-sigasj-muted">
                            —
                          </span>
                        ) : (
                          <Button
                            to={salidaBaseHref(material.id)}
                            size="sm"
                            variant="secondary"
                          >
                            Usar en salida
                          </Button>
                        )}
                      </td>
                    ) : null}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {!catalog.loading && catalog.result.totalPages > 1 ? (
        <div className="averias-inventario__pager flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={catalogPage <= 1}
            onClick={() => setCatalogPage((page) => Math.max(1, page - 1))}
          >
            Anterior
          </Button>
          <span className="px-1 text-sm font-semibold text-sigasj-muted">
            Página {catalog.result.page} de {catalog.result.totalPages}
          </span>
          <Button
            type="button"
            size="sm"
            disabled={catalogPage >= catalog.result.totalPages}
            onClick={() =>
              setCatalogPage((page) =>
                Math.min(catalog.result.totalPages, page + 1),
              )
            }
          >
            Siguiente
          </Button>
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
) =>
  materialDisplayLabel(
    detalle.material?.nombre,
    `Material #${detalle.idMaterial}`,
  )

const salidaMaterialLabel = (salida: SalidaAveria) =>
  materialDisplayLabel(
    salida.material?.nombre,
    `Material #${salida.idMaterial}`,
  )

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
  const salidaHrefFor = (idMaterial?: number) =>
    salidaDesdeAveriaHref(averiaId, returnPath, idMaterial)

  return (
    <Card
      as="section"
      padded
      className={`averias-admin__section averias-inventario !grid !gap-4 !p-4 sm:!p-5 ${
        isFontanero ? 'averias-fontanero__materiales averia-hierarchy-card' : ''
      }`}
      aria-labelledby={headingId}
    >
      <div className="averias-inventario__header flex flex-wrap items-start justify-between gap-3 border-b border-sigasj-border pb-3">
        <h2
          className="averia-hierarchy-card__title m-0 flex items-center gap-2.5 text-[1.05rem] font-extrabold tracking-tight text-sigasj-ink"
          id={headingId}
        >
          <span className="grid size-8 place-items-center rounded-xl bg-sigasj-surface-soft text-sigasj-primary">
            <IconPackage size={18} aria-hidden="true" />
          </span>
          {title}
        </h2>
        <div className="averias-inventario__toolbar flex flex-wrap gap-2">
          {isFontanero ? (
            <Button
              to={solicitarHref}
              size="sm"
              leftIcon={<IconPlus size={16} aria-hidden="true" />}
            >
              {AVERIA_MATERIALES_SOLICITAR_LABEL}
            </Button>
          ) : null}
          {canRegistrarSalida ? (
            <Button to={salidaHrefFor()} size="sm" variant="secondary">
              {AVERIA_MATERIALES_SALIDA_LABEL}
            </Button>
          ) : null}
          {canRevisarSolicitudes ? (
            <Button to={solicitudesAdminRevisionHref()} size="sm" variant="secondary">
              Revisar solicitudes
            </Button>
          ) : null}
        </div>
      </div>

      {isFontanero && !canRegistrarSalida ? (
        <Alert tone="info">
          Para descontar stock con «Registrar salida», inicie la atención de la
          avería. Mientras tanto puede consultar existencias y solicitar
          materiales.
        </Alert>
      ) : null}

      {isFontanero ? (
        <AveriaCatalogoMateriales
          canRegistrarSalida={canRegistrarSalida}
          salidaBaseHref={salidaHrefFor}
        />
      ) : null}

      <div
        className={
          isFontanero
            ? 'averias-inventario__columns grid gap-3 lg:grid-cols-2'
            : 'averias-inventario__columns grid gap-3'
        }
      >
        <div className="averias-inventario__block grid gap-3 rounded-2xl border border-sigasj-border bg-white p-4">
          <h3 className="m-0 text-base font-extrabold text-sigasj-ink">
            Solicitudes
          </h3>
          {!includeSolicitudes ? (
            <p className="averias-admin__muted m-0 rounded-xl border border-dashed border-sigasj-border bg-sigasj-surface-soft p-4 text-center text-sm">
              {AVERIA_MATERIALES_SECRETARIA_SOLICITUDES}
            </p>
          ) : null}
          {includeSolicitudes && inventario.solicitudesLoading ? (
            <p className="averias-admin__muted m-0" role="status">
              Consultando solicitudes…
            </p>
          ) : null}
          {includeSolicitudes && inventario.solicitudesError ? (
            <div className="grid gap-2">
              <ActivityFeedback
                variant="error"
                message={inventario.solicitudesError}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="justify-self-start"
                onClick={inventario.refetch}
              >
                Reintentar solicitudes
              </Button>
            </div>
          ) : null}
          {includeSolicitudes &&
          !inventario.solicitudesLoading &&
          !inventario.solicitudesError &&
          inventario.solicitudes.length === 0 ? (
            <p className="averias-admin__muted m-0 rounded-xl border border-dashed border-sigasj-border bg-sigasj-surface-soft p-4 text-center text-sm">
              {AVERIA_MATERIALES_SIN_SOLICITUDES}
            </p>
          ) : null}
          {includeSolicitudes && inventario.solicitudes.length > 0 ? (
            <ul className="averias-inventario__list m-0 grid list-none gap-3 p-0">
              {inventario.solicitudes.map((solicitud) => (
                <li
                  key={solicitud.id}
                  className="grid gap-2 rounded-xl border border-sigasj-border bg-sigasj-surface-soft/60 p-3.5"
                >
                  <p className="m-0 text-sm font-semibold text-sigasj-ink">
                    <strong>{solicitud.codigo}</strong>
                    {' · '}
                    {formatSolicitudStatus(solicitud.estado)}
                    {' · '}
                    {solicitud.fechaSolicitud
                      ? formatSolicitudDate(solicitud.fechaSolicitud)
                      : AVERIA_UNAVAILABLE_LABEL}
                  </p>
                  {solicitud.observacion ? (
                    <p className="averias-admin__prewrap m-0 text-sm text-sigasj-muted">
                      {solicitud.observacion}
                    </p>
                  ) : null}
                  {solicitud.detalles && solicitud.detalles.length > 0 ? (
                    <ul className="m-0 grid list-disc gap-1 pl-5 text-sm text-sigasj-ink">
                      {solicitud.detalles.map((detalle) => (
                        <li key={detalle.id}>
                          {materialLabel(detalle)}: {detalle.cantidad}
                          {detalle.material?.unidadMedida
                            ? ` ${detalle.material.unidadMedida}`
                            : ''}
                          {detalle.observacion
                            ? ` · ${detalle.observacion}`
                            : ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="averias-admin__muted m-0 text-sm">
                      {solicitud.cantidadMateriales
                        ? `${solicitud.cantidadMateriales} material(es) solicitados`
                        : 'Sin detalle de materiales'}
                    </p>
                  )}
                  {isFontanero ? (
                    <Button
                      to={solicitudFontaneroDetalleHref(solicitud.id)}
                      size="sm"
                      variant="secondary"
                      className="justify-self-start"
                    >
                      Ver solicitud
                    </Button>
                  ) : null}
                  {canRevisarSolicitudes ? (
                    <Button
                      to={solicitudAdminRevisionHref(solicitud.id)}
                      size="sm"
                      variant="secondary"
                      className="justify-self-start"
                    >
                      Abrir en Inventario
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="averias-inventario__block grid gap-3 rounded-2xl border border-sigasj-border bg-white p-4">
          <h3 className="m-0 text-base font-extrabold text-sigasj-ink">
            Salidas
          </h3>
          {inventario.salidasLoading ? (
            <p className="averias-admin__muted m-0" role="status">
              Consultando salidas…
            </p>
          ) : null}
          {inventario.salidasError ? (
            <div className="grid gap-2">
              <ActivityFeedback
                variant="error"
                message={inventario.salidasError}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="justify-self-start"
                onClick={() => {
                  inventario.refetch()
                }}
              >
                Reintentar salidas
              </Button>
            </div>
          ) : null}
          {!inventario.salidasLoading &&
          !inventario.salidasError &&
          inventario.salidas.length === 0 ? (
            <p className="averias-admin__muted m-0 rounded-xl border border-dashed border-sigasj-border bg-sigasj-surface-soft p-4 text-center text-sm">
              {AVERIA_MATERIALES_SIN_SALIDAS}
            </p>
          ) : null}
          {inventario.salidas.length > 0 ? (
            <div className="averias-inventario__table-wrap overflow-x-auto rounded-xl border border-sigasj-border">
              <table className="averias-inventario__table w-full border-collapse text-left">
                <thead className="bg-sigasj-surface-soft text-[0.68rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted">
                  <tr>
                    <th className="px-3.5 py-3">Material</th>
                    <th className="px-3.5 py-3">Cantidad</th>
                    <th className="px-3.5 py-3">Fecha</th>
                    <th className="px-3.5 py-3">Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {inventario.salidas.map((salida) => (
                    <tr
                      key={salida.id}
                      className="border-t border-sigasj-border"
                    >
                      <td className="px-3.5 py-3 font-bold text-sigasj-ink">
                        {salidaMaterialLabel(salida)}
                      </td>
                      <td className="px-3.5 py-3 text-sm font-semibold text-sigasj-muted">
                        {salida.cantidad}
                        {salida.material?.unidadMedida
                          ? ` ${salida.material.unidadMedida}`
                          : ''}
                      </td>
                      <td className="px-3.5 py-3 text-sm font-semibold text-sigasj-muted">
                        {formatAveriaAdminDateTimeOrUnavailable(
                          salida.fechaMovimiento,
                          AVERIA_UNAVAILABLE_LABEL,
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-sm text-sigasj-ink">
                        {salida.observacion ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

export default AveriaMaterialesSection
