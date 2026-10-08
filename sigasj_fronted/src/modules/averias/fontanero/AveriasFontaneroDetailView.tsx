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
import { averiaCalificadaParaAtencion } from './averiaCalificada'
import { telefonoHref } from './contactoAveria'
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
  const estadoPermiteInicio = puedeIntentarIniciarAtencionAveria(estado)
  const clasificada = averiaCalificadaParaAtencion(averia.prioridad, averia.tipoAveria)
  const avisoHorario = mostrarAvisoHorarioFontanero(estado, averia.dentroDeHorario)
  const puedeIniciar = estadoPermiteInicio && clasificada && !avisoHorario
  const puedeRegistrar = puedeRegistrarObservacionAveria(estado)
  const puedeCalificar = puedeCalificarAveria(estado)
  const enlaceTelefono = telefonoHref(averia.telefonoReportante)
  const [resolverOpen, setResolverOpen] = useState(false)
  const [iniciarError, setIniciarError] = useState<string | null>(null)
  const [iniciando, setIniciando] = useState(false)
  const iniciandoRef = useRef(false)
  const observaciones = sortObservacionesAtencion(averia.observaciones ?? [])

  return (
    <div className="averias-admin__detail averias-fontanero__detail !grid !w-full !gap-6 [&_.averias-admin__section]:!w-full [&_.averias-admin__section]:!overflow-hidden [&_.averias-admin__section]:!rounded-[26px] [&_.averias-admin__section]:!border [&_.averias-admin__section]:!border-blue-100 [&_.averias-admin__section]:!bg-linear-to-br [&_.averias-admin__section]:!from-white [&_.averias-admin__section]:!via-blue-50/20 [&_.averias-admin__section]:!to-sky-50/45 [&_.averias-admin__section]:!p-7 [&_.averias-admin__section]:!shadow-[0_12px_34px_rgba(30,90,156,0.09)] [&_.averias-admin__section>h2]:!mb-5 [&_.averias-admin__section>h2]:!border-b [&_.averias-admin__section>h2]:!border-blue-100 [&_.averias-admin__section>h2]:!pb-4 [&_.averias-admin__section>h2]:!text-2xl [&_.averias-admin__section>h2]:!font-black [&_.averias-admin__section>h2]:!tracking-[-0.02em] [&_.averias-admin__section>h2]:!text-[#073b73] [&_.averias-admin__fields]:!gap-4 [&_.averias-admin__fields>div]:!rounded-2xl [&_.averias-admin__fields>div]:!border [&_.averias-admin__fields>div]:!border-blue-100 [&_.averias-admin__fields>div]:!bg-white/90 [&_.averias-admin__fields>div]:!p-5 [&_.averias-admin__fields>div]:!shadow-[0_6px_16px_rgba(30,90,156,0.06)] [&_.averias-admin__fields>div]:!transition-all [&_.averias-admin__fields>div]:!duration-300 hover:[&_.averias-admin__fields>div]:!-translate-y-0.5 hover:[&_.averias-admin__fields>div]:!border-blue-200 hover:[&_.averias-admin__fields>div]:!shadow-[0_10px_22px_rgba(30,90,156,0.11)] [&_.averias-admin__fields_dt]:!mb-2 [&_.averias-admin__fields_dt]:!font-extrabold [&_.averias-admin__fields_dt]:!tracking-[0.05em] [&_.averias-admin__fields_dt]:!text-slate-500 [&_.averias-admin__fields_dd]:!font-bold [&_.averias-admin__fields_dd]:!text-[#073b73] [&_.averias-fontanero__enlace]:!inline-flex [&_.averias-fontanero__enlace]:!items-center [&_.averias-fontanero__enlace]:!rounded-xl [&_.averias-fontanero__enlace]:!bg-blue-50 [&_.averias-fontanero__enlace]:!px-3 [&_.averias-fontanero__enlace]:!py-1.5 [&_.averias-fontanero__enlace]:!font-extrabold [&_.averias-fontanero__enlace]:!text-blue-700 [&_.averias-fontanero__enlace]:!transition-all hover:[&_.averias-fontanero__enlace]:!bg-blue-100 [&_.averias-admin__horario-hint]:!rounded-2xl [&_.averias-admin__horario-hint]:!border [&_.averias-admin__horario-hint]:!border-amber-200 [&_.averias-admin__horario-hint]:!bg-linear-to-r [&_.averias-admin__horario-hint]:!from-amber-50 [&_.averias-admin__horario-hint]:!to-orange-50 [&_.averias-admin__horario-hint]:!p-4 [&_.averias-admin__horario-hint]:!font-bold [&_.averias-admin__horario-hint]:!text-amber-800 [&_.averias-admin__horario-hint]:!shadow-sm [&_.averias-fontanero__gestion-paneles>*]:!rounded-2xl [&_.averias-fontanero__gestion-paneles>*]:!border [&_.averias-fontanero__gestion-paneles>*]:!border-blue-100 [&_.averias-fontanero__gestion-paneles>*]:!bg-white/90 [&_.averias-fontanero__gestion-paneles>*]:!p-5 [&_.averias-fontanero__gestion-paneles>*]:!shadow-[0_7px_18px_rgba(30,90,156,0.07)] [&_.gallery-admin__button]:!min-h-12 [&_.gallery-admin__button]:!rounded-2xl [&_.gallery-admin__button]:!border-0 [&_.gallery-admin__button]:!bg-linear-to-r [&_.gallery-admin__button]:!from-blue-700 [&_.gallery-admin__button]:!to-cyan-500 [&_.gallery-admin__button]:!px-6 [&_.gallery-admin__button]:!font-extrabold [&_.gallery-admin__button]:!text-white [&_.gallery-admin__button]:!shadow-[0_9px_22px_rgba(37,99,235,0.25)] [&_.gallery-admin__button]:!transition-all [&_.gallery-admin__button]:!duration-300 hover:[&_.gallery-admin__button]:!-translate-y-1 hover:[&_.gallery-admin__button]:!shadow-[0_14px_28px_rgba(37,99,235,0.35)] active:[&_.gallery-admin__button]:!translate-y-0 active:[&_.gallery-admin__button]:!scale-[0.97] [&_.averias-fontanero__observaciones-list>li]:!rounded-2xl [&_.averias-fontanero__observaciones-list>li]:!border [&_.averias-fontanero__observaciones-list>li]:!border-blue-100 [&_.averias-fontanero__observaciones-list>li]:!bg-white [&_.averias-fontanero__observaciones-list>li]:!p-5 [&_.averias-fontanero__observaciones-list>li]:!shadow-sm [&_.averias-admin__empty-note]:!rounded-2xl [&_.averias-admin__empty-note]:!border [&_.averias-admin__empty-note]:!border-dashed [&_.averias-admin__empty-note]:!border-blue-200 [&_.averias-admin__empty-note]:!bg-blue-50/60 [&_.averias-admin__empty-note]:!p-6 [&_.averias-admin__empty-note]:!text-center [&_.averias-admin__empty-note]:!text-slate-500">
      {successMessage ? (
        <ActivityFeedback variant="success" message={successMessage} />
      ) : null}

      <section
        className="averias-admin__section averias-fontanero__ubicacion averia-hierarchy-card !w-full"
        aria-labelledby="averia-fontanero-ubicacion-heading"
      >
        <h2 className="averia-hierarchy-card__title" id="averia-fontanero-ubicacion-heading">Ubicación de la avería</h2>
        <dl className="averias-admin__fields averias-admin__fields--ubicacion">
          <AveriasDetailField label="Sector / comunidad" modern>
            {averia.sectorComunidad}
          </AveriasDetailField>
          <AveriasDetailField label="Descripción del problema" modern>
            {averia.descripcion}
          </AveriasDetailField>
          <AveriasDetailField label="Dirección" multiline modern>
            <span className="averias-admin__prewrap">{averia.ubicacion}</span>
          </AveriasDetailField>
        </dl>
      </section>

      <section
        className="averias-admin__section averias-fontanero__gestion averia-hierarchy-card !w-full"
        aria-labelledby="averia-fontanero-gestion-heading"
      >
        <h2 className="averia-hierarchy-card__title" id="averia-fontanero-gestion-heading">Gestión de la avería</h2>
        <dl className="averias-admin__fields averias-fontanero__resumen averia-management-fields">
          <AveriasDetailField label="Tipo" modern>
            {getFontaneroTipoLabel(averia.tipoAveria)}
          </AveriasDetailField>
          <AveriasDetailField label="Prioridad" modern>
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
          <AveriasDetailField label="Estado" modern>
            <AveriaStatusBadge estado={averia.estado} />
          </AveriasDetailField>
          <AveriasDetailField label="Inicio de atención" modern>
            {averia.fechaInicioAtencion
              ? formatAveriaAdminDateTimeOrUnavailable(
                  averia.fechaInicioAtencion,
                  AVERIA_UNAVAILABLE_LABEL,
                )
              : AVERIAS_FONTANERO_ATENCION_NO_INICIADA}
          </AveriasDetailField>
          <AveriasDetailField label="Fecha de resolución" modern>
            {formatAveriaAdminDateTimeOrUnavailable(
              averia.fechaResolucion,
              AVERIA_UNAVAILABLE_LABEL,
            )}
          </AveriasDetailField>
        </dl>
        {avisoHorario ? (
          <p className="averias-admin__horario-hint" role="status">
            {MENSAJE_PENDIENTE_HORARIO_FONTANERO}
          </p>
        ) : (
          <p className="averias-admin__hint averias-fontanero__estado-hint">
            Usted actualiza el estado al atender o resolver esta avería.
          </p>
        )}
        <div className="averias-fontanero__gestion-paneles">
        {puedeCalificar ? (
          <AveriasFontaneroClasificacionForm
            averia={averia}
            onUpdated={onClasificada}
            onUnauthorized={onUnauthorized}
          />
        ) : null}
        {puedeIniciar ||
        puedeResolver ||
        iniciarError ||
        (estadoPermiteInicio && !clasificada && !avisoHorario) ||
        (!estadoPermiteInicio && !puedeResolver) ? (
        <div className="averias-fontanero__acciones">
          <p className="averias-admin__muted">Acciones disponibles</p>
          {iniciarError ? (
            <ActivityFeedback variant="error" message={iniciarError} />
          ) : null}
          {estadoPermiteInicio && !clasificada && !avisoHorario ? (
            <p className="averias-admin__hint" role="status">
              {AVERIAS_FONTANERO_CALIFICAR_ANTES}
            </p>
          ) : null}
          {puedeIniciar ? (
            <button
              className="gallery-admin__button !min-h-12 !rounded-2xl !border-0 !bg-linear-to-r !from-blue-600 !to-sky-500 !px-6 !font-extrabold !text-white !shadow-[0_10px_24px_rgba(37,99,235,0.25)] !transition-all !duration-300 hover:!-translate-y-1 hover:!shadow-[0_15px_30px_rgba(37,99,235,0.35)] active:!translate-y-0 active:!scale-[0.97] disabled:!cursor-not-allowed disabled:!opacity-55 disabled:hover:!translate-y-0"
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
              className="gallery-admin__button !min-h-12 !rounded-2xl !border-0 !bg-linear-to-r !from-blue-600 !to-sky-500 !px-6 !font-extrabold !text-white !shadow-[0_10px_24px_rgba(37,99,235,0.25)] !transition-all !duration-300 hover:!-translate-y-1 hover:!shadow-[0_15px_30px_rgba(37,99,235,0.35)] active:!translate-y-0 active:!scale-[0.97]"
              type="button"
              onClick={() => setResolverOpen(true)}
            >
              {AVERIAS_FONTANERO_RESOLVER_LABEL}
            </button>
          ) : null}
          {!estadoPermiteInicio && !puedeResolver ? (
            <p>{AVERIAS_FONTANERO_NO_ACTIONS}</p>
          ) : null}
        </div>
        ) : null}
        </div>
      </section>

      <section
        className="averias-admin__section averias-fontanero__reporte averia-hierarchy-card !w-full"
        aria-labelledby="averia-fontanero-reporte-heading"
      >
        <h2 className="averia-hierarchy-card__title" id="averia-fontanero-reporte-heading">Información del reporte</h2>
        <dl className="averias-admin__fields">
          <AveriasDetailField label="Fecha y hora del reporte" modern>
            {formatAveriaAdminDateTimeOrUnavailable(
              averia.fechaReporte,
              AVERIA_UNAVAILABLE_LABEL,
            )}
          </AveriasDetailField>
          <AveriasDetailField label="Fecha y hora de asignación" modern>
            {formatAveriaAdminDateTimeOrUnavailable(
              averia.fechaAsignacion,
              AVERIA_UNAVAILABLE_LABEL,
            )}
          </AveriasDetailField>
          <AveriasDetailField label="Nombre del Reportante" modern>
            {averia.nombreReportante}
          </AveriasDetailField>
          <AveriasDetailField label="Teléfono de contacto" modern>
            {enlaceTelefono ? (
              <a className="averias-fontanero__enlace" href={enlaceTelefono}>
                {averia.telefonoReportante}
              </a>
            ) : (
              averia.telefonoReportante
            )}
          </AveriasDetailField>
        </dl>
      </section>

      <section
        className="averias-admin__section averias-fontanero__observaciones averia-hierarchy-card !w-full"
        aria-labelledby="averia-fontanero-obs-heading"
      >
        <h2 className="averia-hierarchy-card__title" id="averia-fontanero-obs-heading">
          {AVERIAS_FONTANERO_OBSERVACIONES_TITULO}
        </h2>
        {observaciones.length > 0 ? (
          <ol className="averias-fontanero__observaciones-list !m-0 !grid !gap-4 !p-0">
            {observaciones.map((item, index) => {
              const esFinal =
                String(averia.estado) === 'RESUELTA' &&
                index === observaciones.length - 1
              return (
                <li className="!list-none !rounded-2xl !border !border-blue-100 !bg-white !p-5 !shadow-[0_7px_18px_rgba(30,90,156,0.07)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-blue-200 hover:!shadow-[0_11px_24px_rgba(30,90,156,0.12)]" key={item.id}>
                  <p className="averias-fontanero__observacion-fecha !mb-1 !text-sm !font-extrabold !text-blue-700">
                    {formatAveriaAdminDateTimeOrUnavailable(
                      item.fechaCreacion,
                      AVERIA_UNAVAILABLE_LABEL,
                    )}
                  </p>
                  <p className="averias-admin__muted !mb-3 !text-xs !font-bold !uppercase !tracking-[0.06em] !text-slate-500">{item.autor.nombre}</p>
                  <p className="averias-admin__prewrap !m-0 !rounded-xl !bg-slate-50 !p-4 !font-medium !leading-relaxed !text-[#073b73]">
                    {esFinal ? <strong>Observación final. </strong> : null}
                    {item.observacion}
                  </p>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="averias-admin__empty-note !rounded-2xl !border !border-dashed !border-blue-200 !bg-blue-50/60 !p-6 !text-center !font-medium !text-slate-500">
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
