import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import TransparencyCard from './TransparencyCard'
import type { TransparencySectionProps } from './TransparencySectionProps'
import { TRANSPARENCY_SECTION_ID } from '../../landing/config/landingAnchors'
import { usePublicTransparencia } from './usePublicTransparencia'

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

/**
 * Sección pública de transparencia y calidad del agua.
 * 1–3 documentos: grilla estática. 4+: coverflow infinito (transición tipo pila).
 */
const TransparencySection = ({
  id = TRANSPARENCY_SECTION_ID,
  title = 'Transparencia',
  description =
    'Consulta informes, documentos e imágenes oficiales sobre la gestión del servicio y la calidad del agua en la ASADA San Juan.',
  publications: publicationsProp,
  emptyMessage = 'No hay documentos de transparencia publicados por el momento.',
  errorMessage = 'No fue posible cargar la documentación. Intenta de nuevo más tarde.',
}: TransparencySectionProps) => {
  const useDefaultItems = publicationsProp === undefined
  const { status, publications: fetched, retry } =
    usePublicTransparencia(useDefaultItems)

  const publications = publicationsProp ?? fetched
  const hasPublications = publications.length > 0
  const showLoading = useDefaultItems && status === 'loading'
  const showError = useDefaultItems && status === 'error'
  const useCarousel = publications.length >= CAROUSEL_MIN_ITEMS
  const total = publications.length

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
    publications.length === 1
      ? 'mx-auto max-w-[22rem] grid-cols-1'
      : publications.length === 2
        ? 'mx-auto max-w-[44rem] grid-cols-2 max-[640px]:grid-cols-1'
        : 'grid-cols-3 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1'

  return (
    <section
      className="public-section public-section--surface"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="public-container">
        <header className="mx-auto max-w-[720px] text-center" data-aos="fade-up">
          <p className="public-eyebrow inline-block [margin-inline-end:-0.12em]">Documentación</p>
          <h2 id={`${id}-title`} className="public-section-title">
            {title}
          </h2>
          <p className="public-section-intro mx-auto">{description}</p>
        </header>

        {showLoading ? (
          <p
            data-ui="transparency-section__empty"
            className="mt-8 rounded-[13px] border border-sigasj-border bg-sigasj-canvas p-8 text-center text-sigasj-muted"
            role="status"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            Cargando documentación…
          </p>
        ) : showError ? (
          <div
            data-ui="transparency-section__empty"
            className="mt-8 rounded-[13px] border border-sigasj-border bg-sigasj-canvas p-8 text-center text-sigasj-muted"
            role="alert"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            <p>{errorMessage}</p>
            <button
              className="mt-3 min-h-11 cursor-pointer rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-5 font-semibold text-sigasj-primary-hover"
              type="button"
              onClick={retry}
            >
              Reintentar
            </button>
          </div>
        ) : hasPublications && useCarousel ? (
          <div
            data-ui="transparency-section__carousel"
            className="mt-8"
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
                className="z-30 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-sigasj-border bg-sigasj-surface text-sigasj-ink transition duration-200 hover:-translate-y-0.5 hover:border-sigasj-primary hover:text-sigasj-primary"
                onClick={handlePrev}
                aria-label="Documento anterior"
              >
                <IconChevronLeft size={20} aria-hidden="true" />
              </button>

              <div
                className="transparency-coverflow relative mx-auto w-full max-w-[58rem] outline-none"
                tabIndex={0}
                role="region"
                aria-roledescription="carrusel"
                aria-label="Pila de documentos de transparencia"
                aria-live="polite"
                onKeyDown={handleKeyDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Altura reservada con la carta activa (invisible). */}
                <div className="pointer-events-none mx-auto w-[min(100%,24.5rem)] opacity-0" aria-hidden="true">
                  <TransparencyCard
                    id={publications[activeIndex].id}
                    name={publications[activeIndex].name}
                    description={publications[activeIndex].description}
                    fileUrl={publications[activeIndex].fileUrl}
                    fileType={publications[activeIndex].fileType}
                  />
                </div>

                {publications.map((publication, index) => {
                  const offset = wrappedOffset(index, activeIndex, total)
                  const abs = Math.abs(offset)
                  // Centro + vecinos: se ven los documentos de atrás en la pila.
                  if (abs > 2) return null

                  const isCenter = offset === 0
                  const side = offset < 0 ? -1 : offset > 0 ? 1 : 0
                  // Offset entero en rem: evita subpíxeles que suavizan el texto del frente.
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
                      key={publication.id}
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
                        isCenter
                          ? undefined
                          : `Mostrar documento: ${publication.name}`
                      }
                    >
                      <div
                        className={
                          isCenter
                            ? undefined
                            : '[&_a]:pointer-events-none [&_button]:pointer-events-none'
                        }
                      >
                        <TransparencyCard
                          id={publication.id}
                          name={publication.name}
                          description={publication.description}
                          fileUrl={publication.fileUrl}
                          fileType={publication.fileType}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                className="z-30 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-sigasj-border bg-sigasj-surface text-sigasj-ink transition duration-200 hover:-translate-y-0.5 hover:border-sigasj-primary hover:text-sigasj-primary"
                onClick={handleNext}
                aria-label="Documento siguiente"
              >
                <IconChevronRight size={20} aria-hidden="true" />
              </button>
            </div>

            <div
              className="mt-6 flex items-center justify-center gap-2"
              aria-label="Documentos en la pila"
            >
              {publications.map((publication, index) => (
                <button
                  key={publication.id}
                  type="button"
                  className={`h-1.5 cursor-pointer rounded-full border-0 p-0 transition-all duration-300 ${
                    index === activeIndex
                      ? 'w-7 bg-sigasj-primary'
                      : 'w-2.5 bg-sigasj-border hover:bg-sigasj-border-strong'
                  }`}
                  aria-label={`Ir al documento ${index + 1}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  onClick={() => goTo(index, true)}
                />
              ))}
            </div>

            <p className="sr-only" aria-live="polite">
              {activeIndex + 1} / {total}
            </p>
          </div>
        ) : hasPublications ? (
          <div
            data-ui="transparency-section__grid"
            className={`mt-8 grid gap-4 ${gridClassName}`}
          >
            {publications.map((publication, index) => (
              <div
                key={publication.id}
                data-aos="fade-up"
                data-aos-delay={String(Math.min(index * 70, 210))}
              >
                <TransparencyCard
                  id={publication.id}
                  name={publication.name}
                  description={publication.description}
                  fileUrl={publication.fileUrl}
                  fileType={publication.fileType}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            data-ui="transparency-section__empty"
            className="mt-8 rounded-[13px] border border-sigasj-border bg-sigasj-canvas py-8 text-center text-sigasj-muted"
            role="status"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  )
}

export default TransparencySection
