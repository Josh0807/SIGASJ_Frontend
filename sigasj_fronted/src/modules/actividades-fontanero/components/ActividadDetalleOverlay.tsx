import { useEffect, type ReactNode } from 'react'
import { IconX } from '@tabler/icons-react'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import DetalleActividad from './DetalleActividad'

type ActividadDetalleOverlayProps = {
  actividad: ActividadFontaneroRegistrada | null
  loading?: boolean
  error?: string | null
  showFontanero?: boolean
  closeDisabled?: boolean
  onClose: () => void
  actions?: ReactNode
}

const ActividadDetalleOverlay = ({
  actividad,
  loading = false,
  error = null,
  showFontanero = false,
  closeDisabled = false,
  onClose,
  actions,
}: ActividadDetalleOverlayProps) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !closeDisabled) {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeDisabled, onClose])

  if (!actividad && !loading && !error) {
    return null
  }

  return (
    <div
      className="actividades-admin-revision__overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closeDisabled) {
          onClose()
        }
      }}
    >
      <div
        className="actividades-admin-revision__detail"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de la actividad"
      >
        <button
          type="button"
          className="actividad-detalle-overlay__close"
          onClick={onClose}
          disabled={closeDisabled}
          aria-label="Cerrar"
        >
          <IconX size={22} aria-hidden="true" />
        </button>
        <div className="actividades-admin-revision__detail-scroll">
          <DetalleActividad
            actividad={actividad}
            loading={loading}
            error={error}
            showFontanero={showFontanero}
            actions={actions}
          />
        </div>
      </div>
    </div>
  )
}

export default ActividadDetalleOverlay
