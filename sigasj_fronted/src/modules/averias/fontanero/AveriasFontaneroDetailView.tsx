import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import { IconMapPin } from '@tabler/icons-react'
import ActivityFeedback from '../../actividades-fontanero/components/ActivityFeedback'
import { getHttpErrorStatus } from '../../actividades-fontanero/utils/httpErrorStatus'
import { Alert } from '../../../shared/ui/Alert'
import { Button } from '../../../shared/ui/Button'
import { getEstadoAveriaPresentation } from '../admin/estadoAveria'
import { formatAveriaAdminDateTimeOrUnavailable } from '../admin/formatAveriaAdminDate'
import { AVERIA_UNAVAILABLE_LABEL } from '../admin/types'
import { iniciarFontaneroAtencion } from '../services/averiasFontaneroApi'
import {
  MENSAJE_PENDIENTE_HORARIO_FONTANERO,
  esPendienteDeAtencion,
  mostrarAvisoHorarioFontanero,
  parseInicioAtencionError,
} from '../utils/averiaPendienteAtencion'
import AveriaMaterialesSection from '../inventario/AveriaMaterialesSection'
import AveriasFontaneroClasificacionForm from './AveriasFontaneroClasificacionForm'
import AveriasFontaneroObservacionForm from './AveriasFontaneroObservacionForm'
import AveriasFontaneroResolverDialog from './AveriasFontaneroResolverDialog'
import { averiaCalificadaParaAtencion } from './averiaCalificada'
import { mapasHref, telefonoHref } from './contactoAveria'
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
  AVERIAS_FONTANERO_CALIFICAR_ANTES,
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

const Field = ({
  label,
  children,
  wide,
  highlight,
}: {
  label: string
  children: ReactNode
  wide?: boolean
  highlight?: boolean
}) => (
  <div className={`${wide ? 'is-wide' : ''}${highlight ? ' is-highlight' : ''}`.trim()}>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
)

