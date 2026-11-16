import { Fragment, type ReactNode } from 'react'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { listDatosEspecificosDetalle } from '../utils/formatDatosEspecificosDetalle'
import { formatActividadEstado } from '../utils/formatActividadEstado'
import {
  formatActividadFecha,
  formatHoraActividad,
} from '../utils/formatActividadFecha'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import ActivityFeedback from './ActivityFeedback'
import EvidenciaFotoGaleria from './EvidenciaFotoGaleria'
import { formatearFechaHoraAsada } from '../../../shared/utils/fechaAsada'

type DetalleActividadProps = {
  actividad: ActividadFontaneroRegistrada | null
  loading?: boolean
  error?: string | null
  showFontanero?: boolean
  onBack?: () => void
  backLabel?: string
  actions?: ReactNode
  /** `page` muestra cada bloque como apartado propio (sin modal). */
  variant?: 'overlay' | 'page'
}

const revisionLabel = (actividad: ActividadFontaneroRegistrada) =>
  actividad.estadoRevision === 'REVISADA' || actividad.estado === 'REVISADA'
    ? 'Revisada'
    : 'Pendiente'

const ContentWrap = ({
  isPage,
  children,
}: {
  isPage: boolean
  children: ReactNode
}) =>
  isPage ? (
    <div className="detalle-actividad__page-grid">{children}</div>
  ) : (
    <Fragment>{children}</Fragment>
  )

