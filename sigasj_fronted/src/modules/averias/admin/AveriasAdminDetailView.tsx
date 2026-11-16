import {
  IconCalendar,
  IconClipboardList,
  IconId,
  IconInfoCircle,
  IconMail,
  IconMapPin,
  IconMessageCircle,
  IconPhone,
  IconUser,
  IconUserPlus,
} from '@tabler/icons-react'
import AveriasAdminAsignacionControls from './AveriasAdminAsignacionControls'
import AveriasAdminEventosHistorial from './AveriasAdminEventosHistorial'
import AveriasAdminGestionControls from './AveriasAdminGestionControls'
import AveriasDetailField from './AveriasDetailField'
import { formatAveriaAdminDateTimeOrUnavailable } from './formatAveriaAdminDate'
import {
  AVERIA_UNAVAILABLE_LABEL,
  getObservacionesLabel,
  getOptionalPersonalLabel,
  type AveriaDetail,
} from './types'

type AveriasAdminDetailViewProps = {
  averia: AveriaDetail
  canAssignFontanero?: boolean
  onAveriaUpdated?: (averia: AveriaDetail) => void
  onUnauthorized?: () => void
  onForbidden?: () => void
}

const AveriasAdminDetailView = ({
  averia,
  canAssignFontanero = false,
  onAveriaUpdated,
  onUnauthorized,
  onForbidden,
}: AveriasAdminDetailViewProps) => {
  const hasObservaciones =
    Array.isArray(averia.observaciones) && averia.observaciones.length > 0

  return (
    <div className="averias-admin__detail">
      <div className="averias-admin__detail-grid">
        <section
          className="averias-admin__section averias-admin__section--ficha"
          aria-labelledby="averia-reportante-heading"
        >
          <h2 id="averia-reportante-heading">
            <span className="averias-admin__section-icon" aria-hidden="true">
              <IconUser size={18} />
            </span>
            Datos del reportante
          </h2>
          <dl className="averias-admin__fields averias-admin__ficha-filas">
            <AveriasDetailField
              label="Nombre completo"
              icon={<IconUser size={14} stroke={1.75} />}
            >
              {averia.nombreReportante}
            </AveriasDetailField>
            <AveriasDetailField
              label="Identificación"
              icon={<IconId size={14} stroke={1.75} />}
            >
              {getOptionalPersonalLabel(averia.identificacionReportante)}
            </AveriasDetailField>
            <AveriasDetailField
              label="Teléfono"
              icon={<IconPhone size={14} stroke={1.75} />}
            >
              {averia.telefonoReportante}
            </AveriasDetailField>
            <AveriasDetailField
              label="Fecha y hora del reporte"
              icon={<IconCalendar size={14} stroke={1.75} />}
            >
              {formatAveriaAdminDateTimeOrUnavailable(
                averia.fechaReporte,
                AVERIA_UNAVAILABLE_LABEL,
              )}
            </AveriasDetailField>
            <AveriasDetailField
              label="Correo electrónico"
              icon={<IconMail size={14} stroke={1.75} />}
              multiline
            >
              <span
                className="averias-admin__ficha-correo"
                title={getOptionalPersonalLabel(averia.correoReportante)}
              >
                {getOptionalPersonalLabel(averia.correoReportante)}
              </span>
            </AveriasDetailField>
          </dl>
        </section>

        <section
          className="averias-admin__section averias-admin__section--gestion"
          aria-labelledby="averia-gestion-heading"
        >
          <h2 id="averia-gestion-heading">
            <span className="averias-admin__section-icon" aria-hidden="true">
              <IconClipboardList size={18} />
            </span>
            Gestión de la avería
          </h2>
          <AveriasAdminGestionControls
            key={`${averia.id}:${averia.estado}:${averia.prioridad ?? ''}:${averia.tipoAveria ?? ''}:${averia.fontanero?.id ?? ''}:${averia.fechaInicioAtencion ?? ''}:${averia.fechaResolucion ?? ''}`}
            averia={averia}
          />
        </section>

        <section
          className="averias-admin__section averias-admin__section--ubicacion"
          aria-labelledby="averia-ubicacion-heading"
        >
          <h2 id="averia-ubicacion-heading">
            <span className="averias-admin__section-icon" aria-hidden="true">
              <IconMapPin size={18} />
            </span>
            Ubicación y descripción
          </h2>
          <dl className="averias-admin__fields averias-admin__fields--ubicacion">
            <AveriasDetailField
              label="Sector / comunidad"
              icon={<IconMapPin size={14} stroke={1.75} />}
            >
              {averia.sectorComunidad}
            </AveriasDetailField>
            <AveriasDetailField
              label="Ubicación específica"
              icon={<IconMapPin size={14} stroke={1.75} />}
            >
              {averia.ubicacion}
            </AveriasDetailField>
            <AveriasDetailField
              label="Descripción"
              multiline
              icon={<IconClipboardList size={14} stroke={1.75} />}
            >
              <span className="averias-admin__descripcion-destacada">
                {averia.descripcion}
              </span>
            </AveriasDetailField>
          </dl>
        </section>

        <section
          className="averias-admin__section averias-admin__section--asignacion"
          aria-labelledby="averia-asignacion-heading"
        >
          <h2 id="averia-asignacion-heading">
            <span className="averias-admin__section-icon" aria-hidden="true">
              <IconUserPlus size={18} />
            </span>
            Asignación de avería
          </h2>
          <AveriasAdminAsignacionControls
            key={`${averia.id}:${averia.estado}:${averia.fontanero?.id ?? 'none'}:${averia.fechaAsignacion ?? ''}`}
            averia={averia}
            canAssign={canAssignFontanero}
            onAveriaUpdated={onAveriaUpdated ?? (() => undefined)}
          />
        </section>
      </div>

      <section
        className={`averias-admin__section averias-admin__section--observaciones${
          hasObservaciones ? '' : ' is-empty'
        }`}
        aria-labelledby="averia-obs-heading"
      >
        <h2 id="averia-obs-heading">
          <span className="averias-admin__section-icon" aria-hidden="true">
            <IconMessageCircle size={18} />
          </span>
          Observaciones y seguimiento
        </h2>
        {hasObservaciones ? (
          <ol className="averias-fontanero__observaciones-list">
            {averia.observaciones!.map((item) => (
              <li key={item.id}>
                <p className="averias-admin__prewrap">{item.observacion}</p>
                <p className="averias-admin__muted">
                  {item.autor.nombre}
                  {item.fechaCreacion
                    ? ` · ${formatAveriaAdminDateTimeOrUnavailable(
                        item.fechaCreacion,
                        AVERIA_UNAVAILABLE_LABEL,
                      )}`
                    : ''}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="averias-admin__empty-note averias-admin__empty-note--banner">
            <IconInfoCircle size={18} aria-hidden="true" />
            <span>{getObservacionesLabel(averia.observacionesAtencion)}</span>
          </p>
        )}
      </section>

      <AveriasAdminEventosHistorial
        averiaId={averia.id}
        onUnauthorized={onUnauthorized}
        onForbidden={onForbidden}
      />
    </div>
  )
}

export default AveriasAdminDetailView
