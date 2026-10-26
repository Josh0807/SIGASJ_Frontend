import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/components/AuthContext'
import {
  InternalAdminRoleName,
  userHasAllowedRole,
} from '../auth/utils/adminNavigation'
import { SOLICITUDES_AUSENCIA_ADMIN_PATH } from '../solicitudes-ausencia/solicitudesAusenciaPaths'
import {
  INCAPACIDADES_PATH,
  PERMISOS_PATH,
  RRHH_PATH,
  VACACIONES_PATH,
} from './recursosHumanosPaths'

export default function RrhhSubnav() {
  const { user } = useAuth()
  const verSolicitudes = userHasAllowedRole(user, [
    InternalAdminRoleName.Administradora,
  ])

  const items = [
    { to: RRHH_PATH, label: 'Colaboradores', end: true },
    ...(verSolicitudes
      ? [
          {
            to: SOLICITUDES_AUSENCIA_ADMIN_PATH,
            label: 'Solicitudes',
            end: false,
          },
        ]
      : []),
    { to: PERMISOS_PATH, label: 'Permisos', end: false },
    { to: INCAPACIDADES_PATH, label: 'Incapacidades', end: false },
    { to: VACACIONES_PATH, label: 'Vacaciones', end: false },
  ]

  return (
    <nav
      className="min-w-0 rounded-2xl border border-sky-100 bg-white p-1.5"
      aria-label="Secciones de Recursos Humanos"
    >
      <div className="flex min-w-0 flex-wrap gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `inline-flex h-11 min-w-[8.75rem] flex-1 items-center justify-center rounded-xl px-3 text-center text-sm font-bold no-underline transition hover:no-underline ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-blue-800'
              }`
            }
          >
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
