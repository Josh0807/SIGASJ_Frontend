import MapaRedPanel from './MapaRedPanel'

/** Página completa del mapa de red (misma UI embebible en el dashboard). */
export default function MapaRedPage() {
  return (
    <main aria-labelledby="mapa-red-title">
      <MapaRedPanel showPageTitle />
    </main>
  )
}
