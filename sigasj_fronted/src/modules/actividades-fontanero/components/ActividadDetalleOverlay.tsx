import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { IconX } from '@tabler/icons-react'
import { Button } from '../../../shared/ui/Button'
import { prefersReducedMotion } from '../../../shared/ui/adminMotion'
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
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const { body } = document
    const scrollbar = window.innerWidth - html.clientWidth
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    }

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (scrollbar > 0) {
      body.style.paddingRight = `${scrollbar}px`
    }

    closeRef.current?.focus({ preventScroll: true })

    return () => {
      html.style.overflow = previous.htmlOverflow
      body.style.overflow = previous.bodyOverflow
      body.style.paddingRight = previous.bodyPaddingRight
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

  useEffect(() => {
    const backdrop = backdropRef.current
    const panel = panelRef.current
    if (!backdrop || !panel) return

    if (prefersReducedMotion()) {
      gsap.set([backdrop, panel], { clearProps: 'all' })
      return
    }

    const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
    timeline.fromTo(
      backdrop,
      { opacity: 0 },
      { opacity: 1, duration: 0.28 },
      0,
    )
    timeline.fromTo(
      panel,
      { opacity: 0, y: 18, scale: 0.985 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        clearProps: 'transform',
      },
      0.04,
    )

    const staggerItems = panel.querySelectorAll('[data-admin-stagger]')
    if (staggerItems.length > 0) {
      timeline.fromTo(
        staggerItems,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.32,
          stagger: 0.05,
          clearProps: 'transform',
        },
        0.12,
      )
    }

    return () => {
      timeline.kill()
    }
  }, [actividad?.id, loading, error])

  if (!actividad && !loading && !error) {
    return null
  }

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[9998] grid place-items-end bg-[rgba(7,28,52,0.72)] p-0 min-[761px]:place-items-center min-[761px]:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closeDisabled) {
          onClose()
        }
      }}
    >
      <div
        ref={panelRef}
        className="relative flex max-h-[min(94dvh,100%)] w-full flex-col overflow-hidden rounded-t-[16px] border border-sigasj-border bg-white shadow-[0_28px_60px_rgba(7,28,52,0.30)] max-[760px]:rounded-b-none sm:max-h-[calc(100dvh-2.5rem)] sm:w-[min(100%,40rem)] sm:rounded-[13px]"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de la actividad"
      >
        <Button
          ref={closeRef}
          type="button"
          variant="secondary"
          size="sm"
          className="!absolute !right-3 !top-3 z-10 !size-11 !min-h-11 !rounded-full !border-sigasj-border !bg-white !p-0 !shadow-[0_4px_12px_rgba(18,63,112,0.10)]"
          onClick={onClose}
          disabled={closeDisabled}
          aria-label="Cerrar detalle"
        >
          <IconX size={18} stroke={1.9} aria-hidden="true" />
        </Button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:theme(colors.sky.300)_transparent] [scrollbar-width:thin]">
          <DetalleActividad
            actividad={actividad}
            loading={loading}
            error={error}
            showFontanero={showFontanero}
            actions={actions}
            variant="overlay"
            flush
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ActividadDetalleOverlay
