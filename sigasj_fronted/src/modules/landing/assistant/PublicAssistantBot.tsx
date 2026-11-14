import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import {
  IconDropletFilled,
  IconMessageChatbot,
  IconSend,
  IconX,
} from '@tabler/icons-react'
import {
  ASSISTANT_GREETING,
  ASSISTANT_SUGGESTIONS,
  type AssistantReply,
} from './assistantKnowledge'
import {
  askAssistant,
  getAssistantStatus,
  type AssistantChatHistoryItem,
} from './assistantApi'

type ChatMessage = {
  id: string
  role: 'bot' | 'user'
  text: string
  links?: AssistantReply['links']
  source?: 'ai' | 'local'
}

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`

const PublicAssistantBot = () => {
  const panelId = useId().replace(/:/g, '')
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'bot', text: ASSISTANT_GREETING },
  ])
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const showSuggestions = messages.length <= 2 && !busy

  useEffect(() => {
    void getAssistantStatus().then((status) => setAiEnabled(status.enabled))
  }, [])

  useEffect(() => {
    if (!open) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    inputRef.current?.focus()
  }, [open, messages, busy])

  const pushBotReply = (reply: AssistantReply & { source?: 'ai' | 'local' }) => {
    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        role: 'bot',
        text: reply.text,
        links: reply.links,
        source: reply.source,
      },
    ])
  }

  const ask = async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed || busy) return

    const nextMessages: ChatMessage[] = [
      ...messages,
      { id: makeId(), role: 'user', text: trimmed },
    ]
    setMessages(nextMessages)
    setInput('')
    setBusy(true)

    const history: AssistantChatHistoryItem[] = nextMessages
      .filter((m) => m.id !== 'welcome')
      .map((m): AssistantChatHistoryItem => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }))
      .slice(0, -1)

    try {
      const reply = await askAssistant(trimmed, history)
      pushBotReply(reply)
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void ask(input)
  }

  return (
    <div className="public-assistant" data-ui="public-assistant">
      {open ? (
        <section
          id={panelId}
          className="public-assistant__panel"
          aria-label="Asistente virtual de SIGASJ"
        >
          <header className="public-assistant__header">
            <div className="public-assistant__brand">
              <span className="public-assistant__avatar" aria-hidden="true">
                <IconDropletFilled size={22} stroke={1.5} />
              </span>
              <div>
                <h2 className="public-assistant__title">Asistente SIGASJ</h2>
                <p className="public-assistant__status">
                  <span
                    className={`public-assistant__dot ${
                      aiEnabled
                        ? 'public-assistant__dot--ai'
                        : 'public-assistant__dot--local'
                    }`}
                  />
                  {aiEnabled ? 'Respuestas con IA' : 'Guía comunitaria'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="public-assistant__icon-btn"
              aria-label="Cerrar asistente"
              onClick={() => setOpen(false)}
            >
              <IconX size={18} stroke={2} aria-hidden="true" />
            </button>
          </header>

          <div ref={listRef} className="public-assistant__messages" role="log" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`public-assistant__row public-assistant__row--${message.role}`}
              >
                {message.role === 'bot' ? (
                  <span className="public-assistant__mini-avatar" aria-hidden="true">
                    <IconDropletFilled size={14} stroke={1.6} />
                  </span>
                ) : null}
                <div
                  className={`public-assistant__bubble public-assistant__bubble--${message.role}`}
                >
                  <p>{message.text}</p>
                  {message.links && message.links.length > 0 ? (
                    <div className="public-assistant__links">
                      {message.links.map((link) => (
                        <a key={`${message.id}-${link.href}`} href={link.href}>
                          {link.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {busy ? (
              <div className="public-assistant__row public-assistant__row--bot">
                <span className="public-assistant__mini-avatar" aria-hidden="true">
                  <IconDropletFilled size={14} stroke={1.6} />
                </span>
                <div
                  className="public-assistant__bubble public-assistant__bubble--bot public-assistant__typing"
                  aria-label="El asistente está escribiendo"
                >
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : null}
          </div>

          {showSuggestions ? (
            <div className="public-assistant__suggestions" aria-label="Preguntas sugeridas">
              <p className="public-assistant__suggestions-label">Consultas frecuentes</p>
              <div className="public-assistant__chips">
                {ASSISTANT_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="public-assistant__chip"
                    disabled={busy}
                    onClick={() => void ask(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <form className="public-assistant__form" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor={`${panelId}-input`}>
              Escriba su consulta
            </label>
            <input
              ref={inputRef}
              id={`${panelId}-input`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escriba su consulta…"
              autoComplete="off"
              maxLength={500}
              disabled={busy}
            />
            <button
              type="submit"
              aria-label="Enviar consulta"
              disabled={busy || !input.trim()}
            >
              <IconSend size={18} stroke={2} aria-hidden="true" />
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className={`public-assistant__launcher ${open ? 'is-open' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="public-assistant__launcher-icon" aria-hidden="true">
          {open ? (
            <IconX size={22} stroke={2} />
          ) : (
            <IconMessageChatbot size={22} stroke={2} />
          )}
        </span>
        <span>{open ? 'Cerrar' : 'Asistente'}</span>
      </button>
    </div>
  )
}

export default PublicAssistantBot
