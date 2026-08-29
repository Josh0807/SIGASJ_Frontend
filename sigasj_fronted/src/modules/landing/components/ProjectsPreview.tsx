import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ESTADO_PROYECTO_LABELS } from '../../proyectos/types/estadoProyecto'
import { usePublicProyectos } from '../../proyectos/hooks/usePublicProyectos'
import type { PublicProyecto } from '../../proyectos/services/proyectosApi'


type ProjectsPreviewProps = {
  id?: string
  title?: string
}

const getSlidesPerView = (width: number) => {
  if (width < 640) {
    return 1 // Celular
  }
  if (width < 1024) {
    return 2 // Tablet
  }
  return 3 // Computadora
}

const ProjectsPreview = ({
  id = 'proyectos',
  title = 'Proyectos destacados',
}: ProjectsPreviewProps) => {
  const { status, proyectos, error, retry } = usePublicProyectos()
  const [selectedProyecto, setSelectedProyecto] = useState<PublicProyecto | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(3)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [touchEndY, setTouchEndY] = useState<number | null>(null)

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

  const maxIndex = Math.max(0, proyectos.length - slidesPerView)
  const effectiveIndex = Math.min(currentIndex, maxIndex)
  const canPrev = effectiveIndex > 0
  const canNext = effectiveIndex < maxIndex

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, Math.min(prev, maxIndex) - 1))
  }, [maxIndex])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }, [maxIndex])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX)
    setTouchStartY(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
    setTouchEndY(e.targetTouches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return
    const diffX = touchStartX - touchEndX
    const diffY =
      touchStartY !== null && touchEndY !== null ? touchStartY - touchEndY : 0

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      if (diffX > 0 && canNext) {
        handleNext()
      } else if (diffX < 0 && canPrev) {
        handlePrev()
      }
    }

    setTouchStartX(null)
    setTouchEndX(null)
    setTouchStartY(null)
    setTouchEndY(null)
  }


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && canPrev) {
      e.preventDefault()
      handlePrev()
    } else if (e.key === 'ArrowRight' && canNext) {
      e.preventDefault()
      handleNext()
    }
  }

  return (
    <section
      className="landing-section projects-preview"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="projects-preview__content">
        <header className="projects-preview__header">
          <div className="projects-preview__title-group">
            <p className="projects-preview__eyebrow">Proyectos</p>
            <h2 id={`${id}-title`}>{title}</h2>
            <p>
              Conozca las obras en ejecución, proyectos futuros y mejoras en la infraestructura
              hídrica de la ASADA San Juan de Santa Cruz.
            </p>
          </div>

          {proyectos.length > slidesPerView ? (
            <div className="projects-preview__controls">
              <span className="projects-preview__page-indicator" aria-live="polite">
                {effectiveIndex + 1} / {maxIndex + 1}
              </span>
            </div>
          ) : null}
        </header>

        {status === 'loading' ? (
          <p className="projects-preview__empty" role="status">
            Cargando proyectos...
          </p>
        ) : status === 'error' ? (
          <div className="projects-preview__error" role="alert">
            <p>{error || 'No fue posible cargar los proyectos.'}</p>
            <button
              type="button"
              className="projects-preview__retry-btn"
              onClick={retry}
            >
              Reintentar
            </button>
          </div>
        ) : proyectos.length === 0 ? (
          <p className="projects-preview__empty" role="status">
            Actualmente no hay proyectos disponibles.
          </p>
        ) : (

          <div className="projects-preview__carousel">
            <div className="projects-preview__carousel-wrapper">
              {proyectos.length > slidesPerView ? (
                <button
                  type="button"
                  className="projects-preview__side-btn projects-preview__side-btn--prev"
                  onClick={handlePrev}
                  disabled={!canPrev}
                  aria-label="Proyecto anterior"
                >
                  ‹
                </button>
              ) : null}

              <div
                className="projects-preview__viewport"
                tabIndex={0}
                role="region"
                aria-label="Carrusel de proyectos destacados"
                onKeyDown={handleKeyDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="projects-preview__track"
                  style={{
                    transform: `translateX(-${effectiveIndex * (100 / slidesPerView)}%)`,
                  }}
                >
                  {proyectos.map((proyecto) => {
                    const estadoLabel =
                      ESTADO_PROYECTO_LABELS[proyecto.estado] ?? proyecto.estado

                    return (
                      <div
                        key={proyecto.id}
                        className="projects-preview__slide"
                        style={{ flex: `0 0 ${100 / slidesPerView}%` }}
                      >
                        <article className="projects-preview__card">
                          <Link
                            to={`/proyectos/${proyecto.id}`}
                            className="projects-preview__card-thumb"
                            tabIndex={-1}
                            aria-hidden="true"
                          >
                            {proyecto.imagenPrincipal ? (
                              <img
                                src={proyecto.imagenPrincipal}
                                alt={`Fotografía del proyecto ${proyecto.nombre}`}
                              />
                            ) : (
                              <div className="projects-preview__card-placeholder">
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
                            <span className="projects-preview__badge">{estadoLabel}</span>
                          </Link>

                          <div className="projects-preview__card-body">
                            <h3>
                              <Link
                                to={`/proyectos/${proyecto.id}`}
                                className="projects-preview__card-title-link"
                              >
                                {proyecto.nombre}
                              </Link>
                            </h3>
                            <p className="projects-preview__duration">
                              <strong>Duración:</strong> {proyecto.duracion || '—'}
                            </p>
                            <p className="projects-preview__state-text">
                              <strong>Estado:</strong> {estadoLabel}
                            </p>
                            <Link
                              to={`/proyectos/${proyecto.id}`}
                              className="projects-preview__more-btn"
                              aria-label={`Ver más información sobre ${proyecto.nombre}`}
                            >
                              Ver más
                            </Link>
                          </div>
                        </article>
                      </div>
                    )
                  })}
                </div>
              </div>

              {proyectos.length > slidesPerView ? (
                <button
                  type="button"
                  className="projects-preview__side-btn projects-preview__side-btn--next"
                  onClick={handleNext}
                  disabled={!canNext}
                  aria-label="Siguiente proyecto"
                >
                  ›
                </button>
              ) : null}
            </div>

            {maxIndex > 0 ? (
              <div
                className="projects-preview__dots"
                role="tablist"
                aria-label="Navegación por páginas de proyectos"
              >
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`projects-preview__dot ${
                      idx === effectiveIndex ? 'is-active' : ''
                    }`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Ir al grupo de proyectos ${idx + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>


      {selectedProyecto ? (
        <div
          className="projects-preview__modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="proyecto-modal-title"
          onClick={() => setSelectedProyecto(null)}
        >
          <div
            className="projects-preview__modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="projects-preview__modal-close"
              onClick={() => setSelectedProyecto(null)}
              aria-label="Cerrar ventana de detalles"
            >
              &times;
            </button>

            {selectedProyecto.imagenPrincipal ? (
              <div className="projects-preview__modal-img">
                <img
                  src={selectedProyecto.imagenPrincipal}
                  alt={`Detalle del proyecto ${selectedProyecto.nombre}`}
                />
              </div>
            ) : null}

            <h3 id="proyecto-modal-title">{selectedProyecto.nombre}</h3>
            <p className="projects-preview__modal-detail">
              <strong>Duración:</strong> {selectedProyecto.duracion || '—'}
            </p>
            <p className="projects-preview__modal-detail">
              <strong>Estado:</strong>{' '}
              {ESTADO_PROYECTO_LABELS[selectedProyecto.estado] ?? selectedProyecto.estado}
            </p>

            <div className="projects-preview__modal-actions">
              <button
                type="button"
                className="projects-preview__modal-close-btn"
                onClick={() => setSelectedProyecto(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default ProjectsPreview
