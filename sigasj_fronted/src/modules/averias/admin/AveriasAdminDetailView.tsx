import AveriaStatusBadge from './AveriaStatusBadge'
import AveriasDetailField from './AveriasDetailField'
import { formatAveriaAdminDateTimeOrUnavailable } from './formatAveriaAdminDate'
import {
  AVERIA_UNAVAILABLE_LABEL,
  getAbonadoRelacionadoLabel,
  getFontaneroLabel,
  getObservacionesLabel,
  getOptionalPersonalLabel,
  getPrioridadLabel,
  getTipoAveriaDetailLabel,
  type AveriaDetail,
} from './types'

type AveriasAdminDetailViewProps = {
  averia: AveriaDetail
}

const AveriasAdminDetailView = ({ averia }: AveriasAdminDetailViewProps) => (
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
        <dl className="averias-admin__fields">
          <AveriasDetailField label="Estado">
            <AveriaStatusBadge estado={averia.estado} />
          </AveriasDetailField>
          <AveriasDetailField label="Fontanero asignado">
            {getFontaneroLabel(averia.fontanero)}
          </AveriasDetailField>
          <AveriasDetailField label="Tipo de avería">
            {getTipoAveriaDetailLabel(averia.tipoAveria)}
          </AveriasDetailField>
          <AveriasDetailField label="Prioridad">
            {getPrioridadLabel(averia.prioridad)}
          </AveriasDetailField>
          <AveriasDetailField label="Fecha de asignación">
            {formatAveriaAdminDateTimeOrUnavailable(
              averia.fechaAsignacion,
              AVERIA_UNAVAILABLE_LABEL,
            )}
          </AveriasDetailField>
          <AveriasDetailField label="Inicio de atención">
            {formatAveriaAdminDateTimeOrUnavailable(
              averia.fechaInicioAtencion,
              AVERIA_UNAVAILABLE_LABEL,
            )}
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
      <p className="averias-admin__prewrap">
        {getObservacionesLabel(averia.observacionesAtencion)}
      </p>
    </section>
  </div>
)

export default AveriasAdminDetailView
