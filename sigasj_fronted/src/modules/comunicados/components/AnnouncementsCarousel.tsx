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

  const maxIndex = Math.max(0, announcements.length - slidesPerView)
  const totalPages = maxIndex + 1
  const canNavigate = announcements.length > slidesPerView

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, maxIndex))
  }, [maxIndex])

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, maxIndex)))
    },
    [maxIndex],
  )

  const goPrevious = useCallback(() => {
    goTo(currentIndex - 1)
  }, [currentIndex, goTo])

  const goNext = useCallback(() => {
    goTo(currentIndex + 1)
  }, [currentIndex, goTo])

  const statusLabel = useMemo(() => {
    const first = currentIndex + 1
    const last = Math.min(currentIndex + slidesPerView, announcements.length)
    return `Comunicados ${first} a ${last} de ${announcements.length}`
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
              disabled={currentIndex === 0}
              aria-label="Comunicado anterior"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className="announcements-carousel__control"
              onClick={goNext}
              disabled={currentIndex >= maxIndex}
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
          aria-label="Paginas del carrusel de comunicados"
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
              onClick={() => goTo(pageIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default AnnouncementsCarousel
