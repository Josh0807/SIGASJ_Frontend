import type { ReactNode } from 'react'
import { Alert } from '../../../shared/ui/Alert'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { cn } from '../../../shared/ui/cn'
import { formatearFechaHoraAsada } from '../../../shared/utils/fechaAsada'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { listDatosEspecificosDetalle } from '../utils/formatDatosEspecificosDetalle'
import { formatActividadEstado } from '../utils/formatActividadEstado'
import {
  formatActividadFecha,
  formatHoraActividad,
} from '../utils/formatActividadFecha'
import EvidenciaFotoGaleria from './EvidenciaFotoGaleria'

type DetalleActividadProps = {
  actividad: ActividadFontaneroRegistrada | null
  loading?: boolean
  error?: string | null
  showFontanero?: boolean
  onBack?: () => void
  backLabel?: string
  actions?: ReactNode
  /** `page` reparte los bloques en rejilla en pantallas anchas. */
  variant?: 'overlay' | 'page'
  /** En overlay el marco lo pone el modal; evita tarjeta anidada. */
  flush?: boolean
}

const revisionLabel = (actividad: ActividadFontaneroRegistrada) =>
  actividad.estadoRevision === 'REVISADA' || actividad.estado === 'REVISADA'
    ? 'Revisada'
    : 'Pendiente de revisión'

const revisionKey = (actividad: ActividadFontaneroRegistrada) =>
  revisionLabel(actividad) === 'Revisada' ? 'REVISADA' : 'PENDIENTE'

const estadoPillClass = (estado: string) => {
  const upper = estado.toUpperCase()
  if (upper === 'REVISADA' || upper === 'APROBADA') {
    return 'border-emerald-200/90 bg-emerald-50 text-emerald-900'
  }
  if (upper === 'REQUIERE_CORRECCION' || upper === 'BORRADOR' || upper === 'PENDIENTE') {
    return 'border-amber-200/90 bg-amber-50 text-amber-950'
  }
  if (upper === 'RECHAZADA') {
    return 'border-rose-200/90 bg-rose-50 text-rose-900'
  }
  if (upper === 'REPORTADA' || upper === 'EN_REVISION') {
    return 'border-sky-200/90 bg-sky-50 text-sky-950'
  }
  return 'border-sigasj-border bg-sigasj-surface-soft text-sigasj-ink'
}

const estadoDotClass = (estado: string) => {
  const upper = estado.toUpperCase()
  if (upper === 'REVISADA' || upper === 'APROBADA') return 'bg-emerald-500'
  if (upper === 'REQUIERE_CORRECCION' || upper === 'BORRADOR' || upper === 'PENDIENTE') {
    return 'bg-amber-500'
  }
  if (upper === 'RECHAZADA') return 'bg-rose-500'
  if (upper === 'REPORTADA' || upper === 'EN_REVISION') return 'bg-sky-500'
  return 'bg-sigasj-muted'
}

const formatInicio = (actividad: ActividadFontaneroRegistrada) => {
  const fecha = formatActividadFecha(actividad.fechaActividad)
  const hora = formatHoraActividad(actividad.horaInicio)
  if (fecha === '—' && hora === '—') return 'Sin registrar'
  if (hora === '—') return fecha
  return `${fecha} · ${hora}`
}

const formatFin = (actividad: ActividadFontaneroRegistrada) => {
  if (!actividad.fechaFin && !actividad.horaFin) return 'Sin registrar'
  const fecha = actividad.fechaFin
    ? formatActividadFecha(actividad.fechaFin)
    : '—'
  const hora = formatHoraActividad(actividad.horaFin)
  if (hora === '—') return fecha
  if (fecha === '—') return hora
  return `${fecha} · ${hora}`
}

const DetalleCampo = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className="grid gap-1 py-3 min-[761px]:grid-cols-[minmax(7.5rem,30%)_minmax(0,1fr)] min-[761px]:items-baseline min-[761px]:gap-5 min-[761px]:py-3.5">
    <dt className="text-[0.84rem] font-semibold leading-snug text-sigasj-muted">
      {label}
    </dt>
    <dd className="m-0 break-words text-[0.98rem] font-semibold leading-snug text-sigasj-ink">
      {children}
    </dd>
  </div>
)

