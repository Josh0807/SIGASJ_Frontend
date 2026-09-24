import { useRef, useState } from 'react'
import ActivityFeedback from '../../actividades-fontanero/components/ActivityFeedback'
import { getHttpErrorStatus } from '../../actividades-fontanero/utils/httpErrorStatus'
import AveriaStatusBadge from '../admin/AveriaStatusBadge'
import AveriasDetailField from '../admin/AveriasDetailField'
import { formatAveriaAdminDateTimeOrUnavailable } from '../admin/formatAveriaAdminDate'
import { AVERIA_UNAVAILABLE_LABEL } from '../admin/types'
import { iniciarFontaneroAtencion } from '../services/averiasFontaneroApi'
import {
  MENSAJE_PENDIENTE_HORARIO_FONTANERO,
  mostrarAvisoHorarioFontanero,
  parseInicioAtencionError,
} from '../utils/averiaPendienteAtencion'
import AveriasFontaneroClasificacionForm from './AveriasFontaneroClasificacionForm'
import AveriasFontaneroObservacionForm from './AveriasFontaneroObservacionForm'
import AveriasFontaneroResolverDialog from './AveriasFontaneroResolverDialog'
import AveriaMaterialesSection from '../inventario/AveriaMaterialesSection'
import {
  puedeCalificarAveria,
  puedeIntentarIniciarAtencionAveria,
  puedeMarcarAveriaResuelta,
  puedeRegistrarObservacionAveria,
} from './fontaneroAveriaAcciones'
import {
  getFontaneroPrioridadLabel,
  getFontaneroPrioridadModifier,
  getFontaneroTipoLabel,
  sortObservacionesAtencion,
} from './fontaneroAveriaPresentation'
import {
  AVERIAS_FONTANERO_ATENCION_NO_INICIADA,
  AVERIAS_FONTANERO_INICIAR_ERROR,
  AVERIAS_FONTANERO_INICIAR_FORBIDDEN,
  AVERIAS_FONTANERO_INICIAR_LABEL,
  AVERIAS_FONTANERO_INICIAR_LOADING,
  AVERIAS_FONTANERO_INICIAR_SUCCESS,
  AVERIAS_FONTANERO_NO_ACTIONS,
  AVERIAS_FONTANERO_OBSERVACIONES_LISTA_VACIA,
  AVERIAS_FONTANERO_OBSERVACIONES_TITULO,
  AVERIAS_FONTANERO_RESOLVER_LABEL,
  type AveriaFontaneroDetail,
  type AveriaObservacionItem,
} from './types'

type AveriasFontaneroDetailViewProps = {
  averia: AveriaFontaneroDetail
  successMessage?: string | null
  onResolved: (averia: AveriaFontaneroDetail, message: string) => void
  onAtencionIniciada: (averia: AveriaFontaneroDetail, message: string) => void
  onClasificada: (averia: AveriaFontaneroDetail, message: string) => void
  onObservacionCreated: (observacion: AveriaObservacionItem) => void
  onUnauthorized: () => void
}

