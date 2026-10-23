/**
 * Ejecuta trabajo (p. ej. loaders que actualizan estado) fuera del cuerpo
 * síncrono de un `useEffect`, evitando `react-hooks/set-state-in-effect`.
 */
export function runAfterEffect(task: () => void): () => void {
  let cancelled = false
  queueMicrotask(() => {
    if (!cancelled) {
      task()
    }
  })
  return () => {
    cancelled = true
  }
}
