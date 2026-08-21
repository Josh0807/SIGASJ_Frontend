import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import AnnouncementCard from './AnnouncementCard'
import { ChevronLeftIcon, ChevronRightIcon } from './announcementIcons'
import type { Announcement } from '../types/AnnouncementsSectionProps'

type AnnouncementsCarouselProps = {
  announcements: Announcement[]
  labelledBy: string
}

const AUTOPLAY_MS = 7000

const getSlidesPerView = (width: number) => {
  if (width < 640) {
    return 1
  }

  return 2
}

const AnnouncementsCarousel = ({
  announcements,
  labelledBy,
}: AnnouncementsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(2)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [cycleKey, setCycleKey] = useState(0)
  const [pageHidden, setPageHidden] = useState(false)
  const isAutoplayStopped = paused || reducedMotion || pageHidden

  useEffect(() => {
    const updateSlidesPerView = () => {
      setSlidesPerView(getSlidesPerView(window.innerWidth))
    }

    updateSlidesPerView()
    window.addEventListener('resize', updateSlidesPerView)

    return () => {
      window.removeEventListener('resize', updateSlidesPerView)
    }
  }, [])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)

    sync()
    media.addEventListener('change', sync)

    return () => {
      media.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    const sync = () => setPageHidden(document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)

    return () => {
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  const maxIndex = Math.max(0, announcements.length - slidesPerView)
  const totalPages = maxIndex + 1
  const canNavigate = announcements.length > slidesPerView

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, maxIndex))
  }, [maxIndex])

  const goTo = useCallback(
    (index: number, fromUser = false) => {
      if (maxIndex === 0) {
        setCurrentIndex(0)
        return
      }

      const wrapped = ((index % (maxIndex + 1)) + (maxIndex + 1)) % (maxIndex + 1)
      setCurrentIndex(wrapped)

      if (fromUser) {
        setCycleKey((key) => key + 1)
      }
    },
    [maxIndex],
  )

  useEffect(() => {
    if (!canNavigate || isAutoplayStopped) {
      return
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index >= maxIndex ? 0 : index + 1))
    }, AUTOPLAY_MS)

    return () => {
      window.clearInterval(timer)
    }
  }, [canNavigate, cycleKey, isAutoplayStopped, maxIndex])

  const goPrevious = useCallback(() => {
    goTo(currentIndex - 1, true)
  }, [currentIndex, goTo])

  const goNext = useCallback(() => {
    goTo(currentIndex + 1, true)
  }, [currentIndex, goTo])

  const statusLabel = useMemo(() => {
    const first = currentIndex + 1
    const last = Math.min(currentIndex + slidesPerView, announcements.length)
    return `${first}–${last} / ${announcements.length}`
  }, [announcements.length, currentIndex, slidesPerView])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!canNavigate) {
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goPrevious()
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goNext()
    }
  }

  return (
    <div
      className="announcements-carousel"
      style={
        {
          '--announcements-total': announcements.length,
          '--announcements-spv': slidesPerView,
          '--announcements-index': currentIndex,
        } as CSSProperties
      }
      role="region"
      aria-roledescription="carrusel"
      aria-labelledby={labelledBy}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false)
        }
      }}
      tabIndex={canNavigate ? 0 : -1}
    >
      {canNavigate ? (
        <div className="announcements-carousel__toolbar">
          <p className="announcements-carousel__status" aria-live="polite">
            {statusLabel}
          </p>

          <div className="announcements-carousel__controls">
            <button
              type="button"
              className="announcements-carousel__control"
              onClick={goPrevious}
              aria-label="Comunicado anterior"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className="announcements-carousel__control"
              onClick={goNext}
              aria-label="Comunicado siguiente"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      ) : null}

      <div className="announcements-carousel__viewport">
        <div className="announcements-carousel__track">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="announcements-carousel__slide"
            >
              <AnnouncementCard
                id={announcement.id}
                title={announcement.title}
                summary={announcement.summary}
                content={announcement.content}
                publishedAt={announcement.publishedAt}
                type={announcement.type}
                urgent={announcement.urgent}
                moreHref={announcement.moreHref}
                moreLabel={announcement.moreLabel}
                imageUrl={announcement.imageUrl}
                fileUrl={announcement.fileUrl}
              />
            </div>
          ))}
        </div>
      </div>

      {canNavigate && totalPages > 1 ? (
        <div
          className="announcements-carousel__dots"
          role="tablist"
          aria-label="Páginas del carrusel de comunicados"
        >
          {Array.from({ length: totalPages }, (_, pageIndex) => (
            <button
              key={`announcement-page-${pageIndex}`}
              type="button"
              className={
                pageIndex === currentIndex
                  ? 'announcements-carousel__dot announcements-carousel__dot--active'
                  : 'announcements-carousel__dot'
              }
              role="tab"
              aria-selected={pageIndex === currentIndex}
              aria-label={`Ir al grupo ${pageIndex + 1} de ${totalPages}`}
              onClick={() => goTo(pageIndex, true)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default AnnouncementsCarousel
