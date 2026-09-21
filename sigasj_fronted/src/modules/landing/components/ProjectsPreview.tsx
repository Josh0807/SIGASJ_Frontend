import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowRight, IconCalendar, IconCircleCheck } from '@tabler/icons-react'
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
  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchEndYRef = useRef<number | null>(null)

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
    const touch = e.targetTouches?.[0] || e.touches?.[0] || e.changedTouches?.[0]
    if (touch) {
      touchStartXRef.current = touch.clientX
      touchStartYRef.current = touch.clientY
      touchEndXRef.current = null
      touchEndYRef.current = null
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches?.[0] || e.touches?.[0] || e.changedTouches?.[0]
    if (touch) {
      touchEndXRef.current = touch.clientX
      touchEndYRef.current = touch.clientY
    }
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
      if (diffX > 0 && canNext) {
        handleNext()
      } else if (diffX < 0 && canPrev) {
        handlePrev()
      }
    }

    touchStartXRef.current = null
    touchEndXRef.current = null
    touchStartYRef.current = null
    touchEndYRef.current = null
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
      className="relative isolate min-h-0 overflow-hidden bg-[linear-gradient(135deg,#fbfdff_0%,#edf8ff_55%,#e4f5ff_100%)] px-6 py-16 max-[640px]:px-4 max-[640px]:py-10"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="pointer-events-none absolute -left-44 top-24 -z-10 h-[430px] w-[390px] rotate-[-18deg] rounded-[45%] bg-sky-200/35" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-44 top-20 -z-10 h-52 w-[560px] -rotate-[18deg] rounded-[50%] border-[44px] border-sky-300/20" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 left-[18%] -z-10 h-56 w-[900px] rotate-3 rounded-[50%] border-[48px] border-sky-300/15" aria-hidden="true" />
      <div className="mx-auto w-full max-w-[1060px]">
        <header className="flex items-end justify-between gap-8 max-[760px]:items-start">
          <div className="max-w-[800px] text-left">
            <p className="mb-3 flex items-center gap-4 text-xs font-extrabold uppercase tracking-[0.28em] text-[#1476cf] before:h-0.5 before:w-10 before:bg-[#1476cf]">Proyectos</p>
            <h2 id={`${id}-title`} className="m-0 text-[clamp(2.2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.04em] text-[#092e67]">{title}</h2>
            <p className="mb-0 mt-4 max-w-[760px] text-base leading-7 text-[#526d8c]">
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

          <div className="projects-preview__carousel mt-8">
            <div className="projects-preview__carousel-wrapper relative flex items-center">
              {proyectos.length > slidesPerView ? (
                <button
                  type="button"
                  className="projects-preview__side-btn projects-preview__side-btn--prev z-20 grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-sky-100 bg-white text-2xl text-[#0872d3] shadow-[0_8px_20px_rgba(39,112,166,0.15)] transition hover:-translate-y-1 hover:bg-[#0872d3] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={handlePrev}
                  disabled={!canPrev}
                  aria-label="Proyecto anterior"
                >
                  ‹
                </button>
              ) : null}

              <div
                className="projects-preview__viewport min-w-0 flex-1 overflow-hidden"
                tabIndex={0}
                role="region"
                aria-label="Carrusel de proyectos destacados"
                onKeyDown={handleKeyDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="projects-preview__track flex transition-transform duration-500 ease-out"
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
                        className="projects-preview__slide min-w-0 px-2"
                        style={{ flex: `0 0 ${100 / slidesPerView}%` }}
                      >
                        <article className="projects-preview__card group flex h-full flex-col overflow-hidden rounded-[18px] border border-white bg-white p-1 shadow-[0_12px_28px_rgba(39,112,166,0.13)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_38px_rgba(39,112,166,0.2)]">
                          <Link
                            to={`/proyectos/${proyecto.id}`}
                            className="relative block aspect-[2/1] overflow-hidden rounded-[14px] bg-sky-50"
                            tabIndex={-1}
                            aria-hidden="true"
                          >
                            {proyecto.imagenPrincipal ? (
                              <img className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                                src={proyecto.imagenPrincipal}
                                alt={`Fotografía del proyecto ${proyecto.nombre}`}
                              />
                            ) : (
                              <div className="projects-preview__card-placeholder grid h-full place-items-center text-sky-400">
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
                            <span className="projects-preview__badge absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0872d3] to-[#1264b2] px-3 py-1.5 text-[0.68rem] font-extrabold text-white shadow-lg"><IconCircleCheck size={15} aria-hidden="true" />{estadoLabel}</span>
                          </Link>

                          <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
                            <h3 className="m-0 text-lg font-extrabold leading-tight text-[#092e67]">
                              <Link
                                to={`/proyectos/${proyecto.id}`}
                                className="projects-preview__card-title-link text-inherit no-underline"
                              >
                                {proyecto.nombre}
                              </Link>
                            </h3>
                            <p className="projects-preview__duration mt-3 flex items-center gap-2 text-xs text-[#526d8c]">
                              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sky-100 text-[#0872d3]"><IconCalendar size={16} aria-hidden="true" /></span>
                              <strong>Duración:</strong> {proyecto.duracion || '—'}
                            </p>
                            <p className="projects-preview__state-text mt-2 flex items-center gap-2 text-xs text-[#526d8c]">
                              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600"><IconCircleCheck size={16} aria-hidden="true" /></span>
                              <strong>Estado:</strong> {estadoLabel}
                            </p>
                            <Link
                              to={`/proyectos/${proyecto.id}`}
                              className="projects-preview__more-btn mt-3 inline-flex min-h-10 w-fit items-center gap-5 rounded-[10px] border border-[#0872d3] bg-white px-5 text-xs font-extrabold text-[#0869bd] no-underline transition hover:-translate-y-1 hover:bg-[#0872d3] hover:text-white hover:shadow-[0_12px_24px_rgba(8,100,190,0.26)]"
                              aria-label={`Ver más información sobre ${proyecto.nombre}`}
                            >
                              <span>Ver más</span><IconArrowRight size={19} aria-hidden="true" />
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
                  className="projects-preview__side-btn projects-preview__side-btn--next z-20 grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-sky-100 bg-white text-2xl text-[#0872d3] shadow-[0_8px_20px_rgba(39,112,166,0.15)] transition hover:-translate-y-1 hover:bg-[#0872d3] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
