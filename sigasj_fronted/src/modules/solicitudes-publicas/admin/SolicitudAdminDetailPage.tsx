import {
  IconAlertCircle,
  IconArrowLeft,
  IconBuilding,
  IconCalendar,
  IconClipboardText,
  IconFileDescription,
  IconHome,
  IconMail,
  IconMessage2,
  IconPencil,
  IconPhone,
  IconRefresh,
  IconUser,
} from '@tabler/icons-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
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
import {
  groupPresentedFormSections,
  presentSolicitudForm,
  type PresentedFormField,
  type PresentedFormSectionId,
} from './solicitudFormPresentation'
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
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return 'No indicado'
    }
  }
  return String(value)
}

const sectionIcon = (id: PresentedFormSectionId): ReactNode => {
  if (id === 'solicitante') return <IconUser size={20} aria-hidden="true" />
  if (id === 'inmueble') return <IconHome size={20} aria-hidden="true" />
  if (id === 'contacto') return <IconPhone size={20} aria-hidden="true" />
  if (id === 'firma') return <IconPencil size={20} aria-hidden="true" />
  return <IconBuilding size={20} aria-hidden="true" />
}

const fieldIcon = (key: string): ReactNode | null => {
  const normalized = key.toLowerCase()
  if (normalized.includes('telefono')) return <IconPhone size={15} aria-hidden="true" />
  if (normalized.includes('correo') || normalized.includes('mail') || normalized.includes('notific')) {
    return <IconMail size={15} aria-hidden="true" />
  }
  return null
}

const cardClass =
  'flex h-full flex-col rounded-2xl border border-[color:var(--asada-line,#d7e5f1)] bg-white p-4 shadow-[0_8px_20px_rgba(18,63,112,0.06)] sm:rounded-3xl sm:p-5'

