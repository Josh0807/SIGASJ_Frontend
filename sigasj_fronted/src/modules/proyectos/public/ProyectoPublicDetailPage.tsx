import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import {
  IconBuildingCommunity,
  IconCalendarTime,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconClockHour4,
  IconPhoto,
  IconProgress,
  IconUserCog,
} from '@tabler/icons-react'
import { Link, useParams } from 'react-router-dom'
import Footer from '../../landing/components/Footer'
import PublicReceiptNavbar from '../../recibos/components/PublicReceiptNavbar'
import GalleryLightbox from '../../galeria/public/GalleryLightbox'
import {
  ESTADO_PROYECTO_LABELS,
  type EstadoProyecto,
} from '../types/estadoProyecto'
import { usePublicProyectoDetalle } from '../hooks/usePublicProyectoDetalle'

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

const getGallerySlidesPerView = (width: number) => {
  if (width < 640) return 1
  if (width < 1024) return 2
  return 3
}

const wrapIndex = (index: number, total: number) =>
  total <= 0 ? 0 : ((index % total) + total) % total

const ProyectoPublicDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { status, proyecto, error, retry } = usePublicProyectoDetalle(id)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [gallerySlidesPerView, setGallerySlidesPerView] = useState(3)
  const [gallerySlideAnim, setGallerySlideAnim] = useState(false)

  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchEndYRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [id])

  useEffect(() => {
    document.body.classList.add('landing-page-white')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    AOS.init({
      duration: 650,
      easing: 'ease-out-cubic',
      once: true,
      offset: 40,
      anchorPlacement: 'top-bottom',
      disable: reduceMotion,
    })
    AOS.refreshHard()
    return () => {
      document.body.classList.remove('landing-page-white')
    }
  }, [])

  useEffect(() => {
    const updateSlides = () => {
      setGallerySlidesPerView(getGallerySlidesPerView(window.innerWidth))
    }
    updateSlides()
    window.addEventListener('resize', updateSlides)
    return () => window.removeEventListener('resize', updateSlides)
  }, [])

  const imagenes = proyecto?.imagenes || []
  const totalGallery = imagenes.length
  const visibleCount = Math.min(gallerySlidesPerView, Math.max(totalGallery, 1))
  const canMoveGallery = totalGallery > visibleCount
  const estadoLabel = proyecto
    ? ESTADO_PROYECTO_LABELS[proyecto.estado] ?? proyecto.estado
    : ''
  const badge =
    (proyecto && PROJECT_ESTADO_BADGE[proyecto.estado]) || PROJECT_ESTADO_BADGE.EN_PROCESO
  const BadgeIcon = badge.Icon

  const goToGallery = useCallback(
    (index: number) => {
      if (totalGallery <= 1) {
        setGalleryIndex(0)
        return
      }
      setGallerySlideAnim(true)
      setGalleryIndex(wrapIndex(index, totalGallery))
    },
    [totalGallery],
  )

  const handlePrevGallery = useCallback(() => {
    goToGallery(galleryIndex - 1)
  }, [galleryIndex, goToGallery])

  const handleNextGallery = useCallback(() => {
    goToGallery(galleryIndex + 1)
  }, [galleryIndex, goToGallery])

  const visibleGallery = canMoveGallery
    ? Array.from({ length: visibleCount }, (_, offset) => {
        const index = wrapIndex(galleryIndex + offset, totalGallery)
        return { img: imagenes[index], index }
      })
    : imagenes.map((img, index) => ({ img, index }))

  const getTouchCoords = (e: React.TouchEvent) => {
    const touch =
      e.targetTouches?.[0] ||
      e.touches?.[0] ||
      e.changedTouches?.[0] ||
      (e.nativeEvent as unknown as TouchEvent)?.touches?.[0] ||
      (e.nativeEvent as unknown as TouchEvent)?.targetTouches?.[0] ||
      (e.nativeEvent as unknown as TouchEvent)?.changedTouches?.[0]
    return touch ? { x: touch.clientX, y: touch.clientY } : null
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const coords = getTouchCoords(e)
    if (coords) {
      touchStartXRef.current = coords.x
      touchStartYRef.current = coords.y
      touchEndXRef.current = null
      touchEndYRef.current = null
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const coords = getTouchCoords(e)
    if (coords) {
      touchEndXRef.current = coords.x
      touchEndYRef.current = coords.y
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

    if (canMoveGallery && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      if (diffX > 0) handleNextGallery()
      else handlePrevGallery()
    }

    touchStartXRef.current = null
    touchEndXRef.current = null
    touchStartYRef.current = null
    touchEndYRef.current = null
  }

  const handleKeyDownGallery = (e: React.KeyboardEvent) => {
    if (!canMoveGallery) return
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrevGallery()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleNextGallery()
    }
  }

  const lightboxPhotos = imagenes.map((img, index) => ({
    id: String(img.id),
    imageUrl: img.imagenUrl,
    altText:
      img.textoAlternativo ||
      `Fotografía adicional ${index + 1} del proyecto ${proyecto?.nombre || ''}`,
  }))

  return (
    <div className="public-form-page flex min-h-screen flex-col bg-white text-sigasj-ink">
      <PublicReceiptNavbar returnTo="/#proyectos" />

      <main
        className="relative isolate flex-1 bg-white px-6 pb-16 pt-10 max-[640px]:px-4 max-[640px]:pb-12 max-[640px]:pt-8"
        aria-label="Detalle público de proyecto"
      >
        <div className="public-container mx-auto w-full max-w-[1050px]">
          {status === 'loading' ? (
            <div
              className="rounded-[16px] border border-sigasj-border bg-sigasj-surface-soft px-6 py-10 text-center font-semibold text-sigasj-muted"
              role="status"
              data-aos="fade-up"
            >
              <p className="m-0">Cargando información del proyecto…</p>
            </div>
          ) : status === 'not-found' ? (
            <div
              className="mx-auto max-w-[640px] rounded-[16px] border border-sigasj-border bg-sigasj-surface px-6 py-10 text-center shadow-[0_4px_14px_rgba(16,43,56,0.05)]"
              role="status"
              data-aos="fade-up"
            >
              <p className="public-eyebrow">Proyectos</p>
              <h1 className="public-section-title mt-1">Proyecto no disponible</h1>
              <p className="public-section-intro mx-auto mt-4">
                El proyecto solicitado no existe o no se encuentra publicado actualmente.
              </p>
              <Link
                to="/#proyectos"
                className="landing-lift-button landing-lift-button--solid mt-6 inline-flex min-h-11 items-center justify-center rounded-[10px] border border-sigasj-primary bg-sigasj-primary px-5 text-sm font-semibold text-white no-underline"
              >
                Volver
              </Link>
            </div>
          ) : status === 'error' ? (
            <div
              className="proyecto-detail-public__error mx-auto max-w-[640px] rounded-[16px] border border-sigasj-error/30 bg-red-50 px-6 py-8 text-center"
              role="alert"
              data-aos="fade-up"
            >
              <p className="m-0 font-semibold text-sigasj-error">
                {error || 'No fue posible cargar la información del proyecto.'}
              </p>
              <button
                type="button"
                className="transparency-motion-button mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-5 text-sm font-semibold text-sigasj-primary-hover"
                onClick={retry}
              >
                Reintentar
              </button>
            </div>
          ) : proyecto ? (
            <article data-aos="fade-up">
              <header className="mx-auto max-w-[760px] text-center">
                <span className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl border border-sigasj-border bg-sigasj-surface-soft text-sigasj-primary shadow-[0_8px_20px_rgba(39,112,166,0.1)]">
                  <IconBuildingCommunity size={34} aria-hidden="true" />
                </span>
                <p className="public-eyebrow inline-block [margin-inline-end:-0.12em]">
                  Proyectos destacados
                </p>
                <div className="mt-3 flex justify-center">
                  <span
                    className={`public-meta inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 !normal-case !tracking-normal shadow-sm ${badge.className}`}
                  >
                    <BadgeIcon size={14} aria-hidden="true" />
                    {estadoLabel}
                  </span>
                </div>
                <h1 className="public-section-title mt-3 !text-[clamp(1.85rem,4.5vw,2.85rem)]">
                  {proyecto.nombre}
                </h1>
              </header>

              <div className="mt-9 grid gap-6">
                {proyecto.imagenPrincipal ? (
                  <div
                    className="proyecto-detail-public__cover overflow-hidden rounded-[16px] border border-sigasj-border bg-sigasj-surface-soft shadow-[0_4px_14px_rgba(16,43,56,0.05)]"
                    data-aos="fade-up"
                    data-aos-delay="40"
                  >
                    <img
                      className="aspect-[2/1] w-full object-cover"
                      src={proyecto.imagenPrincipal}
                      alt={`Imagen principal de ${proyecto.nombre}`}
                    />
                  </div>
                ) : null}

                <section
                  className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1"
                  data-aos="fade-up"
                  data-aos-delay="80"
                  aria-label="Datos del proyecto"
                >
                  <div className="transparency-motion-card flex items-start gap-3 rounded-[13px] border border-sigasj-border bg-sigasj-surface p-4 shadow-[0_4px_14px_rgba(16,43,56,0.05)]">
                    <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
                      <IconCircleCheck size={22} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="public-meta mb-1">Estado de ejecución</p>
                      <strong className="public-card-title block text-[1.05rem]">
                        {estadoLabel}
                      </strong>
                    </div>
                  </div>

                  <div className="transparency-motion-card flex items-start gap-3 rounded-[13px] border border-sigasj-border bg-sigasj-surface p-4 shadow-[0_4px_14px_rgba(16,43,56,0.05)]">
                    <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
                      <IconCalendarTime size={22} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="public-meta mb-1">Duración estimada</p>
                      <strong className="public-card-title block text-[1.05rem]">
                        {proyecto.duracion || 'No especificada'}
                      </strong>
                    </div>
                  </div>

                  <div className="transparency-motion-card flex items-start gap-3 rounded-[13px] border border-sigasj-border bg-sigasj-surface p-4 shadow-[0_4px_14px_rgba(16,43,56,0.05)]">
                    <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
                      <IconUserCog size={22} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="public-meta mb-1">Encargado de realización</p>
                      <strong className="public-card-title block text-[1.05rem]">
                        {proyecto.encargadoRealizacion || 'ASADA San Juan de Santa Cruz'}
                      </strong>
                    </div>
                  </div>
                </section>

                {proyecto.descripcion ? (
                  <section
                    className="transparency-motion-card rounded-[16px] border border-sigasj-border bg-sigasj-surface p-7 shadow-[0_4px_14px_rgba(16,43,56,0.05)] max-[640px]:p-5"
                    data-aos="fade-up"
                    data-aos-delay="120"
                  >
                    <h2 className="public-card-title">Descripción del proyecto</h2>
                    <p className="public-card-text mt-3 whitespace-pre-line text-[1rem] leading-7">
                      {proyecto.descripcion}
                    </p>
                  </section>
                ) : null}

                {imagenes.length === 1 ? (
                  <section
                    className="proyecto-detail-public__gallery-section transparency-motion-card rounded-[16px] border border-sigasj-border bg-sigasj-surface p-7 shadow-[0_4px_14px_rgba(16,43,56,0.05)] max-[640px]:p-5"
                    data-aos="fade-up"
                    data-aos-delay="140"
                  >
                    <header className="mb-5 flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
                        <IconPhoto size={20} aria-hidden="true" />
                      </span>
                      <h2 className="public-card-title m-0">Fotografía adicional</h2>
                    </header>
                    <button
                      type="button"
                      className="proyecto-detail-public__gallery-item proyecto-detail-public__gallery-item--single block w-full cursor-zoom-in overflow-hidden rounded-[13px] border-0 bg-transparent p-0"
                      onClick={() => setLightboxIndex(0)}
                      aria-label={`Ver fotografía ampliada: ${
                        imagenes[0].textoAlternativo || proyecto.nombre
                      }`}
                    >
                      <img
                        className="aspect-[16/10] w-full object-cover"
                        src={imagenes[0].imagenUrl}
                        alt={
                          imagenes[0].textoAlternativo ||
                          `Fotografía adicional de ${proyecto.nombre}`
                        }
                      />
                    </button>
                  </section>
                ) : null}

                {imagenes.length > 1 ? (
                  <section
                    className="proyecto-detail-public__gallery-section transparency-motion-card rounded-[16px] border border-sigasj-border bg-sigasj-surface p-7 shadow-[0_4px_14px_rgba(16,43,56,0.05)] max-[640px]:p-5"
                    data-aos="fade-up"
                    data-aos-delay="140"
                  >
                    <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
                          <IconPhoto size={20} aria-hidden="true" />
                        </span>
                        <h2 className="public-card-title m-0">Galería de fotografías</h2>
                      </div>
                      {canMoveGallery ? (
                        <div className="proyecto-detail-public__gallery-controls flex items-center gap-2">
                          <button
                            type="button"
                            className="proyecto-detail-public__side-btn proyecto-detail-public__side-btn--prev z-30 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-sigasj-border bg-sigasj-surface text-sigasj-ink transition duration-200 hover:-translate-y-0.5 hover:border-sigasj-primary hover:text-sigasj-primary max-[640px]:size-9"
                            onClick={handlePrevGallery}
                            aria-label="Fotografía anterior"
                          >
                            <IconChevronLeft size={20} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="proyecto-detail-public__side-btn proyecto-detail-public__side-btn--next z-30 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-sigasj-border bg-sigasj-surface text-sigasj-ink transition duration-200 hover:-translate-y-0.5 hover:border-sigasj-primary hover:text-sigasj-primary max-[640px]:size-9"
                            onClick={handleNextGallery}
                            aria-label="Siguiente fotografía"
                          >
                            <IconChevronRight size={20} aria-hidden="true" />
                          </button>
                        </div>
                      ) : null}
                    </header>

                    <div className="flex items-center justify-center gap-2 max-[640px]:gap-1">
                      <div
                        className="proyecto-detail-public__gallery-viewport relative mx-auto w-full min-w-0 outline-none"
                        tabIndex={canMoveGallery ? 0 : -1}
                        role="region"
                        aria-label="Galería de fotografías adicionales del proyecto"
                        onKeyDown={handleKeyDownGallery}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <div
                          key={galleryIndex}
                          className={`grid gap-4 ${
                            visibleCount > 1
                              ? 'grid-cols-3 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1'
                              : 'grid-cols-1'
                          }${gallerySlideAnim ? ' announcements-carousel__pair' : ''}`}
                        >
                          {visibleGallery.map(({ img, index }) => {
                            const altText =
                              img.textoAlternativo ||
                              `Fotografía adicional ${index + 1} de ${proyecto.nombre}`
                            return (
                              <div key={`${img.id}-${index}`} className="min-w-0">
                                <button
                                  type="button"
                                  className="proyecto-detail-public__gallery-item block w-full cursor-zoom-in overflow-hidden rounded-[13px] border-0 bg-transparent p-0"
                                  onClick={() => setLightboxIndex(index)}
                                  aria-label={`Ver fotografía ampliada ${index + 1}: ${altText}`}
                                >
                                  <img
                                    className="aspect-[4/3] w-full object-cover transition duration-500 ease-out hover:scale-[1.03]"
                                    src={img.imagenUrl}
                                    alt={altText}
                                  />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </section>
                ) : null}
              </div>
            </article>
          ) : null}
        </div>
      </main>

      {lightboxIndex !== null && lightboxPhotos.length > 0 ? (
        <GalleryLightbox
          photos={lightboxPhotos}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}

      <Footer />
    </div>
  )
}

export default ProyectoPublicDetailPage
