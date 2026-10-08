import { Link } from 'react-router-dom'
import { type AdminProyecto } from './types'

type ProyectosAdminRowActionsProps = {
  proyecto: AdminProyecto
  editTo: string
  onToggleVisibilidad: (proyecto: AdminProyecto) => void
}

const ProyectosAdminRowActions = ({
  proyecto,
  editTo,
  onToggleVisibilidad,
}: ProyectosAdminRowActionsProps) => (
  <div className="gallery-admin__actions !flex !items-center !gap-2.5">
    <Link
      to={editTo}
      className="!inline-flex !min-h-12 !items-center !justify-center !gap-2 !rounded-xl !border !border-blue-600 !bg-gradient-to-r !from-blue-700 !to-sky-500 !px-5 !font-extrabold !text-white !no-underline !shadow-md !transition-all !duration-300 hover:!-translate-y-0.5 hover:!shadow-lg active:!translate-y-0 active:!scale-[0.98]"
      aria-label={`Editar ${proyecto.nombre}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="!h-5 !w-5 !fill-none !stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </svg>
      Editar
    </Link>
    <button
      type="button"
      className={`!inline-flex !min-h-12 !items-center !justify-center !gap-2 !rounded-xl !border !px-5 !font-extrabold !shadow-sm !transition-all !duration-300 hover:!-translate-y-0.5 hover:!shadow-md active:!translate-y-0 active:!scale-[0.98] ${
        proyecto.activo
          ? '!border-amber-300 !bg-amber-50 !text-amber-800 hover:!bg-amber-100'
          : '!border-emerald-300 !bg-emerald-50 !text-emerald-700 hover:!bg-emerald-100'
      }`}
      aria-label={`${proyecto.activo ? 'Inactivar' : 'Activar'} visibilidad de ${proyecto.nombre}`}
      onClick={() => onToggleVisibilidad(proyecto)}
    >
      <span aria-hidden="true" className={`!h-2.5 !w-2.5 !rounded-full ${proyecto.activo ? '!bg-amber-500' : '!bg-emerald-500'}`} />
      {proyecto.activo ? 'Inactivar' : 'Activar'}
    </button>
  </div>
)


export default ProyectosAdminRowActions
