import {
  IconAlertCircle,
  IconArrowLeft,
  IconCalendar,
  IconClipboardText,
  IconFileDescription,
  IconMessage2,
  IconRefresh,
} from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatearFechaHoraAsada } from '../../../shared/utils/fechaAsada'
import { useAuth } from '../../auth/components/AuthContext'
import { userHasAllowedRole } from '../../auth/utils/adminNavigation'
import CambiarEstadoSolicitudSection from './CambiarEstadoSolicitudSection'
import SolicitudDocumentoActions from './SolicitudDocumentoActions'
import SolicitudEstadoBadge from './SolicitudEstadoBadge'
import SolicitudHistorialTimeline from './SolicitudHistorialTimeline'
import {
  getHistorialSolicitudAdmin,
  getSolicitudAdminDetail,
  solicitudesAdminError,
} from './solicitudesAdminApi'
import { SOLICITUDES_ADMIN_TRAMITES_PATH } from './solicitudesAdminPaths'
import type { HistorialSolicitudEvento } from './solicitudesAdminTypes'
import { presentSolicitudForm } from './solicitudFormPresentation'
import type { SolicitudEstado } from '../types'
import type { SolicitudAdminDetail } from './types'
import { useSolicitudesAdminSecurity } from './useSolicitudesAdminSecurity'

const ROLES_CAMBIO_ESTADO = ['Administradora', 'Secretaria'] as const

const ADMIN_KEYS_REDUNDANTES = new Set([
  'estado',
  'estadoactual',
  'codigo',
  'codigoseguimiento',
  'fechaingreso',
  'fecharesolucion',
  'totaldocumentos',
  'totaleventoshistorial',
  'plazoseleccionado',
  'montoprimainicial',
  'numerocuentaservicio',
  'primainicial',
  'telefono',
  'nombre',
  'nombrecompleto',
  'identificacion',
  'cedula',
  'vecinode',
  'lugarderresidencia',
])

