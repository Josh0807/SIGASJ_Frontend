import {
  IconAddressBook,
  IconBriefcase2,
  IconChartHistogram,
  IconChecklist,
  IconClipboardCheck,
  IconDropletCheck,
  IconFileText,
  IconFolderCog,
  IconLayoutDashboard,
  IconMenu2,
  IconPhoto,
  IconPackages,
  IconSpeakerphone,
  IconUserCircle,
  IconUserCheck,
  IconUsers,
  IconTool,
  IconX,
} from '@tabler/icons-react'
import type { AdminNavIconName, AdminNavIconProps } from '../props'

export type { AdminNavIconName, AdminNavIconProps }

const ICONS = {
  dashboard: IconLayoutDashboard,
  usuarios: IconUsers,
  abonados: IconUserCheck,
  inventario: IconPackages,
  solicitudes: IconFileText,
  lecturas: IconBriefcase2,
  averias: IconTool,
  actividades: IconClipboardCheck,
  'actividades-fontanero': IconChecklist,
  reportes: IconChartHistogram,
  proyectos: IconFolderCog,
  galeria: IconPhoto,
  comunicados: IconSpeakerphone,
  contacto: IconAddressBook,
  transparencia: IconDropletCheck,
  perfil: IconUserCircle,
  menu: IconMenu2,
  menuClose: IconX,
} satisfies Record<AdminNavIconName, typeof IconLayoutDashboard>

const AdminNavIcon = ({ name }: AdminNavIconProps) => {
  const IconComponent = ICONS[name]

  return <IconComponent size={20} stroke={1.7} aria-hidden="true" focusable="false" />
}

export default AdminNavIcon
