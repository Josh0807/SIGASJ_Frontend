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
  dashboard: 'M3.5 10.5 10 4l6.5 6.5V16a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16z M8 17.5v-5h4v5',
  usuarios: 'M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M4.5 16.5c.8-2.3 2.8-3.5 5.5-3.5s4.7 1.2 5.5 3.5',
  abonados: 'M7 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M13.5 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M2.8 16.2c.7-2 2.4-3 4.7-3s4 1 4.7 3 M11 13.5c1.9 0 3.4.8 4.2 2.5',
  inventario: 'M4 6.5h12v9H4z M4 9.5h12 M10 6.5v9',
  solicitudes: 'M6 4.5h8a1.5 1.5 0 0 1 1.5 1.5v10l-2.2-1.4L11.5 16 9.2 14.6 7 16V6A1.5 1.5 0 0 1 8.5 4.5z',
  lecturas: 'M4.5 15.5h11 M6 15.5V8.5 M10 15.5V5.5 M14 15.5v-4',
  averias: 'M10 3.8 3.8 16.2h12.4z M10 8.5v3.2 M10 14.2h.01',
  reportes: 'M5.5 4.5h6l3 3v8H5.5z M11.5 4.5v3h3 M7.5 11h5 M7.5 13.5h3.5',
  galeria: 'M4 5.5h12v9H4z M4 12.2l3.2-3.2 2.8 2.8 2-2 3.5 3.5 M8 8.2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  contacto: 'M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M4.5 16.5c.8-2.3 2.8-3.5 5.5-3.5s4.7 1.2 5.5 3.5 M6.5 8.5h7M6.5 11h4',
  transparencia: 'M10 3.5 16 7v6l-6 3.5L4 13V7z M10 10.2V16.5',
  perfil: 'M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M4.5 16.5c.8-2.3 2.8-3.5 5.5-3.5s4.7 1.2 5.5 3.5',
  menu: 'M4 6h12 M4 10h12 M4 14h12',
  menuClose: 'M6 6l8 8 M14 6l-8 8',
}

const AdminNavIcon = ({ name }: AdminNavIconProps) => icon(ICONS[name])

export default AdminNavIcon