const formatBytes = (bytes?: number) => {
  if (bytes == null) return 'Tamaño no indicado'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const labelFor = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .replace(/^./, (letter) => letter.toUpperCase())

const isIsoDateString = (value: string) =>
  /^\d{4}-\d{2}-\d{2}T/.test(value) || /^\d{4}-\d{2}-\d{2}$/.test(value)

const displayValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return 'No indicado'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Intl.NumberFormat('es-CR').format(value)
  }
  if (typeof value === 'string') {
    if (isIsoDateString(value)) return formatearFechaHoraAsada(value)
    if (/^\d+(\.\d+)?$/.test(value.trim())) {
      const asNumber = Number(value)
      if (Number.isFinite(asNumber)) {
        return new Intl.NumberFormat('es-CR').format(asNumber)
      }
    }
    return value
  }
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default function SolicitudAdminDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const numericId = Number(id)
  const invalidId = !Number.isInteger(numericId) || numericId <= 0
  const puedeCambiarEstado = userHasAllowedRole(user, ROLES_CAMBIO_ESTADO)
  const [detail, setDetail] = useState<SolicitudAdminDetail | null>(null)
  const [error, setError] = useState(
    invalidId ? 'El identificador de la solicitud no es válido.' : '',
  )
  const [loading, setLoading] = useState(!invalidId)
  const [refresh, setRefresh] = useState(0)
  const [recargaHistorial, setRecargaHistorial] = useState(0)
  const [exitoEstado, setExitoEstado] = useState<string | null>(null)
  const [historial, setHistorial] = useState<{
    clave: string
    eventos: HistorialSolicitudEvento[]
    error: string | null
  }>({ clave: '', eventos: [], error: null })
  const handleSecurityError = useSolicitudesAdminSecurity()
  const claveHistorial = `${numericId}:${recargaHistorial}`
  const cargandoHistorial =
    !invalidId && historial.clave !== claveHistorial && !error && Boolean(detail)

  useEffect(() => {
    if (invalidId) return
    const controller = new AbortController()
    getSolicitudAdminDetail(numericId, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) setDetail(response)
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted || handleSecurityError(caught)) return
        setError(solicitudesAdminError(caught, 'No fue posible cargar el detalle.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [numericId, invalidId, refresh, handleSecurityError])

  useEffect(() => {
    if (invalidId || !detail) return undefined
    const controller = new AbortController()
    getHistorialSolicitudAdmin(numericId, controller.signal)
      .then((eventos) => {
        if (controller.signal.aborted) return
        setHistorial({
          clave: claveHistorial,
          eventos,
          error: null,
        })
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted || handleSecurityError(caught)) return
        const message = caught instanceof Error ? caught.message : ''
        setHistorial({
          clave: claveHistorial,
          eventos: [],
          error: message.includes('HTTP 403')
            ? 'No tiene permiso para ver el historial.'
            : 'No fue posible cargar el historial.',
        })
      })
    return () => controller.abort()
  }, [claveHistorial, detail, handleSecurityError, invalidId, numericId])

  const formEntries = useMemo(
    () =>
      detail
        ? presentSolicitudForm(detail.tipoSolicitud?.slug, detail.detalleFormulario)
        : [],
    [detail],
  )

  const adminEntries = useMemo(() => {
    if (!detail) return []
    return Object.entries(detail.camposAdministrativos ?? {}).filter(([key]) => {
      const normalized = key.toLowerCase().replace(/[\s_-]/g, '')
      return !ADMIN_KEYS_REDUNDANTES.has(normalized)
    })
  }, [detail])

  if (loading) {
    return (
      <main className="admin-content-modern grid min-h-80 place-items-center" role="status">
        <span className="font-bold text-[color:var(--asada-muted,#5b7390)]">
          <span className="mx-auto mb-3 block size-10 animate-spin rounded-full border-4 border-[color:var(--asada-line,#d7e5f1)] border-t-[color:var(--asada-navy,#1e5a9c)]" />
          Cargando detalle…
        </span>
      </main>
    )
  }

  if (error || !detail) {
    return (
      <main className="admin-content-modern grid min-h-80 place-items-center">
        <section
          className="max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"
          role="alert"
        >
          <IconAlertCircle className="mx-auto text-red-600" size={42} />
          <h1 className="mb-0 mt-3 text-2xl font-black text-red-900">
            No se pudo abrir la solicitud
          </h1>
          <p className="mb-0 mt-3 text-red-800">{error}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 font-bold text-slate-700 no-underline"
              to={SOLICITUDES_ADMIN_TRAMITES_PATH}
            >
              <IconArrowLeft size={18} /> Volver
            </Link>
            <button
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-0 bg-red-700 px-4 font-bold text-white"
              onClick={() => {
                setLoading(true)
                setError('')
                setRefresh((value) => value + 1)
              }}
            >
              <IconRefresh size={18} /> Reintentar
            </button>
          </div>
        </section>
      </main>
    )
  }

  const documentosCount = detail.documentos?.length ?? 0
  const tipoNombre =
    detail.tipoSolicitud?.nombre ?? detail.tipoSolicitud?.slug ?? 'Solicitud'

  return (
    <main className="admin-content-modern grid min-w-0 gap-4">
      <Link
        className="inline-flex min-h-10 w-fit items-center gap-2 rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-white px-3.5 text-sm font-bold text-[color:var(--asada-navy,#1e5a9c)] no-underline transition hover:bg-[color:var(--asada-ice,#eaf6ff)]"
        to={SOLICITUDES_ADMIN_TRAMITES_PATH}
      >
        <IconArrowLeft size={17} /> Volver a trámites
      </Link>

      <header className="rounded-2xl border border-[color:var(--asada-line,#d7e5f1)] bg-[color:var(--asada-surface,#fff)] p-5 shadow-[0_12px_28px_rgba(18,63,112,0.07)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="m-0 break-all text-[clamp(1.45rem,3vw,2rem)] font-black tracking-[-0.03em] text-[color:var(--asada-ink,#123f70)]">
              {detail.codigoSeguimiento}
            </h1>
            <p className="mb-0 mt-2 text-base font-semibold text-[color:var(--asada-muted,#5b7390)]">
              {tipoNombre}
            </p>
          </div>
          <SolicitudEstadoBadge estado={detail.estado} />
        </div>

        <dl className="mt-5 grid gap-3 border-t border-[color:var(--asada-line,#d7e5f1)] pt-5 sm:grid-cols-3">
          <div className="flex gap-3 rounded-xl bg-[color:var(--asada-ice,#eaf6ff)]/70 p-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[color:var(--asada-navy,#1e5a9c)]">
              <IconCalendar size={18} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <dt className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-[color:var(--asada-muted,#5b7390)]">
                Ingreso
              </dt>
              <dd className="m-0 mt-1 text-sm font-bold text-[color:var(--asada-ink,#123f70)]">
                {formatearFechaHoraAsada(detail.fechaIngreso)}
              </dd>
            </span>
          </div>
          <div className="flex gap-3 rounded-xl bg-[color:var(--asada-ice,#eaf6ff)]/70 p-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[color:var(--asada-navy,#1e5a9c)]">
              <IconClipboardText size={18} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <dt className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-[color:var(--asada-muted,#5b7390)]">
                Resolución
              </dt>
              <dd className="m-0 mt-1 text-sm font-bold text-[color:var(--asada-ink,#123f70)]">
                {detail.fechaResolucion
                  ? formatearFechaHoraAsada(detail.fechaResolucion)
                  : 'Pendiente'}
              </dd>
            </span>
          </div>
          <div className="flex gap-3 rounded-xl bg-[color:var(--asada-ice,#eaf6ff)]/70 p-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[color:var(--asada-navy,#1e5a9c)]">
              <IconMessage2 size={18} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <dt className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-[color:var(--asada-muted,#5b7390)]">
                Observaciones
              </dt>
              <dd className="m-0 mt-1 text-sm font-bold text-[color:var(--asada-ink,#123f70)]">
                {detail.observaciones || 'Sin observaciones'}
              </dd>
            </span>
          </div>
        </dl>
      </header>

      <section
        className="rounded-2xl border border-[color:var(--asada-line,#d7e5f1)] bg-white p-5 shadow-[0_10px_24px_rgba(18,63,112,0.06)] sm:p-6"
        aria-labelledby="form-data-title"
      >
        <h2
          className="m-0 text-lg font-black tracking-[-0.02em] text-[color:var(--asada-ink,#123f70)]"
          id="form-data-title"
        >
          Datos del formulario
        </h2>
        {formEntries.length ? (
          <dl className="mt-4 grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {formEntries.map(({ key, label, value }) => (
              <div
                className="min-w-0 border-b border-[color:var(--asada-line,#d7e5f1)] py-3.5"
                key={key}
              >
                <dt className="text-xs font-bold uppercase tracking-[0.05em] text-[color:var(--asada-muted,#5b7390)]">
                  {label}
                </dt>
                <dd className="m-0 mt-1.5 break-words text-[0.95rem] font-semibold leading-6 text-[color:var(--asada-ink,#123f70)]">
                  {typeof value === 'string' && value.startsWith('data:image/') ? (
                    <img
                      className="max-h-28 max-w-full rounded-lg border bg-white p-2 object-contain"
                      src={value}
                      alt={label}
                    />
                  ) : (
                    displayValue(value)
                  )}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mb-0 mt-4 text-[color:var(--asada-muted,#5b7390)]">
            No hay datos específicos disponibles.
          </p>
        )}
      </section>

      {adminEntries.length ? (
        <section
          className="rounded-2xl border border-[color:var(--asada-line,#d7e5f1)] bg-white p-5 shadow-[0_10px_24px_rgba(18,63,112,0.06)] sm:p-6"
          aria-labelledby="admin-summary-title"
        >
          <h2
            className="m-0 text-lg font-black tracking-[-0.02em] text-[color:var(--asada-ink,#123f70)]"
            id="admin-summary-title"
          >
            Campos administrativos
          </h2>
          <dl className="mt-4 grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {adminEntries.map(([key, value]) => (
              <div
                className="min-w-0 border-b border-[color:var(--asada-line,#d7e5f1)] py-3.5"
                key={key}
              >
                <dt className="text-xs font-bold uppercase tracking-[0.05em] text-[color:var(--asada-muted,#5b7390)]">
                  {labelFor(key)}
                </dt>
                <dd className="m-0 mt-1.5 break-words text-sm font-bold text-[color:var(--asada-ink,#123f70)]">
                  {displayValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {puedeCambiarEstado ? (
        <div>
          {exitoEstado ? (
            <p
              className="mb-4 mt-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"
              role="status"
            >
              {exitoEstado}
            </p>
          ) : null}
          <CambiarEstadoSolicitudSection
            key={`${detail.id}-${detail.estado}`}
            solicitudId={detail.id}
            estadoActual={detail.estado as SolicitudEstado}
            onUnauthorized={() => handleSecurityError(new Error('HTTP 401'))}
            onConflictOrGone={() => {
              setExitoEstado(null)
              setRefresh((value) => value + 1)
              setRecargaHistorial((value) => value + 1)
            }}
            onSuccess={(response) => {
              const estadoPersistido = response.estado ?? response.estadoNuevo
              setDetail((current) =>
                current && estadoPersistido
                  ? {
                      ...current,
                      estado: estadoPersistido,
                      fechaResolucion: response.fechaResolucion ?? null,
                    }
                  : current,
              )
              setExitoEstado('Estado de la solicitud actualizado correctamente.')
              setRecargaHistorial((value) => value + 1)
            }}
          />
        </div>
      ) : null}

      <section
        className="rounded-2xl border border-[color:var(--asada-line,#d7e5f1)] bg-white p-5 shadow-[0_10px_24px_rgba(18,63,112,0.06)] sm:p-6"
        aria-labelledby="documents-title"
      >
        <h2
          className="m-0 flex items-center gap-2 text-lg font-black text-[color:var(--asada-ink,#123f70)]"
          id="documents-title"
        >
          <IconFileDescription size={20} aria-hidden="true" />
          Documentos adjuntos
          <span className="rounded-full bg-[color:var(--asada-ice,#eaf6ff)] px-2.5 py-1 text-xs font-bold text-[color:var(--asada-navy,#1e5a9c)]">
            {documentosCount}
          </span>
        </h2>
        {documentosCount ? (
          <ul className="mb-0 mt-4 grid list-none gap-3 p-0 md:grid-cols-2">
            {(detail.documentos ?? []).map((document) => (
              <li
                className="min-w-0 rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-[color:color-mix(in_srgb,var(--asada-ice,#eaf6ff)_35%,white)] p-4"
                key={document.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-[color:var(--asada-navy,#1e5a9c)]">
                    <IconFileDescription size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <strong
                      className="block truncate text-[color:var(--asada-ink,#123f70)]"
                      title={document.nombreOriginal}
                    >
                      {document.nombreOriginal}
                    </strong>
                    <small className="text-[color:var(--asada-muted,#5b7390)]">
                      {document.tipoDocumento} ·{' '}
                      {formatBytes(document.tamano ?? document.tamanio)}
                      {document.mimeType ? ` · ${document.mimeType}` : ''}
                    </small>
                  </span>
                </div>
                <SolicitudDocumentoActions solicitudId={detail.id} document={document} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-0 mt-3 text-[color:var(--asada-muted,#5b7390)]">
            Esta solicitud no tiene documentos adjuntos.
          </p>
        )}
      </section>

      {!puedeCambiarEstado && exitoEstado ? (
        <p
          className="m-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"
          role="status"
        >
          {exitoEstado}
        </p>
      ) : null}

      <SolicitudHistorialTimeline
        eventos={historial.eventos}
        loading={cargandoHistorial}
        error={historial.error}
        onRetry={() => setRecargaHistorial((value) => value + 1)}
      />
    </main>
  )
}
