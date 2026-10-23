import { act } from 'react'

const LAZY_MODULE_FALLBACK = 'Cargando módulo'

/**
 * Deja que React Router resuelva `React.lazy`, Suspense y redirects anidados
 * antes de asertar DOM o pathname en pruebas con AppRoutes.
 */
export async function waitForAppRoutesReady(
  container: HTMLElement,
  getPathname?: () => string,
  maxTicks = 120,
): Promise<void> {
  let lastPath = getPathname?.() ?? ''
  let stableTicks = 0
  let ticksAfterLoad = 0

  for (let i = 0; i < maxTicks; i += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5))
    })

    const stillLoading = container.innerHTML.includes(LAZY_MODULE_FALLBACK)
    if (stillLoading) {
      stableTicks = 0
      ticksAfterLoad = 0
      continue
    }

    ticksAfterLoad += 1

    if (!getPathname) {
      if (ticksAfterLoad >= 4) {
        return
      }
      continue
    }

    const path = getPathname()
    if (path === lastPath) {
      stableTicks += 1
    } else {
      stableTicks = 0
      lastPath = path
    }

    if (stableTicks >= 2 && ticksAfterLoad >= 4) {
      return
    }
  }
}
