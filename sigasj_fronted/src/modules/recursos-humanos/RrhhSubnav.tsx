import { NavLink } from 'react-router-dom'
import {
  IconCalendarCheck,
  IconClipboardList,
  IconFileDescription,
  IconFirstAidKit,
  IconUsersGroup,
} from '@tabler/icons-react'
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
    { to: RRHH_PATH, label: 'Colaboradores', end: true, icon: IconUsersGroup },
    ...(verSolicitudes
      ? [
          {
            to: SOLICITUDES_AUSENCIA_ADMIN_PATH,
            label: 'Solicitudes',
            end: false,
            icon: IconClipboardList,
          },
        ]
      : []),
    { to: PERMISOS_PATH, label: 'Permisos', end: false, icon: IconFileDescription },
    { to: INCAPACIDADES_PATH, label: 'Incapacidades', end: false, icon: IconFirstAidKit },
    { to: VACACIONES_PATH, label: 'Vacaciones', end: false, icon: IconCalendarCheck },
  ]

  return (
    <nav
      className="min-w-0 rounded-2xl border border-white/80 bg-white/90 p-2 shadow-[0_10px_30px_rgba(30,90,156,0.08)] ring-1 ring-sky-100 backdrop-blur-sm"
      aria-label="Secciones de Recursos Humanos"
    >
      <div className="flex min-w-0 flex-wrap gap-1.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `group inline-flex h-12 min-w-[8.75rem] flex-1 items-center justify-center gap-2 rounded-xl px-3 text-center text-sm font-extrabold no-underline transition-all duration-200 hover:-translate-y-0.5 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-[0_8px_20px_rgba(37,99,235,0.24)]'
                  : 'bg-slate-50/80 text-slate-600 hover:bg-sky-50 hover:text-blue-800 hover:shadow-sm'
              }`
            }
          >
            <item.icon size={18} stroke={1.9} aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