const AveriasFontaneroDetailView = ({
  averia,
  successMessage,
  onResolved,
  onAtencionIniciada,
  onClasificada,
  onObservacionCreated,
  onUnauthorized,
}: AveriasFontaneroDetailViewProps) => {
  const prioridadLabel = getFontaneroPrioridadLabel(averia.prioridad)
  const prioridadModifier = getFontaneroPrioridadModifier(averia.prioridad)
  const estado = String(averia.estado)
  const puedeResolver = puedeMarcarAveriaResuelta(estado)
  const puedeIniciar = puedeIntentarIniciarAtencionAveria(estado)
  const puedeRegistrar = puedeRegistrarObservacionAveria(estado)
  const puedeCalificar = puedeCalificarAveria(estado)
  const avisoHorario = mostrarAvisoHorarioFontanero(estado)
  const [resolverOpen, setResolverOpen] = useState(false)
  const [iniciarError, setIniciarError] = useState<string | null>(null)
  const [iniciando, setIniciando] = useState(false)
  const iniciandoRef = useRef(false)
  const observaciones = sortObservacionesAtencion(averia.observaciones ?? [])

  return (
    <div className="averias-admin__detail averias-fontanero__detail">
      {successMessage ? (
        <ActivityFeedback variant="success" message={successMessage} />
      ) : null}

      <section
        className="averias-admin__section averias-fontanero__ubicacion"
        aria-labelledby="averia-fontanero-ubicacion-heading"
      >
        <h2 id="averia-fontanero-ubicacion-heading">Ubicación de la avería</h2>
        <dl className="averias-admin__fields">
          <AveriasDetailField label="Sector / comunidad">
            {averia.sectorComunidad}
          </AveriasDetailField>
          <AveriasDetailField label="Dirección" multiline>
            {averia.ubicacion}
          </AveriasDetailField>
          <AveriasDetailField label="Descripción del problema" multiline>
            {averia.descripcion}
          </AveriasDetailField>
        </dl>
      </section>

      <section
        className="averias-admin__section averias-fontanero__gestion"
        aria-labelledby="averia-fontanero-gestion-heading"
      >
        <h2 id="averia-fontanero-gestion-heading">Gestión de la avería</h2>
        <dl className="averias-admin__fields">
          <AveriasDetailField label="Tipo">
            {getFontaneroTipoLabel(averia.tipoAveria)}
          </AveriasDetailField>
          <AveriasDetailField label="Prioridad">
            <span
              className={
                prioridadModifier
                  ? `averias-admin__badge averias-admin__badge--prioridad ${prioridadModifier}`
                  : undefined
              }
            >
              {prioridadLabel}
            </span>
          </AveriasDetailField>
          <AveriasDetailField label="Estado">
            <AveriaStatusBadge estado={averia.estado} />
            {avisoHorario ? (
              <p className="averias-admin__horario-hint" role="status">
                {MENSAJE_PENDIENTE_HORARIO_FONTANERO}
              </p>
            ) : (
              <p className="averias-admin__hint">
                Usted actualiza el estado al atender o resolver esta avería.
              </p>
            )}
          </AveriasDetailField>
          <AveriasDetailField label="Inicio de atención">
            {averia.fechaInicioAtencion
              ? formatAveriaAdminDateTimeOrUnavailable(
                  averia.fechaInicioAtencion,
                  AVERIA_UNAVAILABLE_LABEL,
                )
              : AVERIAS_FONTANERO_ATENCION_NO_INICIADA}
          </AveriasDetailField>
          <AveriasDetailField label="Fecha de resolución">
            {formatAveriaAdminDateTimeOrUnavailable(
              averia.fechaResolucion,
              AVERIA_UNAVAILABLE_LABEL,
            )}
          </AveriasDetailField>
        </dl>
        {puedeCalificar ? (
          <AveriasFontaneroClasificacionForm
            averia={averia}
            onUpdated={onClasificada}
            onUnauthorized={onUnauthorized}
          />
        ) : null}
        <div className="averias-fontanero__acciones">
          <p className="averias-admin__muted">Acciones disponibles</p>
          {iniciarError ? (
            <ActivityFeedback variant="error" message={iniciarError} />
          ) : null}
          {puedeIniciar ? (
            <button
              className="gallery-admin__button"
              type="button"
              disabled={iniciando}
              aria-busy={iniciando}
              onClick={() => {
                if (iniciandoRef.current) {
                  return
                }
                iniciandoRef.current = true
                setIniciando(true)
                setIniciarError(null)
                void iniciarFontaneroAtencion(averia.id)
                  .then((updated) => {
                    onAtencionIniciada(updated, AVERIAS_FONTANERO_INICIAR_SUCCESS)
                  })
                  .catch((error: unknown) => {
                    const status = getHttpErrorStatus(error)
                    if (status === 401) {
                      onUnauthorized()
                      return
                    }
                    if (status === 403) {
                      setIniciarError(AVERIAS_FONTANERO_INICIAR_FORBIDDEN)
                      return
                    }
                    setIniciarError(
                      parseInicioAtencionError(
                        error,
                        AVERIAS_FONTANERO_INICIAR_ERROR,
                      ),
                    )
                  })
                  .finally(() => {
                    iniciandoRef.current = false
                    setIniciando(false)
                  })
              }}
            >
              {iniciando
                ? AVERIAS_FONTANERO_INICIAR_LOADING
                : AVERIAS_FONTANERO_INICIAR_LABEL}
            </button>
          ) : null}
          {puedeResolver ? (
            <button
              className="gallery-admin__button"
              type="button"
              onClick={() => setResolverOpen(true)}
            >
              {AVERIAS_FONTANERO_RESOLVER_LABEL}
            </button>
          ) : null}
          {!puedeIniciar && !puedeResolver ? (
            <p>{AVERIAS_FONTANERO_NO_ACTIONS}</p>
          ) : null}
        </div>
      </section>

      <section
        className="averias-admin__section averias-fontanero__reporte"
        aria-labelledby="averia-fontanero-reporte-heading"
      >
        <h2 id="averia-fontanero-reporte-heading">Información del reporte</h2>
        <dl className="averias-admin__fields">
          <AveriasDetailField label="Fecha y hora del reporte">
            {formatAveriaAdminDateTimeOrUnavailable(
              averia.fechaReporte,
              AVERIA_UNAVAILABLE_LABEL,
            )}
          </AveriasDetailField>
          <AveriasDetailField label="Fecha y hora de asignación">
            {formatAveriaAdminDateTimeOrUnavailable(
              averia.fechaAsignacion,
              AVERIA_UNAVAILABLE_LABEL,
            )}
          </AveriasDetailField>
          <AveriasDetailField label="Nombre del Reportante">
            {averia.nombreReportante}
          </AveriasDetailField>
          <AveriasDetailField label="Teléfono de contacto">
            {averia.telefonoReportante}
          </AveriasDetailField>
        </dl>
      </section>

      <section
        className="averias-admin__section averias-fontanero__observaciones"
        aria-labelledby="averia-fontanero-obs-heading"
      >
        <h2 id="averia-fontanero-obs-heading">
          {AVERIAS_FONTANERO_OBSERVACIONES_TITULO}
        </h2>
        {observaciones.length > 0 ? (
          <ol className="averias-fontanero__observaciones-list">
            {observaciones.map((item, index) => {
              const esFinal =
                String(averia.estado) === 'RESUELTA' &&
                index === observaciones.length - 1
              return (
                <li key={item.id}>
                  <p className="averias-fontanero__observacion-fecha">
                    {formatAveriaAdminDateTimeOrUnavailable(
                      item.fechaCreacion,
                      AVERIA_UNAVAILABLE_LABEL,
                    )}
                  </p>
                  <p className="averias-admin__muted">{item.autor.nombre}</p>
                  <p className="averias-admin__prewrap">
                    {esFinal ? <strong>Observación final. </strong> : null}
                    {item.observacion}
                  </p>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="averias-admin__muted">
            {AVERIAS_FONTANERO_OBSERVACIONES_LISTA_VACIA}
          </p>
        )}
        {puedeRegistrar ? (
          <AveriasFontaneroObservacionForm
            averiaId={averia.id}
            onCreated={(item) => onObservacionCreated(item)}
            onUnauthorized={onUnauthorized}
          />
        ) : null}
      </section>

      <AveriaMaterialesSection
        averiaId={averia.id}
        codigoSeguimiento={averia.codigoSeguimiento}
        variant="fontanero"
        canRegistrarSalida
        onUnauthorized={onUnauthorized}
      />

      <AveriasFontaneroResolverDialog
        averiaId={averia.id}
        isOpen={resolverOpen}
        onCancel={() => setResolverOpen(false)}
        onResolved={(updated, message) => {
          setResolverOpen(false)
          onResolved(updated, message)
        }}
        onUnauthorized={onUnauthorized}
      />
    </div>
  )
}

export default AveriasFontaneroDetailView
