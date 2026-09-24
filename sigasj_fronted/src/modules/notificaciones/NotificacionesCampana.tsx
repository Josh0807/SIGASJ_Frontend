import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconBell } from '@tabler/icons-react'
import { useAuthUser } from '../auth/hooks/useAuthUser'
import { rutaAveriaNotificacion } from './rutaAveriaNotificacion'
import { useNotificacionesAveria } from './useNotificacionesAveria'

const NotificacionesCampana = () => {
  const panelId = useId()
  const user = useAuthUser()
  const { listado, loading, error, marcarLeida } = useNotificacionesAveria()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node) || !containerRef.current?.contains(target)) {
        close()
      }
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
        onClick={() => setOpen((value) => !value)}
      >
        <IconBell size={20} stroke={1.8} aria-hidden="true" />
        {unread > 0 ? (
          <span className="notificaciones-campana__badge" aria-hidden="true">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      <div
        id={panelId}
        className="notificaciones-campana__panel"
        hidden={!open}
        role="region"
        aria-label="Notificaciones internas"
      >
        {loading ? (
          <p className="notificaciones-campana__state">Cargando notificaciones…</p>
        ) : null}
        {!loading && error ? (
          <p className="notificaciones-campana__state notificaciones-campana__state--error">
            No se pudieron cargar las notificaciones.
          </p>
        ) : null}
        {!loading && !error && listado.data.length === 0 ? (
          <p className="notificaciones-campana__state">No hay notificaciones.</p>
        ) : null}
        {!loading && !error && listado.data.length > 0 ? (
          <ul className="notificaciones-campana__list">
            {listado.data.map((item) => {
              const to = rutaAveriaNotificacion(user, item.idAveria)
              const content = (
                <>
                  <span className="notificaciones-campana__title">{item.titulo}</span>
                  <span className="notificaciones-campana__message">{item.mensaje}</span>
                </>
              )
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
                      onClick={() => {
                        if (!item.leida) {
                          void marcarLeida(item.id)
                        }
                        close()
                      }}
                    >
                      {content}
                    </Link>
                  ) : (
                    <span className="notificaciones-campana__link notificaciones-campana__link--static">
                      {content}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

export default NotificacionesCampana
