import { AdminShell, PageHeader } from '../../shared/ui'
import { MAPA_RED_TITLE } from './mapaRedPaths'
import MapaRedPanel from './MapaRedPanel'

/** Página completa del mapa de red (misma UI embebible en el dashboard). */
export default function MapaRedPage() {
  return (
    <AdminShell className="gap-4" aria-labelledby="mapa-red-title">
      <PageHeader
        id="mapa-red-title"
        title={MAPA_RED_TITLE}
        description="Operación clara de San Juan: sectores, direcciones reportadas y estado de la red en un solo vistazo."
      />
      <MapaRedPanel className="mapa-red--showcase" hideShellTitle />
    </AdminShell>
  )
}