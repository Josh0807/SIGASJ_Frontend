import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from 'react'
import { Link } from 'react-router-dom'
import {
  IconArrowRight,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconClockHour4,
  IconProgress,
} from '@tabler/icons-react'
import {
  ESTADO_PROYECTO_LABELS,
  type EstadoProyecto,
} from '../../proyectos/types/estadoProyecto'
import { usePublicProyectos } from '../../proyectos/hooks/usePublicProyectos'
import type { PublicProyecto } from '../../proyectos/services/proyectosApi'

const PROJECT_ESTADO_BADGE: Record<
  EstadoProyecto,
  { className: string; Icon: typeof IconCircleCheck }
> = {
  COMPLETADO: {
    className: 'bg-sigasj-success text-white',
    Icon: IconCircleCheck,
  },
  PENDIENTE: {
    className: 'bg-sigasj-primary text-white',
    Icon: IconClockHour4,
  },
  EN_PROCESO: {
    className: 'bg-[#f5d000] text-[#1f1a00]',
    Icon: IconProgress,
  },
}

const CAROUSEL_MIN_ITEMS = 4
const AUTOPLAY_MS = 7000

/** Offset circular más corto hacia activeIndex (−floor((n-1)/2) … +floor(n/2)). */
const wrappedOffset = (index: number, active: number, total: number) => {
  let offset = index - active
  const half = Math.floor(total / 2)
  if (offset > half) offset -= total
  if (offset < -half) offset += total
  return offset
}

type ProjectsPreviewProps = {
  id?: string
  title?: string
}

