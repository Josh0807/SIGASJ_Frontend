/**
 * Quita sufijos de semillas QA/demo para lectura en catálogo.
 */
export function materialDisplayLabel(
  value: string | null | undefined,
  fallback = '—',
): string {
  if (!value) return fallback
  return (
    value
      .replace(/\s+QA\s+\d{8,}$/i, '')
      .replace(/\s+Demo\s+\d{10,}$/i, '')
      .replace(/\s+\d{10,}$/g, '')
      .replace(/\s+QA$/i, '')
      .trim() || value
  )
}
