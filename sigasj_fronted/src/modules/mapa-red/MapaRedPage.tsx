import { AdminShell, PageHeader } from '../../shared/ui'
import { MAPA_RED_TITLE } from './mapaRedPaths'
import MapaRedPanel from './MapaRedPanel'

/** Página completa del mapa de red (misma UI embebible en el dashboard). */
export default function MapaRedPage() {
  return (
    <AdminShell className="gap-4" aria-labelledby="mapa-red-title">
      <PageHeader
        eyebrow="Operación · Red de agua"
        title={<span id="mapa-red-title">{MAPA_RED_TITLE}</span>}
        description="Consulte sectores, averías activas y estado operativo de la red en San Juan."
      />
      <MapaRedPanel />
    </AdminShell>
  )
}