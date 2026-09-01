import type { AdminNavIconName, AdminNavIconProps } from '../props'

export type { AdminNavIconName, AdminNavIconProps }

const icon = (paths: string) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d={paths}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ICONS: Record<AdminNavIconName, string> = {
  dashboard: 'M3.5 3.5h5v5h-5z M11.5 3.5h5v5h-5z M3.5 11.5h5v5h-5z M11.5 11.5h5v5h-5z',
  usuarios: 'M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M4.5 16.5c.8-2.3 2.8-3.5 5.5-3.5s4.7 1.2 5.5 3.5',
  abonados: 'M7 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M13.5 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M2.8 16.2c.7-2 2.4-3 4.7-3s4 1 4.7 3 M11 13.5c1.9 0 3.4.8 4.2 2.5',
  inventario: 'M3.5 7 10 3.5 16.5 7 10 10.5z M3.5 7v6.5L10 17l6.5-3.5V7 M10 10.5V17',
  solicitudes: 'M6 5.5h8a1.5 1.5 0 0 1 1.5 1.5v9H4.5V7A1.5 1.5 0 0 1 6 5.5z M7.5 3.5h5v4h-5z M7 11h6 M7 13.5h4',
  lecturas: 'M4 5.5h12v10H4z M7 5.5V4h6v1.5 M7 9h.01 M10 9h3 M7 12h.01 M10 12h3',
  averias: 'M10 3.8 3.8 16.2h12.4z M10 8.5v3.2 M10 14.2h.01',
  reportes: 'M5 3.5h7l3 3v10H5z M12 3.5v3h3 M7.5 13.5v-2 M10 13.5V9 M12.5 13.5v-3',
  proyectos: 'M4.5 5.5h11v10h-11z M7 5.5V4h6v1.5 M7 10l2 2 4-4',
  galeria: 'M4 5.5h12v9H4z M4 12.2l3.2-3.2 2.8 2.8 2-2 3.5 3.5 M8 8.2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  comunicados: 'M3.5 9v2.5l9 3V6z M12.5 7.5c1.3.5 2 1.4 2 2.8s-.7 2.3-2 2.8 M5.5 12.2l1 4.3h2.5l-1-3.4',
  contacto: 'M10 17s5-4.8 5-9a5 5 0 0 0-10 0c0 4.2 5 9 5 9z M10 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  transparencia: 'M10 3.5s-4.5 5.1-4.5 8a4.5 4.5 0 0 0 9 0c0-2.9-4.5-8-4.5-8z M8 12.5c.4.8 1 1.2 2 1.2',
  perfil: 'M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M4.5 16.5c.8-2.3 2.8-3.5 5.5-3.5s4.7 1.2 5.5 3.5',
  menu: 'M4 6h12 M4 10h12 M4 14h12',
  menuClose: 'M6 6l8 8 M14 6l-8 8',
}

const AdminNavIcon = ({ name }: AdminNavIconProps) => icon(ICONS[name])

export default AdminNavIcon
