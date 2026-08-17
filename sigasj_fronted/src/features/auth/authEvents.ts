export const AUTH_STORAGE_EVENT = 'sigasj-auth-changed'

export function notifyAuthChanged(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT))
}

export function subscribeToAuthChanges(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  window.addEventListener(AUTH_STORAGE_EVENT, onStoreChange)
  window.addEventListener('storage', onStoreChange)

  return () => {
    window.removeEventListener(AUTH_STORAGE_EVENT, onStoreChange)
    window.removeEventListener('storage', onStoreChange)
  }
}