const StatusPill = ({
  label,
  estadoKey,
}: {
  label: string
  estadoKey: string
}) => (
  <span
    className={cn(
      'inline-flex min-h-8 items-center gap-2 rounded-full border px-3 py-1 text-[0.72rem] font-bold tracking-[0.01em]',
      estadoPillClass(estadoKey),
    )}
  >
    <span
      className={cn('size-1.5 rounded-full', estadoDotClass(estadoKey))}
      aria-hidden="true"
    />
    {label}
  </span>
)

const SectionBlock = ({
  id,
  title,
  children,
  dataAdminStagger,
}: {
  id: string
  title: string
  children: ReactNode
  dataAdminStagger?: boolean
}) => (
  <section
    aria-labelledby={id}
    data-admin-stagger={dataAdminStagger ? '' : undefined}
  >
    <h3
      id={id}
      className="m-0 border-b border-sigasj-border px-4 pb-2 pt-4 font-['Times_New_Roman',Times,serif] text-[1.02rem] font-bold tracking-[-0.02em] text-sigasj-text sm:px-6 sm:pt-5 sm:text-[1.05rem]"
    >
      {title}
    </h3>
    {children}
  </section>
)

const DetalleActividad = ({
  actividad,
  loading = false,
  error = null,
  showFontanero = false,
  onBack,
  backLabel = 'Volver al listado',
  actions,
  variant = 'overlay',
  flush = false,
}: DetalleActividadProps) => {
  const datos = listDatosEspecificosDetalle(actividad?.datosEspecificos)
  const isPage = variant === 'page'

  if (loading) {
    return (
      <Card padded role="status" aria-busy="true" className="!p-5">
        <p className="m-0 font-semibold text-sigasj-muted">
          Cargando el detalle de la actividad…
        </p>
        <div className="mt-3 grid gap-3" aria-hidden="true">
          <div className="h-12 animate-pulse rounded-xl bg-sigasj-surface-soft motion-reduce:animate-none" />
          <div className="h-24 animate-pulse rounded-xl bg-sigasj-surface-soft motion-reduce:animate-none" />
        </div>
      </Card>
    )
  }

  if (error || !actividad) {
    return (
      <div className="grid gap-3">
        <Alert tone="warning" role="alert">
          {error || ACTIVITY_FEEDBACK_MESSAGES.notFound}
        </Alert>
        {onBack ? (
          <Button type="button" variant="secondary" size="sm" onClick={onBack}>
            {backLabel}
          </Button>
        ) : null}
      </div>
    )
  }

  const revisada = revisionLabel(actividad) === 'Revisada'
  const estadoLabel = formatActividadEstado(actividad.estado)
  const estadoRevisionLabel = revisionLabel(actividad)
  const estadosDuplicados =
    estadoLabel.toLocaleLowerCase('es') ===
    estadoRevisionLabel.toLocaleLowerCase('es')
  const documentos = actividad.documentos ?? []
  const [datoPrincipal, ...datosRestantes] = datos
  const tipo =
    actividad.tipoActividadNombre?.trim() || 'Tipo no indicado'
  const titulo =
    actividad.titulo?.trim() || tipo
  const revisadoPor =
    actividad.revisadoPorId != null && String(actividad.revisadoPorId).trim()
      ? `Usuario #${actividad.revisadoPorId}`
      : null

  const shellClass = flush
    ? 'min-w-0'
    : 'min-w-0 overflow-hidden rounded-[13px] border border-sigasj-border bg-white shadow-[0_12px_28px_rgba(18,63,112,0.07)]'

  return (
    <div className={cn('grid w-full min-w-0 gap-4', isPage && 'admin-content-modern')}>
      <article className={shellClass} aria-labelledby="detalle-actividad-title">
        <header
          className="border-b border-sigasj-border px-4 py-4 sm:px-6 sm:py-5"
          data-admin-stagger=""
        >
          <div className="flex flex-wrap items-start justify-between gap-3 pr-12">
            <div className="min-w-0 max-w-[38rem]">
              <h2
                id="detalle-actividad-title"
                className="m-0 font-['Times_New_Roman',Times,serif] text-[clamp(1.3rem,5vw,1.9rem)] font-bold leading-[1.12] tracking-[-0.03em] text-sigasj-text"
              >
                {titulo}
              </h2>
              <p className="m-0 mt-2 text-[0.9rem] font-medium leading-snug text-sigasj-muted sm:text-[0.95rem]">
                {tipo}
                <span aria-hidden="true"> · </span>
                Actividad N.º {actividad.id}
              </p>
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
              {!estadosDuplicados ? (
                <StatusPill label={estadoLabel} estadoKey={actividad.estado} />
              ) : null}
              <StatusPill
                label={estadoRevisionLabel}
                estadoKey={revisionKey(actividad)}
              />
            </div>
          </div>
        </header>

        <SectionBlock id="detalle-info-general" title="Datos de la actividad" dataAdminStagger>
          <dl className="m-0 divide-y divide-sigasj-border px-4 sm:px-6">
            <DetalleCampo label="Tipo">{tipo}</DetalleCampo>
            <DetalleCampo label="Inicio">{formatInicio(actividad)}</DetalleCampo>
            <DetalleCampo label="Fin">{formatFin(actividad)}</DetalleCampo>
            {showFontanero ? (
              <DetalleCampo label="Fontanero">
                {actividad.fontaneroNombre?.trim() ||
                  (actividad.fontaneroId
                    ? `Usuario #${actividad.fontaneroId}`
                    : 'Sin asignar')}
              </DetalleCampo>
            ) : null}
            <DetalleCampo label="Estado">{estadoLabel}</DetalleCampo>
            <DetalleCampo label="Revisión">{estadoRevisionLabel}</DetalleCampo>
            {actividad.fechaRegistro || actividad.createdAt ? (
              <DetalleCampo label="Registrada">
                {formatearFechaHoraAsada(
                  actividad.fechaRegistro || actividad.createdAt,
                )}
              </DetalleCampo>
            ) : null}
            {revisada && actividad.fechaRevision ? (
              <DetalleCampo label="Revisada">
                {formatearFechaHoraAsada(actividad.fechaRevision)}
              </DetalleCampo>
            ) : null}
            {revisada && revisadoPor ? (
              <DetalleCampo label="Revisó">{revisadoPor}</DetalleCampo>
            ) : null}
          </dl>
        </SectionBlock>

        <SectionBlock id="detalle-contexto" title="Detalle del trabajo" dataAdminStagger>
          <dl className="m-0 divide-y divide-sigasj-border px-4 sm:px-6">
            <DetalleCampo label="Descripción">
              {actividad.descripcion?.trim() || 'Sin descripción'}
            </DetalleCampo>
            <DetalleCampo label="Ubicación">
              {actividad.ubicacion?.trim() || 'Sin ubicación'}
            </DetalleCampo>
            {datoPrincipal ? (
              <DetalleCampo label={datoPrincipal.label}>
                {datoPrincipal.value}
              </DetalleCampo>
            ) : null}
            <DetalleCampo label="Observaciones">
              {actividad.observaciones?.trim() || 'Sin observaciones'}
            </DetalleCampo>
            {datosRestantes.map((dato) => (
              <DetalleCampo key={dato.label} label={dato.label}>
                {dato.value}
              </DetalleCampo>
            ))}
          </dl>
        </SectionBlock>

        {actividad.observacionCorreccion ? (
          <div className="border-t border-sigasj-border px-4 py-4 sm:px-6" data-admin-stagger="">
            <Alert tone="warning" title="Corrección solicitada">
              {actividad.observacionCorreccion}
            </Alert>
          </div>
        ) : null}

        <SectionBlock id="detalle-evidencia" title="Fotos de evidencia" dataAdminStagger>
          <div className="px-4 py-4 sm:px-6">
            <EvidenciaFotoGaleria
              documentos={documentos}
              actividadId={actividad.id}
              emptyLabel="No hay fotos adjuntas en esta actividad."
            />
          </div>
        </SectionBlock>
      </article>

      {onBack || actions ? (
        <footer className="flex flex-wrap items-center justify-end gap-2">
          {actions}
          {onBack ? (
            <Button type="button" variant="secondary" size="sm" onClick={onBack}>
              {backLabel}
            </Button>
          ) : null}
        </footer>
      ) : null}
    </div>
  )
}

export default DetalleActividad
