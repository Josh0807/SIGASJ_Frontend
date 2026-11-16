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

const displayProyectoNombre = (nombre: string) => {
  const raw = nombre.trim()
  return raw.replace(/\s+\d{10,}\s*$/, '').trim() || raw
}

const mobileCellClass =
  'max-[1199px]:grid max-[1199px]:grid-cols-[minmax(105px,40%)_minmax(0,1fr)] max-[1199px]:items-center max-[1199px]:gap-2.5 max-[1199px]:whitespace-normal max-[1199px]:px-0 max-[1199px]:py-2.5 max-[1199px]:before:text-xs max-[1199px]:before:font-bold max-[1199px]:before:uppercase max-[1199px]:before:text-[#587187] max-[1199px]:before:content-[attr(data-label)]'

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
    <div className="table-responsive proyectos-admin__table overflow-x-auto max-[1199px]:overflow-visible max-[1199px]:border-0 max-[1199px]:bg-transparent max-[1199px]:shadow-none">
      <table className="max-[1199px]:block max-[1199px]:min-w-0">
        <caption className="visually-hidden">Listado de proyectos</caption>
        <thead className="max-[1199px]:hidden">
          <tr>
            <th scope="col">Proyecto</th>
            <th scope="col">Estado</th>
            <th scope="col">Duración</th>
            <th scope="col">Visibilidad</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody className="max-[1199px]:block">
          {proyectos.map((proyecto) => {
            const duracion = proyecto.duracion?.trim()
            const nombreVisible = displayProyectoNombre(proyecto.nombre)

            return (
              <tr
                className="max-[1199px]:mb-3.5 max-[1199px]:block max-[1199px]:rounded-[14px] max-[1199px]:border max-[1199px]:border-[#d7e5f1] max-[1199px]:bg-white max-[1199px]:px-3.5 max-[1199px]:py-2 max-[1199px]:shadow-[0_4px_14px_rgba(18,63,112,0.05)]"
                key={proyecto.id}
              >
                <td
                  className={`table-responsive__name ${mobileCellClass}`}
                  data-label="Proyecto"
                >
                  {nombreVisible}
                </td>
                <td
                  className={`${mobileCellClass} max-[1199px]:[&_.proyectos-admin__estado-select]:min-w-0 max-[1199px]:[&_.proyectos-admin__estado-select]:w-full`}
                  data-label="Estado"
                >
                  <div className="proyectos-admin__estado-cell">
                    <select
                      className="proyectos-admin__estado-select"
                      aria-label={`Cambiar estado de ${nombreVisible}`}
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
                <td className={mobileCellClass} data-label="Duración">
                  {duracion ? duracion : '—'}
                </td>
                <td className={mobileCellClass} data-label="Visibilidad">
                  <ul className="gallery-admin__badges">
                    <li className={proyecto.activo ? 'is-active' : 'is-inactive'}>
                      <span
                        className="proyectos-admin__vis-dot"
                        aria-hidden="true"
                      />
                      {visibilidadLabel(proyecto.activo)}
                    </li>
                  </ul>
                </td>
                <td
                  className={`${mobileCellClass} max-[1199px]:border-b-0 max-[1199px]:[&_.gallery-admin__actions]:w-full max-[1199px]:[&_.gallery-admin__actions]:min-w-0 max-[1199px]:[&_.gallery-admin__actions]:flex-wrap`}
                  data-label="Acciones"
                >
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
        message={`¿Está seguro de que desea inactivar el proyecto «${inactivatingProyecto ? displayProyectoNombre(inactivatingProyecto.nombre) : ''}»? Dejará de mostrarse en el sitio público.`}
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