const badgeClassForEstado = (estado: string) => {
  const upper = estado.toUpperCase()
  if (upper === 'RESUELTA') return 'is-reviewed'
  if (upper === 'PENDIENTE' || upper === 'PENDIENTE_ATENCION') return 'is-pending'
  return undefined
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
  const estadoPresentation = getEstadoAveriaPresentation(String(averia.estado))
  const estado = String(averia.estado)
  const puedeResolver = puedeMarcarAveriaResuelta(estado)
  const estadoPermiteInicio = puedeIntentarIniciarAtencionAveria(estado)
  const clasificada = averiaCalificadaParaAtencion(
    averia.prioridad,
    averia.tipoAveria,
  )
  const avisoHorario = mostrarAvisoHorarioFontanero(
    estado,
    averia.dentroDeHorario,
  )
  const puedeIniciar = estadoPermiteInicio && clasificada && !avisoHorario
  const puedeRegistrar = puedeRegistrarObservacionAveria(estado)
  const puedeCalificar = puedeCalificarAveria(estado)
  const enlaceTelefono = telefonoHref(averia.telefonoReportante)
  const enlaceMapas = mapasHref(averia.ubicacion, {
    latitud: averia.latitud,
    longitud: averia.longitud,
  })
  const [resolverOpen, setResolverOpen] = useState(false)
  const [iniciarError, setIniciarError] = useState<string | null>(null)
  const [iniciando, setIniciando] = useState(false)
  const iniciandoRef = useRef(false)
  const observaciones = sortObservacionesAtencion(averia.observaciones ?? [])
  const estadoPendiente = esPendienteDeAtencion(estado)
  const titulo =
    averia.descripcion?.trim() ||
    averia.sectorComunidad?.trim() ||
    averia.codigoSeguimiento

  const showAcciones =
    puedeIniciar ||
    puedeResolver ||
    Boolean(iniciarError) ||
    (estadoPermiteInicio && !clasificada && !avisoHorario) ||
    (!estadoPermiteInicio && !puedeResolver)

  return (
    <div className="averias-fontanero__detail grid w-full min-w-0 gap-4">
      {successMessage ? (
        <ActivityFeedback variant="success" message={successMessage} />
      ) : null}

      <article
        className="detalle-actividad detalle-actividad--page"
        aria-labelledby="averia-fontanero-detail-heading"
      >
        <header className="detalle-actividad__header">
          <div>
            <span className="detalle-actividad__eyebrow">
              Avería #{averia.id}
            </span>
            <h2 id="averia-fontanero-detail-heading">{titulo}</h2>
            <p>
              {averia.codigoSeguimiento}
              {averia.sectorComunidad
                ? ` · ${averia.sectorComunidad}`
                : ''}
            </p>
          </div>
          <div className="detalle-actividad__badges">
            <span
              className={badgeClassForEstado(estado)}
              data-estado={estado}
            >
              {estadoPresentation.label}
            </span>
            <span
              className={
                prioridadModifier === 'is-urgente' ||
                prioridadModifier === 'is-alta'
                  ? 'is-pending'
                  : undefined
              }
            >
              {prioridadLabel}
            </span>
          </div>
        </header>

        <div className="detalle-actividad__page-grid">
          <section
            className="detalle-actividad__section detalle-actividad__apartado"
            aria-labelledby="averia-info-general"
          >
            <h3 id="averia-info-general">Información general</h3>
            <dl className="detalle-actividad__grid detalle-actividad__grid--dense">
              <Field label="Tipo">
                {getFontaneroTipoLabel(averia.tipoAveria)}
              </Field>
              <Field label="Prioridad">{prioridadLabel}</Field>
              <Field label="Estado" highlight={estadoPendiente || avisoHorario}>
                {estadoPresentation.label}
              </Field>
              <Field label="Inicio de atención">
                {averia.fechaInicioAtencion
                  ? formatAveriaAdminDateTimeOrUnavailable(
                      averia.fechaInicioAtencion,
                      AVERIA_UNAVAILABLE_LABEL,
                    )
                  : AVERIAS_FONTANERO_ATENCION_NO_INICIADA}
              </Field>
              <Field label="Fecha de resolución">
                {formatAveriaAdminDateTimeOrUnavailable(
                  averia.fechaResolucion,
                  AVERIA_UNAVAILABLE_LABEL,
                )}
              </Field>
              <Field label="Fecha del reporte">
                {formatAveriaAdminDateTimeOrUnavailable(
                  averia.fechaReporte,
                  AVERIA_UNAVAILABLE_LABEL,
                )}
              </Field>
            </dl>
          </section>

          <section
            className="detalle-actividad__section detalle-actividad__apartado"
            aria-labelledby="averia-ubicacion"
          >
            <h3 id="averia-ubicacion">Ubicación de la avería</h3>
            <dl className="detalle-actividad__grid detalle-actividad__grid--contexto">
              <Field label="Sector / comunidad">
                {averia.sectorComunidad}
              </Field>
              <Field label="Descripción del problema" wide>
                {averia.descripcion}
              </Field>
              <Field label="Dirección" wide>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="min-w-0 whitespace-pre-wrap">
                    {averia.ubicacion}
                  </span>
                  {enlaceMapas ? (
                    <a
                      className="averias-fontanero__enlace inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#e8f3ff] px-3 py-1.5 text-sm font-extrabold text-sigasj-primary no-underline transition hover:bg-[#d9ebff]"
                      href={enlaceMapas}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconMapPin size={15} aria-hidden="true" />
                      Cómo llegar
                    </a>
                  ) : null}
                </div>
              </Field>
            </dl>
          </section>

          <section
            className="detalle-actividad__section detalle-actividad__apartado"
            aria-labelledby="averia-reporte"
          >
            <h3 id="averia-reporte">Información del reporte</h3>
            <dl className="detalle-actividad__grid detalle-actividad__grid--dense">
              <Field label="Fecha y hora de asignación">
                {formatAveriaAdminDateTimeOrUnavailable(
                  averia.fechaAsignacion,
                  AVERIA_UNAVAILABLE_LABEL,
                )}
              </Field>
              <Field label="Nombre del reportante">
                {averia.nombreReportante}
              </Field>
              <Field label="Teléfono de contacto" wide>
                {enlaceTelefono ? (
                  <a
                    className="averias-fontanero__enlace font-extrabold text-sigasj-primary no-underline hover:underline"
                    href={enlaceTelefono}
                  >
                    {averia.telefonoReportante}
                  </a>
                ) : (
                  averia.telefonoReportante
                )}
              </Field>
            </dl>
          </section>

          <section
            className="detalle-actividad__section detalle-actividad__apartado"
            aria-labelledby="averia-atencion"
          >
            <h3 id="averia-atencion">Datos de atención</h3>

            {avisoHorario ? (
              <Alert tone="warning" role="status">
                {MENSAJE_PENDIENTE_HORARIO_FONTANERO}
              </Alert>
            ) : (
              <p className="averias-admin__hint averias-fontanero__estado-hint m-0 mb-3 text-sm font-semibold text-sigasj-muted">
                Usted actualiza el estado al atender o resolver esta avería.
              </p>
            )}

            <div className="averias-fontanero__gestion-paneles grid gap-3">
              {puedeCalificar ? (
                <AveriasFontaneroClasificacionForm
                  averia={averia}
                  onUpdated={onClasificada}
                  onUnauthorized={onUnauthorized}
                />
              ) : null}

              {showAcciones ? (
                <div className="detalle-actividad__actions averias-fontanero__acciones">
                  <p className="averias-admin__muted m-0 w-full text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted">
                    Acciones disponibles
                  </p>
                  {iniciarError ? (
                    <ActivityFeedback variant="error" message={iniciarError} />
                  ) : null}
                  {estadoPermiteInicio && !clasificada && !avisoHorario ? (
                    <p className="averias-admin__hint m-0" role="status">
                      {AVERIAS_FONTANERO_CALIFICAR_ANTES}
                    </p>
                  ) : null}
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {puedeIniciar ? (
                      <Button
                        type="button"
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={iniciando}
                        aria-busy={iniciando}
                        onClick={() => {
                          if (iniciandoRef.current) return
                          iniciandoRef.current = true
                          setIniciando(true)
                          setIniciarError(null)
                          void iniciarFontaneroAtencion(averia.id)
                            .then((updated) => {
                              onAtencionIniciada(
                                updated,
                                AVERIAS_FONTANERO_INICIAR_SUCCESS,
                              )
                            })
                            .catch((error: unknown) => {
                              const status = getHttpErrorStatus(error)
                              if (status === 401) {
                                onUnauthorized()
                                return
                              }
                              if (status === 403) {
                                setIniciarError(
                                  AVERIAS_FONTANERO_INICIAR_FORBIDDEN,
                                )
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
                      </Button>
                    ) : null}
                    {puedeResolver ? (
                      <Button
                        type="button"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => setResolverOpen(true)}
                      >
                        {AVERIAS_FONTANERO_RESOLVER_LABEL}
                      </Button>
                    ) : null}
                  </div>
                  {!estadoPermiteInicio && !puedeResolver ? (
                    <p className="m-0 text-sm font-semibold text-sigasj-muted">
                      {AVERIAS_FONTANERO_NO_ACTIONS}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          <section
            className="detalle-actividad__section detalle-actividad__apartado"
            aria-labelledby="averia-fontanero-obs-heading"
          >
            <h3 id="averia-fontanero-obs-heading">
              {AVERIAS_FONTANERO_OBSERVACIONES_TITULO}
            </h3>
            {observaciones.length > 0 ? (
              <ol className="averias-fontanero__observaciones-list m-0 grid list-none gap-3 p-0">
                {observaciones.map((item, index) => {
                  const esFinal =
                    String(averia.estado) === 'RESUELTA' &&
                    index === observaciones.length - 1
                  return (
                    <li
                      key={item.id}
                      className="rounded-2xl border border-sigasj-border bg-sigasj-surface-soft/60 p-4"
                    >
                      <p className="averias-fontanero__observacion-fecha m-0 mb-1 text-sm font-extrabold text-sigasj-primary">
                        {formatAveriaAdminDateTimeOrUnavailable(
                          item.fechaCreacion,
                          AVERIA_UNAVAILABLE_LABEL,
                        )}
                      </p>
                      <p className="averias-admin__muted m-0 mb-2 text-xs font-bold uppercase tracking-[0.06em] text-sigasj-muted">
                        {item.autor.nombre}
                      </p>
                      <p className="averias-admin__prewrap m-0 rounded-xl bg-white p-3.5 text-sm font-medium leading-relaxed text-sigasj-ink">
                        {esFinal ? <strong>Observación final. </strong> : null}
                        {item.observacion}
                      </p>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p
                className="detalle-actividad__evidence-empty"
                role="status"
              >
                {AVERIAS_FONTANERO_OBSERVACIONES_LISTA_VACIA}
              </p>
            )}
            {puedeRegistrar ? (
              <div className="mt-3">
                <AveriasFontaneroObservacionForm
                  averiaId={averia.id}
                  onCreated={(item) => onObservacionCreated(item)}
                  onUnauthorized={onUnauthorized}
                />
              </div>
            ) : null}
          </section>

        </div>
      </article>

      <AveriaMaterialesSection
        averiaId={averia.id}
        codigoSeguimiento={averia.codigoSeguimiento}
        variant="fontanero"
        canRegistrarSalida={estado === 'EN_ATENCION'}
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
