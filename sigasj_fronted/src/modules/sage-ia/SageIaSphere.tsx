import SageGotin from './SageGotin'
import { useSageIa } from './SageIaContext'

const SageIaSphere = () => {
  const { open, minimized, openPanel, restorePanel } = useSageIa()

  return (
    <>
      {minimized ? (
        <button
          type="button"
          className="sage-ia__minimized"
          onClick={restorePanel}
          aria-label="Restaurar Sage IA"
        >
          <SageGotin size="sm" />
          Sage IA
        </button>
      ) : null}

      <div className={`sage-ia__launcher${open ? ' is-hidden' : ''}`}>
        {!open && !minimized ? (
          <p className="sage-ia__hello" role="status">
            Gotín te ayuda
          </p>
        ) : null}
        <button
          type="button"
          className="sage-ia__sphere"
          onClick={openPanel}
          aria-label="Abrir Sage IA"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="sage-ia__sphere-glow" aria-hidden="true" />
          <SageGotin size="lg" />
        </button>
      </div>
    </>
  )
}

export default SageIaSphere
