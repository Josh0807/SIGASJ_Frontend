import { createContext } from 'react'
import type { SageStatus } from './sageIaApi'
import type { getSageSuggestionsForPath } from './sageIaSuggestions'

export type SageMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  source?: 'ai' | 'demo'
}

export type SageIaContextValue = {
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

export const SageIaContext = createContext<SageIaContextValue | null>(null)
