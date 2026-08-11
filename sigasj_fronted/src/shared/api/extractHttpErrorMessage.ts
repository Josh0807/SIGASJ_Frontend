export function extractHttpErrorMessage(text: string): string | null {
  if (!text.trim()) {
    return null
  }

  try {
    const body = JSON.parse(text) as { message?: unknown }

    if (Array.isArray(body.message)) {
      const parts = body.message.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      )
      return parts.length > 0 ? parts.join(' ') : null
    }

    if (typeof body.message === 'string') {
      const trimmed = body.message.trim()
      return trimmed || null
    }
  } catch {
    return null
  }

  return null
}
