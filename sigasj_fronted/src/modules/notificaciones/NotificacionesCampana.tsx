import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  IconAlertTriangle,
  IconBell,
  IconCalendarEvent,
  IconClipboardCheck,
  IconClipboardList,
  IconPackageExport,
  IconTool,
} from '@tabler/icons-react'
import { useAuthUser } from '../auth/hooks/useAuthUser'
import {
  cleanNotificacionTexto,
  formatNotificacionRelativeTime,
  resolveNotificacionMensaje,
  resolveNotificacionVisual,
  type NotificacionVisualKind,
} from './notificacionCampanaUi'
import { rutaNotificacionCampana } from './rutaNotificacionCampana'
import { useNotificacionesAveria } from './useNotificacionesAveria'

function NotificacionIcon({ kind }: { kind: NotificacionVisualKind }) {
  const props = { size: 18, stroke: 1.85, 'aria-hidden': true as const }
  switch (kind) {
    case 'reposicion':
      return <IconAlertTriangle {...props} />
    case 'salida':
      return <IconPackageExport {...props} />
    case 'materiales':
      return <IconClipboardList {...props} />
    case 'ausencia':
      return <IconCalendarEvent {...props} />
    case 'actividad':
      return <IconClipboardCheck {...props} />
    case 'averia':
      return <IconTool {...props} />
    default:
      return <IconBell {...props} />
  }
}

const NotificacionesCampana = () => {
  const panelId = useId()
  const user = useAuthUser()
  const { listado, loading, error, recargar, marcarLeida } =
    useNotificacionesAveria()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  const toggle = useCallback(() => {
    setOpen((value) => {
      const next = !value
      if (next) {
        void recargar()
      }
      return next
    })
  }, [recargar])

  const positionPanel = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) {
      return
    }
    const rect = trigger.getBoundingClientRect()
    const gutter = 8
    const viewportWidth = document.documentElement.clientWidth
    const width = Math.min(380, viewportWidth - gutter * 2)
    const left = Math.min(
      Math.max(gutter, rect.right - width),
      Math.max(gutter, viewportWidth - width - gutter),
    )
    setPanelStyle({
      position: 'fixed',
      top: rect.bottom + gutter,
      left,
      width,
      right: 'auto',
      zIndex: 80,
    })
  }, [])

  useLayoutEffect(() => {
    if (!open) {
      return undefined
    }
    positionPanel()
    window.addEventListener('resize', positionPanel)
    window.addEventListener('scroll', positionPanel, true)
    return () => {
      window.removeEventListener('resize', positionPanel)
      window.removeEventListener('scroll', positionPanel, true)
    }
  }, [open, positionPanel])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }
      if (
        containerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return
      }
      close()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [close, open])

  const unread = listado.noLeidas

  const renderItemContent = (item: (typeof listado.data)[number]): ReactNode => {
    const visual = resolveNotificacionVisual(item.tipo)
    const titulo = cleanNotificacionTexto(item.titulo)
    const mensaje = resolveNotificacionMensaje(item.titulo, item.mensaje)
    const timeLabel = formatNotificacionRelativeTime(item.fechaCreacion)

    return (
      <>
        <span
          className={`notificaciones-campana__icon notificaciones-campana__icon--${visual.tone}`}
          data-kind={visual.kind}
        >
          <NotificacionIcon kind={visual.kind} />
        </span>
        <span className="notificaciones-campana__body">
          <span className="notificaciones-campana__title-row">
            {!item.leida ? (
              <span
                className="notificaciones-campana__dot"
                aria-hidden="true"
              />
            ) : null}
            <span className="notificaciones-campana__title">{titulo}</span>
          </span>
          {mensaje ? (
            <span className="notificaciones-campana__message">{mensaje}</span>
          ) : null}
          {timeLabel ? (
            <span className="notificaciones-campana__meta">{timeLabel}</span>
          ) : null}
        </span>
      </>
    )
  }

  const panel = (
    <div
      ref={panelRef}
      id={panelId}
      className="notificaciones-campana__panel"
      hidden={!open}
      role="region"
      aria-label="Notificaciones internas"
      style={open ? panelStyle : undefined}
    >
      <header className="notificaciones-campana__head">
        <div>
          <p className="notificaciones-campana__head-title">Notificaciones</p>
          <p className="notificaciones-campana__head-sub">
            {unread > 0
              ? `${unread} sin leer`
              : 'Al día con su bandeja'}
          </p>
        </div>
        {unread > 0 ? (
          <span className="notificaciones-campana__head-badge">{unread}</span>
        ) : null}
      </header>

      {loading ? (
        <p className="notificaciones-campana__state">Cargando notificaciones…</p>
      ) : null}
      {!loading && error ? (
        <p className="notificaciones-campana__state notificaciones-campana__state--error">
          No se pudieron cargar las notificaciones.
        </p>
      ) : null}
      {!loading && !error && listado.data.length === 0 ? (
        <div className="notificaciones-campana__empty">
          <span className="notificaciones-campana__empty-icon" aria-hidden="true">
            <IconBell size={22} stroke={1.7} />
          </span>
          <p className="notificaciones-campana__state">No hay notificaciones.</p>
        </div>
      ) : null}
      {!loading && !error && listado.data.length > 0 ? (
        <ul className="notificaciones-campana__list">
          {listado.data.map((item) => {
            const to = rutaNotificacionCampana(user, item)
            const markAndClose = () => {
              if (!item.leida) {
                void marcarLeida(item.id)
              }
              close()
            }
            return (
              <li
                key={item.id}
                className={
                  item.leida
                    ? 'notificaciones-campana__item'
                    : 'notificaciones-campana__item notificaciones-campana__item--unread'
                }
              >
                {to ? (
                  <Link
                    className="notificaciones-campana__link"
                    to={to}
                    onClick={markAndClose}
                  >
                    {renderItemContent(item)}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="notificaciones-campana__link notificaciones-campana__link--static"
                    onClick={markAndClose}
                  >
                    {renderItemContent(item)}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )

  return (
    <div className="notificaciones-campana" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="admin-header__action notificaciones-campana__trigger"
        aria-label={
          unread > 0
            ? `Notificaciones, ${unread} sin leer`
            : 'Notificaciones'
        }
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <IconBell size={20} stroke={1.8} aria-hidden="true" />
        {unread > 0 ? (
          <span className="notificaciones-campana__badge" aria-hidden="true">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>
      {open
        ? mounted
          ? createPortal(panel, document.body)
          : panel
        : null}
    </div>
  )
}

export default NotificacionesCampana
