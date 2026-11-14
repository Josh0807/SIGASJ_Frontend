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
      className="min-w-0 rounded-2xl border border-[color:var(--asada-line,#d7e5f1)] bg-[color:var(--asada-surface,#fff)] p-1.5 shadow-[0_8px_22px_rgba(18,63,112,0.06)]"
      aria-label="Secciones de Recursos Humanos"
    >
      <div className="flex min-w-0 flex-wrap gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `group inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-center text-sm font-bold no-underline transition-[background-color,color,box-shadow,transform] duration-200 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--asada-navy,#1e5a9c)] focus-visible:ring-offset-2 motion-reduce:transition-none ${
                isActive
                  ? 'bg-[color:var(--asada-navy,#1e5a9c)] text-white shadow-[0_8px_18px_rgba(30,90,156,0.22)]'
                  : 'bg-transparent text-[color:var(--asada-muted,#5b7390)] hover:bg-[color:var(--asada-ice,#eaf6ff)] hover:text-[color:var(--asada-ink,#123f70)]'
              }`
            }
          >
            <item.icon size={17} stroke={1.9} aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
