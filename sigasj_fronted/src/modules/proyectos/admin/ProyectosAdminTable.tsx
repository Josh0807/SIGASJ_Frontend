import { ESTADO_PROYECTO_LABELS } from '../types/estadoProyecto'
import { type AdminProyecto } from './types'
import ProyectosAdminRowActions from './ProyectosAdminRowActions'
import { proyectosAdminEditPath } from './proyectosAdminPaths'

type ProyectosAdminTableProps = {
  proyectos: AdminProyecto[]
}

const visibilidadLabel = (activo: boolean) => (activo ? 'Activo' : 'Inactivo')

const ProyectosAdminTable = ({ proyectos }: ProyectosAdminTableProps) => (
  <div className="table-responsive proyectos-admin__table">
    <table>
      <caption className="visually-hidden">Listado de proyectos</caption>
      <thead>
        <tr>
          <th scope="col">Proyecto</th>
          <th scope="col">Estado</th>
          <th scope="col">Duración</th>
          <th scope="col">Visibilidad</th>
          <th scope="col">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {proyectos.map((proyecto) => {
          const duracion = proyecto.duracion?.trim()

          return (
            <tr key={proyecto.id}>
              <td className="table-responsive__name">{proyecto.nombre}</td>
              <td>
                <ul className="gallery-admin__badges">
                  <li>
                    {ESTADO_PROYECTO_LABELS[proyecto.estado] ?? proyecto.estado}
                  </li>
                </ul>
              </td>
              <td>{duracion ? duracion : '—'}</td>
              <td>
                <ul className="gallery-admin__badges">
                  <li className={proyecto.activo ? 'is-active' : 'is-inactive'}>
                    {visibilidadLabel(proyecto.activo)}
                  </li>
                </ul>
              </td>
              <td>
                <ProyectosAdminRowActions
                  nombre={proyecto.nombre}
                  editTo={proyectosAdminEditPath(proyecto.id)}
                />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)

export default ProyectosAdminTable
