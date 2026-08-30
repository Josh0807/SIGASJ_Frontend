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
  const imagenPrincipal = proyecto.imagenPrincipal?.trim()

  return (
    <article
      className="proyectos-admin__detail"
      aria-label="Detalle del proyecto"
    >
      <h2>Detalle del proyecto</h2>
      <dl>
        <div>
          <dt>ID</dt>
          <dd>{proyecto.id}</dd>
        </div>
        <div>
          <dt>Nombre</dt>
          <dd>{textOrEmpty(proyecto.nombre)}</dd>
        </div>
        <div>
          <dt>Descripción</dt>
          <dd>{textOrEmpty(proyecto.descripcion)}</dd>
        </div>
        <div>
          <dt>Encargado de realización</dt>
          <dd>{textOrEmpty(proyecto.encargadoRealizacion)}</dd>
        </div>
        <div>
          <dt>Duración</dt>
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
          <dt>Visibilidad</dt>
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

      <section aria-label="Galería">
        <h3>Galería</h3>
        <ProyectosAdminDetailGallery imagenes={proyecto.imagenes} />
      </section>
    </article>
  )
}

export default ProyectosAdminDetailView
