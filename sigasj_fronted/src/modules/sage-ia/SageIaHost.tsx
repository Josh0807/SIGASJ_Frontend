import SageIaPanel from './SageIaPanel'
import SageIaSphere from './SageIaSphere'
import './styles/sage-ia.css'

/**
 * Host de Sage IA para el panel administrativo.
 * Debe montarse dentro de SageIaProvider (p. ej. AdminLayout).
 */
const SageIaHost = () => (
  <div className="sage-ia" data-ui="sage-ia">
    <SageIaSphere />
    <SageIaPanel />
  </div>
)

export default SageIaHost
