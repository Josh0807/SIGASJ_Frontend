import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import {
  IconAlertTriangle,
  IconBuildingCommunity,
  IconCalendarEvent,
  IconFileDescription,
  IconHome,
  IconMapPin,
  IconPhone,
  IconSettings,
  IconTag,
  IconUser,
} from '@tabler/icons-react'
import ActivityFeedback from '../../actividades-fontanero/components/ActivityFeedback'
import { getHttpErrorStatus } from '../../actividades-fontanero/utils/httpErrorStatus'
import { Alert } from '../../../shared/ui/Alert'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import AveriaStatusBadge from '../admin/AveriaStatusBadge'
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

const SectionTitle = ({
  id,
  icon,
  children,
}: {
  id: string
  icon: ReactNode
  children: ReactNode
}) => (
  <h2
    id={id}
    className="m-0 mb-4 flex items-center gap-2.5 border-b border-sigasj-border pb-3 text-[1.05rem] font-extrabold tracking-tight text-sigasj-ink"
  >
    <span className="grid size-8 place-items-center rounded-xl bg-sigasj-surface-soft text-sigasj-primary">
      {icon}
    </span>
    {children}
  </h2>
)

const SoftField = ({
  label,
  icon,
  children,
  highlight,
  className = '',
}: {
  label: string
  icon?: ReactNode
  children: ReactNode
  highlight?: boolean
  className?: string
}) => (
  <div
    className={`grid min-w-0 gap-1.5 rounded-2xl border px-3.5 py-3 ${
      highlight
        ? 'border-amber-200 bg-amber-50/80'
        : 'border-sigasj-border bg-[color-mix(in_srgb,var(--color-sigasj-ice)_55%,white)]'
    } ${className}`}
  >
    <dt className="m-0 flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted">
      {icon ? (
        <span className="text-sigasj-primary" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {label}
    </dt>
    <dd className="m-0 text-[0.95rem] font-bold leading-snug text-sigasj-ink">
      {children}
    </dd>
  </div>
)

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
  const enlaceMapas = mapasHref(averia.ubicacion)
  const [resolverOpen, setResolverOpen] = useState(false)
  const [iniciarError, setIniciarError] = useState<string | null>(null)
  const [iniciando, setIniciando] = useState(false)
  const iniciandoRef = useRef(false)
  const observaciones = sortObservacionesAtencion(averia.observaciones ?? [])
  const estadoPendiente = esPendienteDeAtencion(estado)

  return (
    <div className="averias-fontanero__detail grid w-full min-w-0 gap-4">
      {successMessage ? (
        <ActivityFeedback variant="success" message={successMessage} />
      ) : null}

      <Card
        as="section"
        padded
        className="averias-fontanero__ubicacion !p-4 sm:!p-5"
        aria-labelledby="averia-fontanero-ubicacion-heading"
      >
        <SectionTitle
          id="averia-fontanero-ubicacion-heading"
          icon={<IconMapPin size={18} aria-hidden="true" />}
        >
          Ubicación de la avería
        </SectionTitle>
        <dl className="m-0 grid gap-3 sm:grid-cols-2">
          <SoftField
            label="Sector / comunidad"
            icon={<IconBuildingCommunity size={14} />}
          >
            {averia.sectorComunidad}
          </SoftField>
          <SoftField
            label="Descripción del problema"
            icon={<IconAlertTriangle size={14} />}
          >
            {averia.descripcion}
          </SoftField>
          <SoftField
            label="Dirección"
            icon={<IconHome size={14} />}
            className="sm:col-span-2"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span className="min-w-0 whitespace-pre-wrap">{averia.ubicacion}</span>
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
          </SoftField>
        </dl>
      </Card>

      <Card
        as="section"
        padded
        className="averias-fontanero__gestion !grid !gap-4 !p-4 sm:!p-5"
        aria-labelledby="averia-fontanero-gestion-heading"
      >
        <SectionTitle
          id="averia-fontanero-gestion-heading"
          icon={<IconSettings size={18} aria-hidden="true" />}
        >
          Datos de atención
        </SectionTitle>

        <dl className="averias-fontanero__resumen averia-management-fields m-0 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SoftField
            label="Tipo"
            icon={<IconTag size={14} />}
          >
            {getFontaneroTipoLabel(averia.tipoAveria)}
          </SoftField>
          <SoftField label="Prioridad" icon={<IconTag size={14} />}>
            {prioridadLabel}
          </SoftField>
          <SoftField
            label="Estado"
            highlight={estadoPendiente || avisoHorario}
          >
            <AveriaStatusBadge estado={averia.estado} variant="flat" />
          </SoftField>
          <SoftField label="Inicio de atención">
            {averia.fechaInicioAtencion
              ? formatAveriaAdminDateTimeOrUnavailable(
                  averia.fechaInicioAtencion,
                  AVERIA_UNAVAILABLE_LABEL,
                )
              : AVERIAS_FONTANERO_ATENCION_NO_INICIADA}
          </SoftField>
          <SoftField label="Fecha de resolución">
            {formatAveriaAdminDateTimeOrUnavailable(
              averia.fechaResolucion,
              AVERIA_UNAVAILABLE_LABEL,
            )}
          </SoftField>
        </dl>

        {avisoHorario ? (
          <Alert tone="warning" role="status">
            {MENSAJE_PENDIENTE_HORARIO_FONTANERO}
          </Alert>
        ) : (
          <p className="averias-admin__hint averias-fontanero__estado-hint m-0 text-sm font-semibold text-sigasj-muted">
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

          {puedeIniciar ||
          puedeResolver ||
          iniciarError ||
          (estadoPermiteInicio && !clasificada && !avisoHorario) ||
          (!estadoPermiteInicio && !puedeResolver) ? (
            <div className="averias-fontanero__acciones grid gap-3 rounded-2xl border border-sigasj-border bg-white p-4">
              <p className="averias-admin__muted m-0 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted">
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
              <div className="flex flex-wrap gap-2">
                {puedeIniciar ? (
                  <Button
                    type="button"
                    size="sm"
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
                  </Button>
                ) : null}
                {puedeResolver ? (
                  <Button
                    type="button"
                    size="sm"
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
      </Card>

      <Card
        as="section"
        padded
        className="averias-fontanero__reporte !p-4 sm:!p-5"
        aria-labelledby="averia-fontanero-reporte-heading"
      >
        <SectionTitle
          id="averia-fontanero-reporte-heading"
          icon={<IconFileDescription size={18} aria-hidden="true" />}
        >
          Información del reporte
        </SectionTitle>
        <dl className="m-0 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SoftField
            label="Fecha y hora del reporte"
            icon={<IconCalendarEvent size={14} />}
          >
            {formatAveriaAdminDateTimeOrUnavailable(
              averia.fechaReporte,
              AVERIA_UNAVAILABLE_LABEL,
            )}
          </SoftField>
          <SoftField
            label="Fecha y hora de asignación"
            icon={<IconCalendarEvent size={14} />}
          >
            {formatAveriaAdminDateTimeOrUnavailable(
              averia.fechaAsignacion,
              AVERIA_UNAVAILABLE_LABEL,
            )}
          </SoftField>
          <SoftField
            label="Nombre del Reportante"
            icon={<IconUser size={14} />}
          >
            {averia.nombreReportante}
          </SoftField>
          <SoftField
            label="Teléfono de contacto"
            icon={<IconPhone size={14} />}
          >
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
          </SoftField>
        </dl>
      </Card>

      <Card
        as="section"
        padded
        className="averias-fontanero__observaciones !grid !gap-4 !p-4 sm:!p-5"
        aria-labelledby="averia-fontanero-obs-heading"
      >
        <SectionTitle
          id="averia-fontanero-obs-heading"
          icon={<IconFileDescription size={18} aria-hidden="true" />}
        >
          {AVERIAS_FONTANERO_OBSERVACIONES_TITULO}
        </SectionTitle>
        {observaciones.length > 0 ? (
          <ol className="averias-fontanero__observaciones-list m-0 grid list-none gap-3 p-0">
            {observaciones.map((item, index) => {
              const esFinal =
                String(averia.estado) === 'RESUELTA' &&
                index === observaciones.length - 1
              return (
                <li
                  key={item.id}
                  className="rounded-2xl border border-sigasj-border bg-white p-4"
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
                  <p className="averias-admin__prewrap m-0 rounded-xl bg-sigasj-surface-soft p-3.5 text-sm font-medium leading-relaxed text-sigasj-ink">
                    {esFinal ? <strong>Observación final. </strong> : null}
                    {item.observacion}
                  </p>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="averias-admin__empty-note m-0 rounded-2xl border border-dashed border-sigasj-border bg-sigasj-surface-soft p-5 text-center text-sm font-medium text-sigasj-muted">
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
      </Card>

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