const ProjectCard = ({ proyecto }: { proyecto: PublicProyecto }) => {
  const estadoLabel = ESTADO_PROYECTO_LABELS[proyecto.estado] ?? proyecto.estado
  const badge =
    PROJECT_ESTADO_BADGE[proyecto.estado] ?? PROJECT_ESTADO_BADGE.EN_PROCESO
  const BadgeIcon = badge.Icon

  return (
    <article className="projects-preview__card transparency-motion-card group flex h-full flex-col overflow-hidden rounded-[13px] border border-sigasj-border bg-sigasj-surface shadow-[0_4px_14px_rgba(16,43,56,0.05)]">
      <Link
        to={`/proyectos/${proyecto.id}`}
        className="relative block aspect-[2/1] overflow-hidden rounded-t-[13px] bg-sigasj-surface-soft"
        tabIndex={-1}
        aria-hidden="true"
      >
        {proyecto.imagenPrincipal ? (
          <img
            className="h-full w-full object-cover"
            src={proyecto.imagenPrincipal}
            alt={`Fotografía del proyecto ${proyecto.nombre}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="projects-preview__card-placeholder grid h-full place-items-center text-sigasj-muted">
            <svg
              aria-hidden="true"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <path d="M3 15l5-5 4 4 5-6 4 4" />
            </svg>
          </div>
        )}
        <span
          className={`public-meta projects-preview__badge absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 !normal-case !tracking-normal shadow-sm ${badge.className}`}
        >
          <BadgeIcon size={14} aria-hidden="true" />
          {estadoLabel}
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <h3 className="public-card-title">
          <Link
            to={`/proyectos/${proyecto.id}`}
            className="projects-preview__card-title-link text-inherit no-underline"
          >
            {proyecto.nombre}
          </Link>
        </h3>
        <p className="projects-preview__duration mt-3 flex items-center gap-2 text-xs text-sigasj-muted">
          <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-sigasj-surface-soft text-sigasj-primary">
            <IconCalendar size={16} aria-hidden="true" />
          </span>
          <strong>Duración:</strong> {proyecto.duracion || '—'}
        </p>
        <Link
          to={`/proyectos/${proyecto.id}`}
          className="projects-preview__more-btn transparency-motion-button mt-3 inline-flex min-h-11 w-fit items-center gap-2 rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-4 text-xs font-semibold text-sigasj-primary-hover no-underline"
          aria-label={`Ver más información sobre ${proyecto.nombre}`}
        >
          <span>Ver más</span>
          <IconArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

/**
 * Proyectos destacados.
 * 1–3 proyectos: grilla estática. 4+: coverflow infinito (mismo patrón que Transparencia).
 */
const ProjectsPreview = ({
  id = 'proyectos',
  title = 'Proyectos destacados',
}: ProjectsPreviewProps) => {
  const { status, proyectos, retry } = usePublicProyectos()
  const hasProyectos = proyectos.length > 0
  const useCarousel = proyectos.length >= CAROUSEL_MIN_ITEMS
  const total = proyectos.length

  const [activeIndex, setActiveIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [paused, setPaused] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const [cycleKey, setCycleKey] = useState(0)
  /** Evita pelear con AOS: transición del coverflow solo al navegar, no al montar. */
  const [slideAnim, setSlideAnim] = useState(false)
  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchEndYRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const sync = () => setPageHidden(document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  useEffect(() => {
    if (activeIndex >= total) setActiveIndex(0)
  }, [activeIndex, total])

  const bumpCycle = useCallback(() => {
    setCycleKey((key) => key + 1)
  }, [])

  const goTo = useCallback(
    (index: number, fromUser = false) => {
      if (total === 0) return
      setSlideAnim(true)
      setActiveIndex(((index % total) + total) % total)
      if (fromUser) bumpCycle()
    },
    [bumpCycle, total],
  )

  const handlePrev = useCallback(() => {
    goTo(activeIndex - 1, true)
  }, [activeIndex, goTo])

  const handleNext = useCallback(() => {
    goTo(activeIndex + 1, true)
  }, [activeIndex, goTo])

  useEffect(() => {
    if (!useCarousel || paused || reducedMotion || pageHidden || total < 2) return
    const timer = window.setInterval(() => {
      setSlideAnim(true)
      setActiveIndex((index) => ((index + 1) % total + total) % total)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [cycleKey, pageHidden, paused, reducedMotion, total, useCarousel])

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.targetTouches?.[0] || e.touches?.[0]
    if (!touch) return
    touchStartXRef.current = touch.clientX
    touchStartYRef.current = touch.clientY
    touchEndXRef.current = null
    touchEndYRef.current = null
  }

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.targetTouches?.[0] || e.touches?.[0]
    if (!touch) return
    touchEndXRef.current = touch.clientX
    touchEndYRef.current = touch.clientY
  }

  const handleTouchEnd = () => {
    const startX = touchStartXRef.current
    const endX = touchEndXRef.current
    const startY = touchStartYRef.current
    const endY = touchEndYRef.current
    if (startX === null || endX === null) return

    const diffX = startX - endX
    const diffY = startY !== null && endY !== null ? startY - endY : 0
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      if (diffX > 0) handleNext()
      else handlePrev()
    }

    touchStartXRef.current = null
    touchEndXRef.current = null
    touchStartYRef.current = null
    touchEndYRef.current = null
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleNext()
    }
  }

  const gridClassName =
    proyectos.length === 1
      ? 'mx-auto max-w-[22rem] grid-cols-1'
      : proyectos.length === 2
        ? 'mx-auto max-w-[44rem] grid-cols-2 max-[640px]:grid-cols-1'
        : 'grid-cols-3 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1'

  return (
    <section
      className="public-section public-section--canvas"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="public-container">
        <header className="relative mx-auto max-w-[720px] text-center" data-aos="fade-up">
          <p className="public-eyebrow inline-block [margin-inline-end:-0.12em]">Proyectos</p>
          <h2 id={`${id}-title`} className="public-section-title">
            {title}
          </h2>
          <p className="public-section-intro mx-auto">
            Conozca las obras en ejecución, proyectos futuros y mejoras en la infraestructura
            hídrica de la ASADA San Juan de Santa Cruz.
          </p>
        </header>

        {status === 'loading' ? (
          <p
            className="projects-preview__empty mt-8 rounded-[13px] border border-sigasj-border bg-sigasj-surface p-8 text-center text-sigasj-muted"
            role="status"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            Cargando proyectos...
          </p>
        ) : status === 'error' ? (
          <div
            className="projects-preview__error mt-8 rounded-[13px] border border-sigasj-border bg-sigasj-surface p-8 text-center text-sigasj-muted"
            role="alert"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            <p>No fue posible cargar los proyectos. Intente de nuevo más tarde.</p>
            <button
              type="button"
              className="projects-preview__retry-btn mt-3 min-h-11 cursor-pointer rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-5 font-semibold text-sigasj-primary-hover"
              onClick={retry}
            >
              Reintentar
            </button>
          </div>
        ) : hasProyectos && useCarousel ? (
          <div
            data-ui="projects-preview__carousel"
            className="projects-preview__carousel mt-8"
            data-aos="fade-up"
            data-aos-delay="80"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setPaused(false)
              }
            }}
          >
            <div className="flex items-center justify-center gap-2 max-[640px]:gap-1">
              <button
                type="button"
                className="z-30 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-sigasj-border bg-sigasj-surface text-sigasj-ink transition duration-200 hover:-translate-y-0.5 hover:border-sigasj-primary hover:text-sigasj-primary max-[640px]:size-9"
                onClick={handlePrev}
                aria-label="Proyecto anterior"
              >
                <IconChevronLeft size={20} aria-hidden="true" />
              </button>

              <div
                className="projects-preview__viewport transparency-coverflow relative mx-auto w-full max-w-[58rem] outline-none"
                tabIndex={0}
                role="region"
                aria-roledescription="carrusel"
                aria-label="Pila de proyectos destacados"
                aria-live="polite"
                onKeyDown={handleKeyDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="pointer-events-none mx-auto w-[min(100%,24.5rem)] opacity-0"
                  aria-hidden="true"
                >
                  <ProjectCard proyecto={proyectos[activeIndex]} />
                </div>

                {proyectos.map((proyecto, index) => {
                  const offset = wrappedOffset(index, activeIndex, total)
                  const abs = Math.abs(offset)
                  if (abs > 2) return null

                  const isCenter = offset === 0
                  const side = offset < 0 ? -1 : offset > 0 ? 1 : 0
                  const xRem = side * (abs === 1 ? 9 : 14)
                  const y = isCenter ? 0 : abs === 1 ? 6 : 12
                  const scale = isCenter ? 1 : abs === 1 ? 0.9 : 0.8
                  const opacity = isCenter ? 1 : abs === 1 ? 0.78 : 0.42
                  const zIndex = isCenter ? 30 : abs === 1 ? 20 : 10
                  const transition =
                    reducedMotion || !slideAnim
                      ? 'none'
                      : isCenter
                        ? 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
                        : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease'

                  return (
                    <div
                      key={proyecto.id}
                      className={`transparency-coverflow__item absolute left-1/2 top-0 w-[min(100%,24.5rem)]${
                        isCenter ? ' transparency-coverflow__item--active' : ''
                      }`}
                      style={{
                        zIndex,
                        opacity,
                        transform: `translate3d(calc(-50% + ${xRem}rem), ${y}px, 0) scale(${scale})`,
                        transition,
                        cursor: isCenter ? 'default' : 'pointer',
                        filter: 'none',
                      }}
                      aria-hidden={!isCenter}
                      onClick={() => {
                        if (!isCenter) goTo(index, true)
                      }}
                      onKeyDown={(e) => {
                        if (!isCenter && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          goTo(index, true)
                        }
                      }}
                      role={isCenter ? undefined : 'button'}
                      tabIndex={isCenter ? undefined : 0}
                      aria-label={
                        isCenter ? undefined : `Mostrar proyecto: ${proyecto.nombre}`
                      }
                    >
                      <div
                        className={
                          isCenter
                            ? undefined
                            : '[&_a]:pointer-events-none [&_button]:pointer-events-none'
                        }
                      >
                        <ProjectCard proyecto={proyecto} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                className="z-30 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-sigasj-border bg-sigasj-surface text-sigasj-ink transition duration-200 hover:-translate-y-0.5 hover:border-sigasj-primary hover:text-sigasj-primary max-[640px]:size-9"
                onClick={handleNext}
                aria-label="Siguiente proyecto"
              >
                <IconChevronRight size={20} aria-hidden="true" />
              </button>
            </div>

            <div
              className="projects-preview__dots mt-6 flex items-center justify-center gap-2"
              aria-label="Proyectos en la pila"
            >
              {proyectos.map((proyecto, index) => (
                <button
                  key={proyecto.id}
                  type="button"
                  className={`projects-preview__dot h-1.5 cursor-pointer rounded-full border-0 p-0 transition-all duration-300 ${
                    index === activeIndex
                      ? 'is-active w-7 bg-sigasj-primary'
                      : 'w-2.5 bg-sigasj-border hover:bg-sigasj-border-strong'
                  }`}
                  aria-label={`Ir al proyecto ${index + 1}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  onClick={() => goTo(index, true)}
                />
              ))}
            </div>

            <p
              className="projects-preview__page-indicator sr-only"
              aria-live="polite"
            >
              {activeIndex + 1} / {total}
            </p>
          </div>
        ) : hasProyectos ? (
          <div
            data-ui="projects-preview__grid"
            className={`mt-8 grid gap-4 ${gridClassName}`}
          >
            {proyectos.map((proyecto, index) => (
              <div
                key={proyecto.id}
                data-aos="fade-up"
                data-aos-delay={String(Math.min(index * 70, 210))}
              >
                <ProjectCard proyecto={proyecto} />
              </div>
            ))}
          </div>
        ) : (
          <p
            className="projects-preview__empty mt-8 rounded-[13px] border border-sigasj-border bg-sigasj-surface py-8 text-center text-sigasj-muted"
            role="status"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            Actualmente no hay proyectos disponibles.
          </p>
        )}
      </div>
    </section>
  )
}

export default ProjectsPreview
