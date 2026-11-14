import { fetchWithAuth } from '../../services/http/httpClient'
import { buildSageDemoReply } from './sageIaDemoReplies'

export type SageChatHistoryItem = {
  role: 'user' | 'assistant'
  content: string
}

export type SageChatResult = {
  text: string
  source: 'ai' | 'demo'
}

export type SageStatus = {
  enabled: boolean
  mode: string
  label: string
}

type AiChatResponse = {
  reply: string
  provider?: string
  source?: string
}

export async function getSageStatus(): Promise<SageStatus> {
  try {
    const data = await fetchWithAuth<SageStatus>('/admin/assistant/status')
    return {
      enabled: Boolean(data.enabled),
      mode: data.mode || (data.enabled ? 'ai' : 'demo'),
      label: data.label || (data.enabled ? 'Sage IA conectada' : 'Modo demostración'),
    }
  } catch {
    return {
      enabled: false,
      mode: 'demo',
      label: 'Modo demostración',
    }
  }
}

export async function askSageIa(
  message: string,
  history: SageChatHistoryItem[] = [],
  modulePath = '/admin',
): Promise<SageChatResult> {
  try {
    const data = await fetchWithAuth<AiChatResponse>('/admin/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        history: history.slice(-8),
        modulePath,
      }),
    })
    const text = data.reply?.trim()
    if (!text) throw new Error('Respuesta vacía')
    return { text, source: 'ai' }
  } catch {
    return {
      text: buildSageDemoReply(message, modulePath),
      source: 'demo',
    }
  }
}
