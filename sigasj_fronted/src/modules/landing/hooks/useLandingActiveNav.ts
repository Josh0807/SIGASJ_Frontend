import { useEffect, useState } from 'react'

const DEFAULT_SECTION = 'inicio'

/**
 * Determina la sección activa por hash o por posición de scroll.
 */
export function useLandingActiveNav(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(DEFAULT_SECTION)

  useEffect(() => {
    const ids = [DEFAULT_SECTION, ...sectionIds]

    const resolveFromHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1))
      if (hash && ids.includes(hash)) {
        setActiveId(hash)
      }
    }

    const resolveFromScroll = () => {
      const offset = 120
      let current = DEFAULT_SECTION
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top - offset <= 0) current = id
      }
      setActiveId(current)
    }

    resolveFromHash()
    resolveFromScroll()

    const onScroll = () => resolveFromScroll()
    const onHash = () => resolveFromHash()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('hashchange', onHash)
    }
  }, [sectionIds])

  return activeId
}