const FieldRow = ({ field }: { field: PresentedFormField }) => {
  const icon = fieldIcon(field.key)
  const isImage =
    typeof field.value === 'string' && field.value.startsWith('data:image/')

  return (
    <div className="grid gap-1.5 border-b border-[color:var(--asada-line,#d7e5f1)] py-2.5 last:border-b-0 sm:grid-cols-[minmax(8.5rem,36%)_minmax(0,1fr)] sm:items-baseline sm:gap-3">
      <dt className="text-sm font-semibold text-[color:var(--asada-muted,#5b7390)]">
        {field.label}
      </dt>
      <dd className="m-0 flex min-w-0 items-start gap-2 break-words text-[0.95rem] font-bold leading-5 text-[color:var(--asada-ink,#123f70)]">
        {icon ? (
          <span className="mt-0.5 text-[color:var(--asada-navy,#1e5a9c)]">{icon}</span>
        ) : null}
        {isImage ? (
          <img
            className="max-h-28 max-w-full rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-slate-50 p-2 object-contain"
            src={field.value as string}
            alt={field.label}
          />
        ) : (
          displayValue(field.value)
        )}
      </dd>
    </div>
  )
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

  const formSections = useMemo(
    () => groupPresentedFormSections(formEntries, detail?.tipoSolicitud?.slug),
    [detail?.tipoSolicitud?.slug, formEntries],
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
  const documentosCard = (
    <section className={cardClass} aria-labelledby="documents-title">
      <h2
        className="m-0 flex items-center gap-2 text-lg font-black text-[color:var(--asada-ink,#123f70)]"
        id="documents-title"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-[color:var(--asada-ice,#eaf6ff)] text-[color:var(--asada-navy,#1e5a9c)]">
          <IconFileDescription size={20} aria-hidden="true" />
        </span>
        Documentos adjuntos
        <span className="rounded-full bg-[color:var(--asada-ice,#eaf6ff)] px-2.5 py-1 text-xs font-bold text-[color:var(--asada-navy,#1e5a9c)]">
          {documentosCount}
        </span>
      </h2>
      {documentosCount ? (
        <ul className="mb-0 mt-4 grid list-none gap-3 p-0">
          {(detail.documentos ?? []).map((document) => (
            <li
              className="min-w-0 rounded-2xl border border-[color:var(--asada-line,#d7e5f1)] bg-[#f3f9ff] p-4"
              key={document.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[color:var(--asada-navy,#1e5a9c)] shadow-sm">
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
  )

  return (
    <main className="admin-content-modern grid min-w-0 gap-4 sm:gap-5">
      <Link
        className="group inline-flex min-h-11 w-fit items-center gap-2.5 rounded-2xl border border-[#bfe3fa] bg-white px-4 py-2.5 text-sm font-extrabold text-[color:var(--asada-navy,#1e5a9c)] no-underline shadow-[0_6px_18px_rgba(30,90,156,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-[color:var(--asada-ice,#eaf6ff)] hover:no-underline"
        to={SOLICITUDES_ADMIN_TRAMITES_PATH}
      >
        <IconArrowLeft
          className="transition-transform group-hover:-translate-x-1"
          size={17}
        />{' '}
        Volver a trámites
      </Link>

      <header className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[color:var(--asada-navy,#1e5a9c)]">
              Solicitudes · Detalle
            </p>
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
          <div className="flex gap-3 rounded-xl bg-[#eaf6ff] p-3.5">
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
          <div className="flex gap-3 rounded-xl bg-[#eaf6ff] p-3.5">
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
          <div className="flex gap-3 rounded-xl bg-[#eaf6ff] p-3.5">
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

      {formSections.length || adminEntries.length ? (
        (() => {
          const sectionById = Object.fromEntries(
            formSections.map((section) => [section.id, section]),
          )
          const renderFormSection = (sectionId: PresentedFormSectionId) => {
            const section = sectionById[sectionId]
            if (!section) return null
            return (
              <section
                key={section.id}
                className={cardClass}
                aria-labelledby={`form-section-${section.id}`}
              >
                <h2
                  className="m-0 flex shrink-0 items-center gap-2.5 border-b border-[color:var(--asada-line,#d7e5f1)] pb-2.5 text-base font-black tracking-tight text-[color:var(--asada-ink,#123f70)] sm:text-lg"
                  id={`form-section-${section.id}`}
                >
                  <span className="grid size-8 place-items-center rounded-xl bg-[color:var(--asada-ice,#eaf6ff)] text-[color:var(--asada-navy,#1e5a9c)] sm:size-9">
                    {sectionIcon(section.id)}
                  </span>
                  {section.title}
                </h2>
                <dl className="m-0 min-h-0 flex-1">
                  {section.fields.map((field) => (
                    <FieldRow key={field.key} field={field} />
                  ))}
                </dl>
              </section>
            )
          }

          const adminCard =
            adminEntries.length > 0 ? (
              <section
                key="campos-administrativos"
                className={cardClass}
                aria-labelledby="admin-summary-title"
              >
                <h2
                  className="m-0 flex shrink-0 items-center gap-2.5 border-b border-[color:var(--asada-line,#d7e5f1)] pb-2.5 text-base font-black tracking-tight text-[color:var(--asada-ink,#123f70)] sm:text-lg"
                  id="admin-summary-title"
                >
                  <span className="grid size-8 place-items-center rounded-xl bg-[color:var(--asada-ice,#eaf6ff)] text-[color:var(--asada-navy,#1e5a9c)] sm:size-9">
                    <IconBuilding size={20} aria-hidden="true" />
                  </span>
                  Campos administrativos
                </h2>
                <dl className="m-0 min-h-0 flex-1">
                  {adminEntries.map(([key, value]) => (
                    <FieldRow
                      key={key}
                      field={{ key, label: labelFor(key), value }}
                    />
                  ))}
                </dl>
              </section>
            ) : null

          const pairRow = (...cells: Array<ReactNode | null>) => {
            const visible = cells.filter(Boolean)
            if (visible.length === 0) return null
            return (
              <div className="grid gap-3 lg:grid-cols-2 lg:items-stretch">
                {visible}
              </div>
            )
          }

          const otrosSection = sectionById.otros
          const otrosFullWidth = Boolean(
            otrosSection && otrosSection.fields.length > 4,
          )

          return (
            <div className="grid gap-3">
              {pairRow(
                renderFormSection('solicitante'),
                renderFormSection('inmueble'),
              )}
              {pairRow(renderFormSection('contacto'), adminCard)}
              {pairRow(renderFormSection('firma'), documentosCard)}
              {!otrosFullWidth ? renderFormSection('otros') : null}
              {otrosFullWidth ? (
                <section
                  className={cardClass}
                  aria-labelledby="form-section-otros"
                >
                  <h2
                    className="m-0 flex shrink-0 items-center gap-2.5 border-b border-[color:var(--asada-line,#d7e5f1)] pb-2.5 text-base font-black tracking-tight text-[color:var(--asada-ink,#123f70)] sm:text-lg"
                    id="form-section-otros"
                  >
                    <span className="grid size-8 place-items-center rounded-xl bg-[color:var(--asada-ice,#eaf6ff)] text-[color:var(--asada-navy,#1e5a9c)] sm:size-9">
                      {sectionIcon('otros')}
                    </span>
                    {otrosSection!.title}
                  </h2>
                  <dl className="m-0 min-h-0 flex-1">
                    {otrosSection!.fields.map((field) => (
                      <FieldRow key={field.key} field={field} />
                    ))}
                  </dl>
                </section>
              ) : null}
            </div>
          )
        })()
      ) : (
        <section className={cardClass} aria-labelledby="form-data-title">
          <h2
            className="m-0 text-lg font-black tracking-tight text-[color:var(--asada-ink,#123f70)]"
            id="form-data-title"
          >
            Datos del formulario
          </h2>
          <p className="mb-0 mt-4 text-[color:var(--asada-muted,#5b7390)]">
            No hay datos específicos disponibles.
          </p>
        </section>
      )}

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

      {!(formSections.length || adminEntries.length) ? documentosCard : null}

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
