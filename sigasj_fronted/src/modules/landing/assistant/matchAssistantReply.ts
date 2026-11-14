import {
  ASSISTANT_FALLBACK,
  ASSISTANT_TOPICS,
  type AssistantReply,
} from './assistantKnowledge'

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()

export const matchAssistantReply = (rawInput: string): AssistantReply => {
  const input = normalize(rawInput)
  if (!input) return ASSISTANT_FALLBACK

  let bestScore = 0
  let bestReply: AssistantReply = ASSISTANT_FALLBACK

  for (const topic of ASSISTANT_TOPICS) {
    let score = 0
    for (const keyword of topic.keywords) {
      const needle = normalize(keyword)
      if (!needle) continue
      if (input === needle) score += 6
      else if (input.includes(needle)) score += 3
      else if (needle.includes(input) && input.length >= 4) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      bestReply = topic.reply
    }
  }

  return bestScore > 0 ? bestReply : ASSISTANT_FALLBACK
}
