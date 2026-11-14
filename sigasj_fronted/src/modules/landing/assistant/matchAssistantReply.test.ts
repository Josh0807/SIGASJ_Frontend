import { describe, expect, it } from 'vitest'
import { matchAssistantReply } from './matchAssistantReply'

describe('matchAssistantReply', () => {
  it('responde sobre recibos', () => {
    const reply = matchAssistantReply('¿Cómo consulto mi recibo?')
    expect(reply.text.toLowerCase()).toContain('recibo')
  })

  it('responde sobre averías', () => {
    const reply = matchAssistantReply('Quiero reportar una fuga')
    expect(reply.text.toLowerCase()).toMatch(/aver|fuga|whatsapp/)
  })

  it('usa fallback si no hay coincidencia', () => {
    const reply = matchAssistantReply('xyzabc123')
    expect(reply.links?.some((l) => l.href.includes('contacto'))).toBe(true)
  })
})
