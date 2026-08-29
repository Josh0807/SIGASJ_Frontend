

import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../../landing/components/Header'
import Footer from '../../landing/components/Footer'
import GalleryLightbox from '../../galeria/public/GalleryLightbox'
import { ESTADO_PROYECTO_LABELS } from '../types/estadoProyecto'
import { usePublicProyectoDetalle } from '../hooks/usePublicProyectoDetalle'

const getGallerySlidesPerView = (width: number) => {
  if (width < 640) return 1
  if (width < 1024) return 2
  return 3
}

const ProyectoPublicDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { status, proyecto, error, retry } = usePublicProyectoDetalle(id)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [gallerySlidesPerView, setGallerySlidesPerView] = useState(3)

  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchEndYRef = useRef<number | null>(null)

  useEffect(() => {
    const updateSlides = () => {
      setGallerySlidesPerView(getGallerySlidesPerView(window.innerWidth))
    }
    updateSlides()
    window.addEventListener('resize', updateSlides)
    return () => window.removeEventListener('resize', updateSlides)
  }, [])

  const imagenes = proyecto?.imagenes || []
  const maxGalleryIndex = Math.max(0, imagenes.length - gallerySlidesPerView)
  const effectiveGalleryIndex = Math.min(galleryIndex, maxGalleryIndex)
  const canPrevGallery = effectiveGalleryIndex > 0
  const canNextGallery = effectiveGalleryIndex < maxGalleryIndex

  const handlePrevGallery = useCallback(() => {
    setGalleryIndex((prev) => Math.max(0, Math.min(prev, maxGalleryIndex) - 1))
  }, [maxGalleryIndex])

  const handleNextGallery = useCallback(() => {
    setGalleryIndex((prev) => Math.min(maxGalleryIndex, Math.min(prev, maxGalleryIndex) + 1))
  }, [maxGalleryIndex])

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

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      if (diffX > 0 && canNextGallery) {
        handleNextGallery()
      } else if (diffX < 0 && canPrevGallery) {
        handlePrevGallery()
      }
    }

    touchStartXRef.current = null
    touchEndXRef.current = null
    touchStartYRef.current = null
    touchEndYRef.current = null
  }

  const handleKeyDownGallery = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && canPrevGallery) {
      e.preventDefault()
      handlePrevGallery()
    } else if (e.key === 'ArrowRight' && canNextGallery) {
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
    <div className="proyecto-detail-public-page">
      <Header />

      <main className="proyecto-detail-public">
        <div className="proyecto-detail-public__container">
          <div className="proyecto-detail-public__top-bar">
            <Link to="/#proyectos" className="proyecto-detail-public__back-link">
              ← Volver a Proyectos
            </Link>
          </div>

          {status === 'loading' ? (
            <div className="proyecto-detail-public__status" role="status">
              <p>Cargando información del proyecto…</p>
            </div>
          ) : status === 'not-found' ? (
            <div className="proyecto-detail-public__status" role="status">
              <h2>Proyecto no disponible</h2>
              <p>El proyecto solicitado no existe o no se encuentra publicado actualmente.</p>
              <Link to="/" className="proyecto-detail-public__home-btn">
                Ir al inicio
              </Link>
            </div>
          ) : status === 'error' ? (
            <div className="proyecto-detail-public__error" role="alert">
              <p>{error || 'No fue posible cargar los detalles del proyecto.'}</p>
              <button type="button" onClick={retry}>
                Reintentar
              </button>
            </div>
          ) : proyecto ? (
            <article className="proyecto-detail-public__article">
              <header className="proyecto-detail-public__header">
                <div className="proyecto-detail-public__badge-wrapper">
                  <span className="proyecto-detail-public__badge">
                    {ESTADO_PROYECTO_LABELS[proyecto.estado] ?? proyecto.estado}
                  </span>
                </div>
                <h1>{proyecto.nombre}</h1>
              </header>

              {proyecto.imagenPrincipal ? (
                <div className="proyecto-detail-public__cover">
                  <img
                    src={proyecto.imagenPrincipal}
                    alt={`Imagen principal de ${proyecto.nombre}`}
                  />
                </div>
              ) : null}

              <section className="proyecto-detail-public__meta-grid">
                <div className="proyecto-detail-public__meta-card">
                  <span className="proyecto-detail-public__meta-label">Estado de Ejecución</span>
                  <strong className="proyecto-detail-public__meta-value">
                    {ESTADO_PROYECTO_LABELS[proyecto.estado] ?? proyecto.estado}
                  </strong>
                </div>

                <div className="proyecto-detail-public__meta-card">
                  <span className="proyecto-detail-public__meta-label">Duración Estimada</span>
                  <strong className="proyecto-detail-public__meta-value">
                    {proyecto.duracion || 'No especificada'}
                  </strong>
                </div>

                <div className="proyecto-detail-public__meta-card">
                  <span className="proyecto-detail-public__meta-label">Encargado de Realización</span>
                  <strong className="proyecto-detail-public__meta-value">
                    {proyecto.encargadoRealizacion || 'ASADA San Juan de Santa Cruz'}
                  </strong>
                </div>
              </section>

              {proyecto.descripcion ? (
                <section className="proyecto-detail-public__section">
                  <h2>Descripción del Proyecto</h2>
                  <p className="proyecto-detail-public__description">
                    {proyecto.descripcion}
                  </p>
                </section>
              ) : null}

              {imagenes.length === 0 ? null : imagenes.length === 1 ? (
                <section className="proyecto-detail-public__section proyecto-detail-public__gallery-section">
                  <header className="proyecto-detail-public__gallery-header">
                    <h2>Fotografía Adicional</h2>
                  </header>
                  <div className="proyecto-detail-public__single-image-wrapper">
                    <button
                      type="button"
                      className="proyecto-detail-public__gallery-item proyecto-detail-public__gallery-item--single"
                      onClick={() => setLightboxIndex(0)}
                      aria-label={`Ver fotografía ampliada: ${
                        imagenes[0].textoAlternativo || proyecto.nombre
                      }`}
                    >
                      <img
                        src={imagenes[0].imagenUrl}
                        alt={
                          imagenes[0].textoAlternativo ||
                          `Fotografía adicional de ${proyecto.nombre}`
                        }
                      />
                    </button>
                  </div>
                </section>
              ) : (
                <section className="proyecto-detail-public__section proyecto-detail-public__gallery-section">
                  <div className="proyecto-detail-public__gallery-header">
                    <h2>Galería de Fotografías</h2>
                    {imagenes.length > gallerySlidesPerView ? (
                      <div className="proyecto-detail-public__gallery-controls">
                        <button
                          type="button"
                          className="proyecto-detail-public__side-btn proyecto-detail-public__side-btn--prev"
                          onClick={handlePrevGallery}
                          disabled={!canPrevGallery}
                          aria-label="Fotografía anterior"
                        >
                          ‹
                        </button>
                        <span className="proyecto-detail-public__page-indicator" aria-live="polite">
                          {effectiveGalleryIndex + 1} / {maxGalleryIndex + 1}
                        </span>
                        <button
                          type="button"
                          className="proyecto-detail-public__side-btn proyecto-detail-public__side-btn--next"
                          onClick={handleNextGallery}
                          disabled={!canNextGallery}
                          aria-label="Siguiente fotografía"
                        >
                          ›
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="proyecto-detail-public__gallery-carousel">
                    <div
                      className="proyecto-detail-public__gallery-viewport"
                      tabIndex={0}
                      role="region"
                      aria-label="Galería de fotografías adicionales del proyecto"
                      onKeyDown={handleKeyDownGallery}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <div
                        className="proyecto-detail-public__gallery-track"
                        style={{
                          transform: `translateX(-${
                            effectiveGalleryIndex * (100 / gallerySlidesPerView)
                          }%)`,
                        }}
                      >
                        {imagenes.map((img, index) => {
                          const altText =
                            img.textoAlternativo ||
                            `Fotografía adicional ${index + 1} de ${proyecto.nombre}`

                          return (
                            <div
                              key={img.id}
                              className="proyecto-detail-public__gallery-slide"
                              style={{ flex: `0 0 ${100 / gallerySlidesPerView}%` }}
                            >
                              <button
                                type="button"
                                className="proyecto-detail-public__gallery-item"
                                onClick={() => setLightboxIndex(index)}
                                aria-label={`Ver fotografía ampliada ${index + 1}: ${altText}`}
                              >
                                <img src={img.imagenUrl} alt={altText} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </section>
              )}
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
