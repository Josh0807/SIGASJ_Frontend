import AveriasAdminAsignacionControls from './AveriasAdminAsignacionControls'
import AveriasAdminGestionControls from './AveriasAdminGestionControls'
import AveriasDetailField from './AveriasDetailField'
import { formatAveriaAdminDateTimeOrUnavailable } from './formatAveriaAdminDate'
import {
  MENSAJE_ATENCION_NO_INICIADA,
  mostrarAvisoPendienteAdmin,
} from '../utils/averiaPendienteAtencion'
import {
  AVERIA_UNAVAILABLE_LABEL,
  getAbonadoRelacionadoLabel,
  getObservacionesLabel,
  getOptionalPersonalLabel,
  type AveriaDetail,
} from './types'

type AveriasAdminDetailViewProps = {
  averia: AveriaDetail
  canEditGestion?: boolean
  canAssignFontanero?: boolean
  onAveriaUpdated?: (averia: AveriaDetail) => void
}

const AveriasAdminDetailView = ({
  averia,
  canEditGestion = false,
  canAssignFontanero = false,
  onAveriaUpdated,
}: AveriasAdminDetailViewProps) => (
  <div className="averias-admin__detail">
    <section className="averias-admin__section" aria-labelledby="averia-reporte-heading">
      <h2 id="averia-reporte-heading">Información del reporte</h2>
      <dl className="averias-admin__fields">
        <AveriasDetailField label="Fecha y hora del reporte">
          {formatAveriaAdminDateTimeOrUnavailable(
            averia.fechaReporte,
            AVERIA_UNAVAILABLE_LABEL,
          )}
        </AveriasDetailField>
      </dl>
    </section>

    <div className="averias-admin__detail-grid">
      <section
        className="averias-admin__section"
        aria-labelledby="averia-reportante-heading"
      >
        <h2 id="averia-reportante-heading">Datos del Reportante</h2>
        <dl className="averias-admin__fields">
          <AveriasDetailField label="Nombre completo">
            {averia.nombreReportante}
          </AveriasDetailField>
          <AveriasDetailField label="Identificación">
            {getOptionalPersonalLabel(averia.identificacionReportante)}
          </AveriasDetailField>
          <AveriasDetailField label="Teléfono">
            {averia.telefonoReportante}
          </AveriasDetailField>
          <AveriasDetailField label="Correo">
            {getOptionalPersonalLabel(averia.correoReportante)}
          </AveriasDetailField>
          <AveriasDetailField label="Abonado relacionado">
            {getAbonadoRelacionadoLabel(averia.idAbonado, averia.abonado)}
          </AveriasDetailField>
        </dl>
      </section>

      <section className="averias-admin__section" aria-labelledby="averia-gestion-heading">
        <h2 id="averia-gestion-heading">Gestión de la avería</h2>
        {canEditGestion ? (
          <AveriasAdminGestionControls
            key={`${averia.id}:${averia.estado}:${averia.prioridad ?? ''}:${averia.tipoAveria ?? ''}:${averia.fontanero?.id ?? ''}`}
            averia={averia}
            canEdit
            onAveriaUpdated={onAveriaUpdated ?? (() => undefined)}
          />
        ) : null}
        <dl className="averias-admin__fields">
          {!canEditGestion ? (
            <AveriasAdminGestionControls
              averia={averia}
              canEdit={false}
              onAveriaUpdated={onAveriaUpdated ?? (() => undefined)}
            />
          ) : null}
          <AveriasDetailField label="Inicio de atención">
            {averia.fechaInicioAtencion
              ? formatAveriaAdminDateTimeOrUnavailable(
                  averia.fechaInicioAtencion,
                  AVERIA_UNAVAILABLE_LABEL,
                )
              : mostrarAvisoPendienteAdmin(
                    String(averia.estado),
                    averia.fontanero != null,
                  )
                ? MENSAJE_ATENCION_NO_INICIADA
                : AVERIA_UNAVAILABLE_LABEL}
          </AveriasDetailField>
          <AveriasDetailField label="Fecha de resolución">
            {formatAveriaAdminDateTimeOrUnavailable(
              averia.fechaResolucion,
              AVERIA_UNAVAILABLE_LABEL,
            )}
          </AveriasDetailField>
        </dl>
      </section>
    </div>

    <section
      className="averias-admin__section"
      aria-labelledby="averia-asignacion-heading"
    >
      <h2 id="averia-asignacion-heading">Asignación de avería</h2>
      <AveriasAdminAsignacionControls
        key={`${averia.id}:${averia.estado}:${averia.fontanero?.id ?? 'none'}:${averia.fechaAsignacion ?? ''}`}
        averia={averia}
        canAssign={canAssignFontanero}
        onAveriaUpdated={onAveriaUpdated ?? (() => undefined)}
      />
    </section>

    <section className="averias-admin__section" aria-labelledby="averia-ubicacion-heading">
      <h2 id="averia-ubicacion-heading">Ubicación de la avería</h2>
      <dl className="averias-admin__fields">
        <AveriasDetailField label="Sector / comunidad">
          {averia.sectorComunidad}
        </AveriasDetailField>
        <AveriasDetailField label="Ubicación" multiline>
          {averia.ubicacion}
        </AveriasDetailField>
        <AveriasDetailField label="Descripción" multiline>
          {averia.descripcion}
        </AveriasDetailField>
      </dl>
    </section>

    <section className="averias-admin__section" aria-labelledby="averia-obs-heading">
      <h2 id="averia-obs-heading">Observaciones</h2>
      {averia.observaciones && averia.observaciones.length > 0 ? (
        <ol className="averias-fontanero__observaciones-list">
          {averia.observaciones.map((item) => (
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
        <p className="averias-admin__prewrap">
          {getObservacionesLabel(averia.observacionesAtencion)}
        </p>
      )}
    </section>
  </div>
)

export default AveriasAdminDetailView
