import { fetchWithAuth } from '../../../services/http/httpClient'
import type { AssistantReply } from './assistantKnowledge'
import { matchAssistantReply } from './matchAssistantReply'

export type AssistantChatHistoryItem = {
  role: 'user' | 'assistant'
  content: string
}

export type AssistantChatResult = AssistantReply & {
  source: 'ai' | 'local'
}

type AiChatResponse = {
  reply: string
  provider?: string
  source?: string
}

const extractLinks = (text: string): AssistantReply['links'] => {
  const links: NonNullable<AssistantReply['links']> = []
  if (/recibo|pago|sinpe|factura/i.test(text)) {
    links.push({ label: 'Recibos y pagos', href: '#pagos' })
  }
  if (/aver[ií]a|fuga|da[nñ]o/i.test(text)) {
    links.push({ label: 'Reportar avería', href: '/reportar-averia' })
  }
  if (/tr[aá]mite|solicitud|constancia|afili/i.test(text)) {
    links.push({ label: 'Ver trámites', href: '#solicitudes-servicio' })
  }
  if (/horario|contacto|whatsapp|tel[eé]fono|correo/i.test(text)) {
    links.push({ label: 'Contacto', href: '#contacto' })
  }
  if (/comunicado|aviso|corte|mantenimiento/i.test(text)) {
    links.push({ label: 'Comunicados', href: '#comunicados' })
  }
  return links.length ? links.slice(0, 3) : undefined
}

export async function askAssistant(
  message: string,
  history: AssistantChatHistoryItem[] = [],
): Promise<AssistantChatResult> {
  try {
    const data = await fetchWithAuth<AiChatResponse>('/public/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        history: history.slice(-8),
      }),
    })
    const text = data.reply?.trim()
    if (!text) throw new Error('Respuesta vacía')
    return {
      text,
      links: extractLinks(text),
      source: 'ai',
    }
  } catch {
    return {
      ...matchAssistantReply(message),
      source: 'local',
    }
  }
}

export async function getAssistantStatus(): Promise<{
  enabled: boolean
  mode: string
}> {
  try {
    return await fetchWithAuth<{ enabled: boolean; mode: string }>(
      '/public/assistant/status',
    )
  } catch {
    return { enabled: false, mode: 'local-fallback' }
  }
}