const DetalleActividad = ({
  actividad,
  loading = false,
  error = null,
  showFontanero = false,
  onBack,
  backLabel = 'Volver',
  actions,
  variant = 'overlay',
}: DetalleActividadProps) => {
  const datos = listDatosEspecificosDetalle(actividad?.datosEspecificos)
  const isPage = variant === 'page'

  if (loading) {
    return (
      <div className="detalle-actividad__state" role="status" aria-busy="true">
        Cargando detalle…
      </div>
    )
  }

  if (error || !actividad) {
    return (
      <div className="detalle-actividad__state detalle-actividad__state--error">
        <ActivityFeedback
          variant="warning"
          message={error || ACTIVITY_FEEDBACK_MESSAGES.notFound}
        />
        {onBack ? (
          <button type="button" onClick={onBack}>
            {backLabel}
          </button>
        ) : null}
      </div>
    )
  }

  const revisada = revisionLabel(actividad) === 'Revisada'
  const estadoLabel = formatActividadEstado(actividad.estado)
  const estadoRevisionLabel = revisionLabel(actividad)
  const estadosDuplicados = estadoLabel.toLocaleLowerCase('es') === estadoRevisionLabel.toLocaleLowerCase('es')
  const documentos = actividad.documentos ?? []
  const sinEvidencia = documentos.length === 0
  const [datoPrincipal, ...datosRestantes] = datos

  return (
    <article
      className={`detalle-actividad actividades-fontanero-historial-detalle__panel${
        isPage ? ' detalle-actividad--page' : ''
      }`}
      aria-labelledby="detalle-actividad-title"
    >
      <header className="detalle-actividad__header">
        <div>
          <span className="detalle-actividad__eyebrow">Actividad #{actividad.id}</span>
          <h2 id="detalle-actividad-title">{actividad.titulo}</h2>
          <p>{actividad.tipoActividadNombre || 'Sin tipo definido'}</p>
        </div>
        <div className="detalle-actividad__badges">
          {!estadosDuplicados ? (
            <span data-estado={actividad.estado}>{estadoLabel}</span>
          ) : null}
          <span className={revisada ? 'is-reviewed' : 'is-pending'}>
            {estadoRevisionLabel}
          </span>
        </div>
      </header>

      <ContentWrap isPage={isPage}>
        <section
          className="detalle-actividad__section detalle-actividad__apartado"
          aria-labelledby="detalle-info-general"
        >
          <h3 id="detalle-info-general">Información general</h3>
          <dl className={`detalle-actividad__grid${isPage ? ' detalle-actividad__grid--dense' : ''}`}>
            <div>
              <dt>Tipo</dt>
              <dd>{actividad.tipoActividadNombre || '—'}</dd>
            </div>
            <div>
              <dt>Fecha de inicio</dt>
              <dd>{formatActividadFecha(actividad.fechaActividad)}</dd>
            </div>
            <div>
              <dt>Hora de inicio</dt>
              <dd>{formatHoraActividad(actividad.horaInicio)}</dd>
            </div>
            <div>
              <dt>Fecha de finalización</dt>
              <dd>
                {actividad.fechaFin
                  ? formatActividadFecha(actividad.fechaFin)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Hora de finalización</dt>
              <dd>{formatHoraActividad(actividad.horaFin)}</dd>
            </div>
            {showFontanero ? (
              <div>
                <dt>Fontanero</dt>
                <dd>
                  {actividad.fontaneroNombre || actividad.fontaneroId || 'Sin identificar'}
                </dd>
              </div>
            ) : null}
            <div>
              <dt>Estado operativo</dt>
              <dd>{formatActividadEstado(actividad.estado)}</dd>
            </div>
            <div>
              <dt>Estado de revisión</dt>
              <dd>{revisionLabel(actividad)}</dd>
            </div>
            {actividad.fechaRegistro || actividad.createdAt ? (
              <div>
                <dt>Fecha de registro</dt>
                <dd>
                  {formatearFechaHoraAsada(
                    actividad.fechaRegistro || actividad.createdAt,
                  )}
                </dd>
              </div>
            ) : null}
            {revisada && actividad.fechaRevision ? (
              <div>
                <dt>Fecha de revisión</dt>
                <dd>{formatearFechaHoraAsada(actividad.fechaRevision)}</dd>
              </div>
            ) : null}
            {revisada && actividad.revisadoPorId ? (
              <div>
                <dt>Revisada por</dt>
                <dd>{actividad.revisadoPorId}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section
          className="detalle-actividad__section detalle-actividad__apartado"
          aria-labelledby="detalle-contexto"
        >
          <h3 id="detalle-contexto">Contexto del reporte</h3>
          <dl className="detalle-actividad__grid detalle-actividad__grid--contexto">
            <div className="is-wide">
              <dt>Descripción</dt>
              <dd>{actividad.descripcion || 'Sin descripción.'}</dd>
            </div>
            <div className={datoPrincipal ? undefined : 'is-wide'}>
              <dt>Ubicación</dt>
              <dd>{actividad.ubicacion || '—'}</dd>
            </div>
            {datoPrincipal ? (
              <div>
                <dt>{datoPrincipal.label}</dt>
                <dd>{datoPrincipal.value}</dd>
              </div>
            ) : null}
            <div className="is-wide">
              <dt>Observaciones</dt>
              <dd>{actividad.observaciones || 'Sin observaciones.'}</dd>
            </div>
            {datosRestantes.map((dato) => (
              <div key={dato.label}>
                <dt>{dato.label}</dt>
                <dd>{dato.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {actividad.observacionCorreccion ? (
          <section
            className="detalle-actividad__section detalle-actividad__apartado detalle-actividad__correction"
            role="note"
            aria-labelledby="detalle-correccion"
          >
            <h3 id="detalle-correccion">Corrección solicitada</h3>
            <p>{actividad.observacionCorreccion}</p>
          </section>
        ) : null}

        <section
          className={`detalle-actividad__section detalle-actividad__apartado${
            sinEvidencia ? ' detalle-actividad__apartado--empty' : ''
          }`}
          aria-labelledby="detalle-evidencia"
        >
          <h3 id="detalle-evidencia">Evidencia fotográfica</h3>
          <EvidenciaFotoGaleria
            documentos={documentos}
            actividadId={actividad.id}
          />
        </section>
      </ContentWrap>

      {onBack || actions ? (
        <footer className="detalle-actividad__actions">
          {actions}
          {onBack ? (
            <button
              type="button"
              className="detalle-actividad__back"
              onClick={onBack}
            >
              {backLabel}
            </button>
          ) : null}
        </footer>
      ) : null}
    </article>
  )
}

export default DetalleActividad
