import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { IconMinus, IconSend, IconX } from '@tabler/icons-react'
import SageGotin from './SageGotin'
import { useSageIa } from './SageIaContext'

const SageIaPanel = () => {
  const {
    open,
    busy,
    messages,
    status,
    suggestions,
    closePanel,
    minimizePanel,
    sendMessage,
  } = useSageIa()
  const titleId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState('')
  const demoMode = !status.enabled || status.mode === 'demo'
  const showSuggestions = messages.length <= 2 && !busy

  useEffect(() => {
    if (!open) return
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
    inputRef.current?.focus()
  }, [open, messages, busy])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closePanel()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, closePanel])

  if (!open) return null

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const value = input
    setInput('')
    void sendMessage(value)
  }

  return (
    <div className="sage-ia__panel-root" role="presentation">
      <button
        type="button"
        className="sage-ia__backdrop"
        aria-label="Cerrar Sage IA"
        onClick={closePanel}
      />
      <aside
        className="sage-ia__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="sage-ia__header">
          <div className="sage-ia__brand">
            <SageGotin size="md" className="sage-ia__avatar" />
            <div className="min-w-0">
              <h2 id={titleId} className="sage-ia__title">
                Sage IA
              </h2>
              <p className="sage-ia__status">Orientación del panel</p>
              <span
                className={`sage-ia__badge${demoMode ? '' : ' sage-ia__badge--live'}`}
              >
                {demoMode ? 'Modo demostración' : 'Conectada'}
              </span>
            </div>
          </div>
          <div className="sage-ia__header-actions">
            <button
              type="button"
              className="sage-ia__icon-btn"
              onClick={minimizePanel}
              aria-label="Minimizar Sage IA"
            >
              <IconMinus size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="sage-ia__icon-btn"
              onClick={closePanel}
              aria-label="Cerrar Sage IA"
            >
              <IconX size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div
          ref={listRef}
          className="sage-ia__messages"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`sage-ia__row sage-ia__row--${message.role === 'user' ? 'user' : 'assistant'}`}
            >
              <div
                className={`sage-ia__bubble sage-ia__bubble--${message.role === 'user' ? 'user' : 'assistant'}`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {busy ? (
            <div className="sage-ia__row sage-ia__row--assistant">
              <div className="sage-ia__bubble sage-ia__bubble--assistant sage-ia__typing">
                Sage está pensando…
              </div>
            </div>
          ) : null}
        </div>

        {showSuggestions ? (
          <div className="sage-ia__suggestions" aria-label="Sugerencias según el módulo">
            <p className="sage-ia__suggestions-label">Sugerencias</p>
            <div className="sage-ia__chips">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="sage-ia__chip"
                  disabled={busy}
                  onClick={() => {
                    void sendMessage(item.label)
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <form className="sage-ia__form" onSubmit={onSubmit}>
          <label className="visually-hidden" htmlFor="sage-ia-input">
            Mensaje para Sage IA
          </label>
          <input
            id="sage-ia-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Escribe tu consulta…"
            autoComplete="off"
            disabled={busy}
            maxLength={500}
          />
          <button
            type="submit"
            className="sage-ia__send"
            disabled={busy || !input.trim()}
            aria-label="Enviar mensaje"
          >
            <IconSend size={18} aria-hidden="true" />
          </button>
        </form>
      </aside>
    </div>
  )
}

export default SageIaPanel
