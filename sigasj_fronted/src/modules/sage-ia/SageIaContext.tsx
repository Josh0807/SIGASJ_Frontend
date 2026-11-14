import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import {
  askSageIa,
  getSageStatus,
  type SageChatHistoryItem,
  type SageStatus,
} from './sageIaApi'
import { SAGE_GREETING, getSageSuggestionsForPath } from './sageIaSuggestions'

export type SageMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  source?: 'ai' | 'demo'
}

type SageIaContextValue = {
  open: boolean
  minimized: boolean
  busy: boolean
  messages: SageMessage[]
  status: SageStatus
  suggestions: ReturnType<typeof getSageSuggestionsForPath>
  modulePath: string
  openPanel: () => void
  closePanel: () => void
  minimizePanel: () => void
  restorePanel: () => void
  sendMessage: (text: string) => Promise<void>
}

const SageIaContext = createContext<SageIaContextValue | null>(null)

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `sage-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const SageIaProvider = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<SageStatus>({
    enabled: false,
    mode: 'demo',
    label: 'Modo demostración',
  })
  const [messages, setMessages] = useState<SageMessage[]>([
    { id: 'welcome', role: 'assistant', text: SAGE_GREETING },
  ])

  useEffect(() => {
    void getSageStatus().then(setStatus)
  }, [])

  const suggestions = useMemo(
    () => getSageSuggestionsForPath(pathname),
    [pathname],
  )

  const openPanel = useCallback(() => {
    setOpen(true)
    setMinimized(false)
  }, [])

  const closePanel = useCallback(() => {
    setOpen(false)
    setMinimized(false)
  }, [])

  const minimizePanel = useCallback(() => {
    setMinimized(true)
    setOpen(false)
  }, [])

  const restorePanel = useCallback(() => {
    setMinimized(false)
    setOpen(true)
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busy) return

      const userMessage: SageMessage = {
        id: makeId(),
        role: 'user',
        text: trimmed,
      }

      setMessages((prev) => [...prev, userMessage])
      setBusy(true)

      const history: SageChatHistoryItem[] = [...messages, userMessage]
        .filter((item) => item.id !== 'welcome')
        .slice(0, -1)
        .map((item) => ({
          role: item.role,
          content: item.text,
        }))

      try {
        const reply = await askSageIa(trimmed, history, pathname)
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: 'assistant',
            text: reply.text,
            source: reply.source,
          },
        ])
        if (reply.source === 'demo' && status.enabled) {
          setStatus({
            enabled: false,
            mode: 'demo',
            label: 'Modo demostración',
          })
        }
      } finally {
        setBusy(false)
      }
    },
    [busy, messages, pathname, status.enabled],
  )

  const value = useMemo<SageIaContextValue>(
    () => ({
      open,
      minimized,
      busy,
      messages,
      status,
      suggestions,
      modulePath: pathname,
      openPanel,
      closePanel,
      minimizePanel,
      restorePanel,
      sendMessage,
    }),
    [
      open,
      minimized,
      busy,
      messages,
      status,
      suggestions,
      pathname,
      openPanel,
      closePanel,
      minimizePanel,
      restorePanel,
      sendMessage,
    ],
  )

  return <SageIaContext.Provider value={value}>{children}</SageIaContext.Provider>
}

export const useSageIa = () => {
  const ctx = useContext(SageIaContext)
  if (!ctx) {
    throw new Error('useSageIa debe usarse dentro de SageIaProvider')
  }
  return ctx
}
