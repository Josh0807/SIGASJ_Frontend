import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from 'react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import AnnouncementCard from './AnnouncementCard'
import type { Announcement } from '../types/AnnouncementsSectionProps'

type AnnouncementsCarouselProps = {
  announcements: Announcement[]
  labelledBy: string
  onImageOpen: (announcement: Announcement) => void
}

const AUTOPLAY_MS = 7000

const getSlidesPerView = (width: number) => (width < 640 ? 1 : 2)

const wrapIndex = (index: number, total: number) =>
  ((index % total) + total) % total

const AnnouncementsCarousel = ({
  announcements,
  labelledBy,
  onImageOpen,
}: AnnouncementsCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(2)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [cycleKey, setCycleKey] = useState(0)
  const [pageHidden, setPageHidden] = useState(false)
  /** Evita pelear con AOS: animación de slide solo al navegar, no al montar. */
  const [slideAnim, setSlideAnim] = useState(false)
  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchEndYRef = useRef<number | null>(null)

  const total = announcements.length
  const currentIndex = total > 0 ? wrapIndex(activeIndex, total) : 0
  const visibleCount = Math.min(slidesPerView, Math.max(total, 1))
  const canNavigate = total > visibleCount || total > 1
  const isAutoplayStopped = paused || reducedMotion || pageHidden || !canNavigate

  useEffect(() => {
    const updateSlidesPerView = () => setSlidesPerView(getSlidesPerView(window.innerWidth))
    updateSlidesPerView()
    window.addEventListener('resize', updateSlidesPerView)
    return () => window.removeEventListener('resize', updateSlidesPerView)
  }, [])

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

  const bumpCycle = useCallback(() => {
    setCycleKey((key) => key + 1)
  }, [])

  const goTo = useCallback(
    (index: number, fromUser = false) => {
      if (total <= 1) return
      setSlideAnim(true)
      setActiveIndex(wrapIndex(index, total))
      if (fromUser) bumpCycle()
    },
    [bumpCycle, total],
  )

  const handlePrev = useCallback(() => {
    goTo(currentIndex - 1, true)
  }, [currentIndex, goTo])

  const handleNext = useCallback(
    (fromUser = false) => {
      goTo(currentIndex + 1, fromUser)
    },
    [currentIndex, goTo],
  )

  useEffect(() => {
    if (isAutoplayStopped) return
    const timer = window.setInterval(() => {
      setSlideAnim(true)
      setActiveIndex((index) => wrapIndex(index + 1, total))
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [cycleKey, isAutoplayStopped, total])

  const visibleAnnouncements = useMemo(() => {
    if (total === 0) return []
    return Array.from({ length: visibleCount }, (_, offset) => {
      const index = wrapIndex(currentIndex + offset, total)
      return { announcement: announcements[index], index }
    })
  }, [announcements, currentIndex, total, visibleCount])

  const statusLabel = useMemo(() => {
    if (total === 0) return ''
    if (visibleCount === 1) return `${currentIndex + 1} / ${total}`
    const last = wrapIndex(currentIndex + visibleCount - 1, total) + 1
    return `${activeIndex + 1}–${last} / ${total}`
  }, [activeIndex, currentIndex, total, visibleCount])

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.targetTouches?.[0] || event.touches?.[0]
    if (!touch) return
    touchStartXRef.current = touch.clientX
    touchStartYRef.current = touch.clientY
    touchEndXRef.current = null
    touchEndYRef.current = null
  }

  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.targetTouches?.[0] || event.touches?.[0]
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
      if (diffX > 0) handleNext(true)
      else handlePrev()
    }

    touchStartXRef.current = null
    touchEndXRef.current = null
    touchStartYRef.current = null
    touchEndYRef.current = null
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!canNavigate) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      handlePrev()
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      handleNext(true)
    }
  }

  return (
    <div
      className="mt-8 outline-none"
      role="region"
      aria-roledescription="carrusel"
      aria-labelledby={labelledBy}
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
        {canNavigate ? (
          <button
            type="button"
            className="z-30 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-sigasj-border bg-sigasj-surface text-sigasj-ink transition duration-200 hover:-translate-y-0.5 hover:border-sigasj-primary hover:text-sigasj-primary"
            onClick={handlePrev}
            aria-label="Comunicado anterior"
          >
            <IconChevronLeft size={20} aria-hidden="true" />
          </button>
        ) : null}

        <div
          className="relative mx-auto w-full max-w-[58rem] outline-none"
          tabIndex={canNavigate ? 0 : -1}
          onKeyDown={onKeyDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          aria-live="polite"
        >
          <div
            key={currentIndex}
            className={`grid gap-4 ${visibleCount > 1 ? 'grid-cols-2 max-[640px]:grid-cols-1' : 'grid-cols-1'} ${
              !reducedMotion && slideAnim ? 'announcements-carousel__pair' : ''
            }`}
          >
            {visibleAnnouncements.map(({ announcement, index }) => (
              <div key={`${announcement.id}-${index}`} className="min-w-0">
                <AnnouncementCard
                  id={announcement.id}
                  title={announcement.title}
                  summary={announcement.summary}
                  content={announcement.content}
                  publishedAt={announcement.publishedAt}
                type={announcement.type}
                prioridad={announcement.prioridad}
                urgent={announcement.urgent}
                moreHref={announcement.moreHref}
                  moreLabel={announcement.moreLabel}
                  imageUrl={announcement.imageUrl}
                  fileUrl={announcement.fileUrl}
                  onImageClick={() => onImageOpen(announcement)}
                />
              </div>
            ))}
          </div>
        </div>

        {canNavigate ? (
          <button
            type="button"
            className="z-30 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-sigasj-border bg-sigasj-surface text-sigasj-ink transition duration-200 hover:-translate-y-0.5 hover:border-sigasj-primary hover:text-sigasj-primary"
            onClick={() => handleNext(true)}
            aria-label="Comunicado siguiente"
          >
            <IconChevronRight size={20} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {canNavigate ? (
        <>
          <div
            className="mt-6 flex items-center justify-center gap-2"
            aria-label="Comunicados del carrusel"
          >
            {announcements.map((announcement, index) => (
              <button
                key={`announcement-dot-${announcement.id}`}
                type="button"
                className={`h-1.5 cursor-pointer rounded-full border-0 p-0 transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-7 bg-sigasj-primary'
                    : 'w-2.5 bg-sigasj-border hover:bg-sigasj-border-strong'
                }`}
                aria-label={`Ir al comunicado ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : undefined}
                onClick={() => goTo(index, true)}
              />
            ))}
          </div>

          <p className="sr-only" aria-live="polite">
            {statusLabel}
          </p>
        </>
      ) : null}
    </div>
  )
}

export default AnnouncementsCarousel
