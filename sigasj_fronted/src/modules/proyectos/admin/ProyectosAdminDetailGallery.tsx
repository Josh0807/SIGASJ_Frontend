import { formatProyectoAdminDate } from './formatProyectoAdminDate'
import type { AdminProyectoImagen } from './types'

type ProyectosAdminDetailGalleryProps = {
  imagenes: AdminProyectoImagen[]
}

const sortImagenes = (imagenes: AdminProyectoImagen[]) =>
  [...imagenes].sort((left, right) => {
    if (left.orden !== right.orden) {
      return left.orden - right.orden
    }

    return left.id - right.id
  })

const ProyectosAdminDetailGallery = ({
  imagenes,
}: ProyectosAdminDetailGalleryProps) => {
  if (imagenes.length === 0) {
    return (
      <p className="gallery-admin__empty" role="status">
        No hay imágenes en la galería.
      </p>
    )
  }

  return (
    <ul className="gallery-admin__list proyectos-admin__gallery">
      {sortImagenes(imagenes).map((imagen) => {
        const descripcion = imagen.descripcion?.trim()

        return (
          <li className="gallery-admin__item" key={imagen.id}>
            <div className="gallery-admin__thumb">
              {imagen.url ? (
                <img src={imagen.url} alt={descripcion || `Imagen ${imagen.orden}`} />
              ) : (
                <div className="gallery-admin__doc-thumb" aria-hidden="true">
                  —
                </div>
              )}
            </div>
            <div className="gallery-admin__meta">
              <h2>{descripcion || 'Sin descripción'}</h2>
              <p>Orden {imagen.orden}</p>
              <p>ID {imagen.id}</p>
              <p>Creada el {formatProyectoAdminDate(imagen.createdAt)}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default ProyectosAdminDetailGallery
