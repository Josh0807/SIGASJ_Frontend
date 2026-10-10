import { NavLink } from 'react-router-dom'
import { PERMISOS_PATH, RRHH_PATH } from './recursosHumanosPaths'

const items = [
  { to: RRHH_PATH, label: 'Colaboradores', end: true },
  { to: PERMISOS_PATH, label: 'Permisos', end: false },
]

export default function RrhhSubnav() {
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
