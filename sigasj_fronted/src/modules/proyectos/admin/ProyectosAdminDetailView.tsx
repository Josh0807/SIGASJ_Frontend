import {
  IconBuildingBridge,
  IconCalendar,
  IconEye,
  IconPhoto,
  IconUserCog,
} from '@tabler/icons-react'
import { resolveBackendAssetUrl } from '../../../services/http/assetUrl'
import { ESTADO_PROYECTO_LABELS } from '../types/estadoProyecto'
import { formatProyectoAdminDate } from './formatProyectoAdminDate'
import ProyectosAdminDetailGallery from './ProyectosAdminDetailGallery'
import type { AdminProyectoDetalle } from './types'

type ProyectosAdminDetailViewProps = {
  proyecto: AdminProyectoDetalle
}

const EMPTY = '—'

const textOrEmpty = (value: string | null | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : EMPTY
}

const ProyectosAdminDetailView = ({ proyecto }: ProyectosAdminDetailViewProps) => {
  const visibilidad = proyecto.activo ? 'Activo' : 'Inactivo'
  const estadoLabel =
    ESTADO_PROYECTO_LABELS[proyecto.estado] ?? proyecto.estado
  const imagenPrincipal =
    resolveBackendAssetUrl(proyecto.imagenPrincipal) ??
    proyecto.imagenPrincipal?.trim()

  return (
    <article
      className="proyectos-admin__detail"
      aria-label="Detalle del proyecto"
    >
      <header className="proyectos-admin__detail-hero">
        <div className="proyectos-admin__detail-hero-copy">
          <p className="proyectos-admin__detail-eyebrow">
            <IconBuildingBridge size={16} aria-hidden="true" />
            Proyecto #{proyecto.id}
          </p>
          <h2>Detalle del proyecto</h2>
          <p className="proyectos-admin__detail-title">{textOrEmpty(proyecto.nombre)}</p>
          <p className="proyectos-admin__detail-lead">
            {textOrEmpty(proyecto.descripcion)}
          </p>
          <ul className="gallery-admin__badges proyectos-admin__detail-badges">
            <li>{estadoLabel}</li>
            <li className={proyecto.activo ? 'is-active' : 'is-inactive'}>
              {visibilidad}
            </li>
          </ul>
        </div>
        <div className="proyectos-admin__detail-cover">
          {imagenPrincipal ? (
            <div className="gallery-admin__thumb proyectos-admin__principal">
              <img
                src={imagenPrincipal}
                alt={`Imagen principal de ${proyecto.nombre}`}
              />
            </div>
          ) : (
            <div className="proyectos-admin__detail-cover-empty" aria-hidden="true">
              <IconPhoto size={36} />
              <span>Sin portada</span>
            </div>
          )}
        </div>
      </header>

      <dl className="proyectos-admin__detail-grid">
        <div>
          <dt>ID</dt>
          <dd>{proyecto.id}</dd>
        </div>
        <div>
          <dt>Nombre</dt>
          <dd>{textOrEmpty(proyecto.nombre)}</dd>
        </div>
        <div className="proyectos-admin__detail-wide">
          <dt>Descripción</dt>
          <dd>{textOrEmpty(proyecto.descripcion)}</dd>
        </div>
        <div>
          <dt>
            <span className="proyectos-admin__detail-dt">
              <IconUserCog size={15} aria-hidden="true" />
              Encargado de realización
            </span>
          </dt>
          <dd>{textOrEmpty(proyecto.encargadoRealizacion)}</dd>
        </div>
        <div>
          <dt>
            <span className="proyectos-admin__detail-dt">
              <IconCalendar size={15} aria-hidden="true" />
              Duración
            </span>
          </dt>
          <dd>{textOrEmpty(proyecto.duracion)}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>
            <ul className="gallery-admin__badges">
              <li>{estadoLabel}</li>
            </ul>
          </dd>
        </div>
        <div>
          <dt>Imagen principal</dt>
          <dd>
            {imagenPrincipal ? (
              <div className="gallery-admin__thumb proyectos-admin__principal">
                <img
                  src={imagenPrincipal}
                  alt={`Imagen principal de ${proyecto.nombre}`}
                />
              </div>
            ) : (
              EMPTY
            )}
          </dd>
        </div>
        <div>
          <dt>
            <span className="proyectos-admin__detail-dt">
              <IconEye size={15} aria-hidden="true" />
              Visibilidad
            </span>
          </dt>
          <dd>
            <ul className="gallery-admin__badges">
              <li className={proyecto.activo ? 'is-active' : 'is-inactive'}>
                {visibilidad}
              </li>
            </ul>
          </dd>
        </div>
        <div>
          <dt>Fecha de creación</dt>
          <dd>{formatProyectoAdminDate(proyecto.createdAt)}</dd>
        </div>
        <div>
          <dt>Fecha de actualización</dt>
          <dd>{formatProyectoAdminDate(proyecto.updatedAt)}</dd>
        </div>
      </dl>

      <section
        className="proyectos-admin__detail-gallery"
        aria-label="Galería"
      >
        <div className="proyectos-admin__detail-gallery-head">
          <h3>
            <IconPhoto size={18} aria-hidden="true" />
            Galería
          </h3>
          <p>Fotografías adicionales asociadas al proyecto.</p>
        </div>
        <ProyectosAdminDetailGallery imagenes={proyecto.imagenes} />
      </section>
    </article>
  )
}

export default ProyectosAdminDetailView
