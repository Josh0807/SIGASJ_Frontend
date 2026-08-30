type ProyectosAdminQueryListener = () => void

const listeners = new Set<ProyectosAdminQueryListener>()

export function subscribeAdminProyectosQueries(
  listener: ProyectosAdminQueryListener,
): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Marca listado y detalle como obsoletos para que las pantallas montadas vuelvan a consultar. */
export function invalidateAdminProyectosQueries(): void {
  listeners.forEach((listener) => {
    listener()
  })
}
