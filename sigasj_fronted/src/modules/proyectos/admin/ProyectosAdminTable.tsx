import { useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import {
  ESTADO_PROYECTO_OPTIONS,
  type EstadoProyecto,
} from '../types/estadoProyecto'
import { type AdminProyecto } from './types'
import ProyectosAdminRowActions from './ProyectosAdminRowActions'
import { proyectosAdminEditPath } from './proyectosAdminPaths'

type ProyectosAdminTableProps = {
  proyectos: AdminProyecto[]
  onToggleVisibilidad?: (id: number, activo: boolean) => Promise<void>
  onEstadoChange?: (id: number, estado: EstadoProyecto) => Promise<void>
}

const visibilidadLabel = (activo: boolean) => (activo ? 'Activo' : 'Inactivo')

const ProyectosAdminTable = ({
  proyectos,
  onToggleVisibilidad,
  onEstadoChange,
}: ProyectosAdminTableProps) => {
  const [inactivatingProyecto, setInactivatingProyecto] = useState<AdminProyecto | null>(
    null,
  )

  const handleRowToggleVisibilidad = (proyecto: AdminProyecto) => {
    if (proyecto.activo) {
      setInactivatingProyecto(proyecto)
    } else {
      void onToggleVisibilidad?.(proyecto.id, true)
    }
  }

  const handleConfirmInactivar = async () => {
    if (!inactivatingProyecto) return
    const targetId = inactivatingProyecto.id
    setInactivatingProyecto(null)
    await onToggleVisibilidad?.(targetId, false)
  }

  return (
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
                  <div className="proyectos-admin__estado-cell">
                    <select
                      className="proyectos-admin__estado-select"
                      aria-label={`Cambiar estado de ${proyecto.nombre}`}
                      value={proyecto.estado}
                      onChange={(e) =>
                        onEstadoChange?.(
                          proyecto.id,
                          e.target.value as EstadoProyecto,
                        )
                      }
                    >
                      {ESTADO_PROYECTO_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    proyecto={proyecto}
                    editTo={proyectosAdminEditPath(proyecto.id)}
                    onToggleVisibilidad={handleRowToggleVisibilidad}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <ConfirmDialog
        isOpen={inactivatingProyecto !== null}
        title="Inactivar visibilidad de proyecto"
        message={`¿Está seguro de que desea inactivar el proyecto «${inactivatingProyecto?.nombre}»? Dejará de mostrarse en el sitio público.`}
        confirmLabel="Inactivar proyecto"
        cancelLabel="Cancelar"
        confirmDanger
        onCancel={() => setInactivatingProyecto(null)}
        onConfirm={() => void handleConfirmInactivar()}
      />
    </div>
  )
}

export default ProyectosAdminTable
