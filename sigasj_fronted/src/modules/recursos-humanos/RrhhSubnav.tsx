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
            label: 'Solicitudes a revisar',
            end: false,
          },
        ]
      : []),
    { to: PERMISOS_PATH, label: 'Permisos otorgados', end: false },
    { to: INCAPACIDADES_PATH, label: 'Incapacidades', end: false },
    { to: VACACIONES_PATH, label: 'Vacaciones', end: false },
  ]

  return (
    <nav
      className="flex flex-wrap gap-2 rounded-2xl border border-sky-100 bg-white p-2 shadow-[0_8px_20px_rgba(30,90,156,0.06)]"
      aria-label="Secciones de Recursos Humanos"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `inline-flex min-h-11 items-center justify-center rounded-xl px-4 font-extrabold no-underline transition hover:no-underline ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-sky-50 hover:text-blue-800'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
