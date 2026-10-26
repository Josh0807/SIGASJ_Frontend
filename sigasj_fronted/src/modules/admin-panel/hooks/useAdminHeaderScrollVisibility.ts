import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const TOP_REVEAL_PX = 24
const DELTA_PX = 8

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Oculta la barra al bajar y la muestra al subir, en todo el panel.
 */
export const useAdminHeaderScrollVisibility = (forceVisible = false) => {
  const { pathname } = useLocation()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    setHidden(false)
  }, [pathname])

  useEffect(() => {
    if (forceVisible || typeof window === 'undefined') {
      setHidden(false)
      return undefined
    }

    let lastY = window.scrollY || document.documentElement.scrollTop || 0

    const onScroll = () => {
      if (prefersReducedMotion()) {
        setHidden(false)
        return
      }
      const y = window.scrollY || document.documentElement.scrollTop || 0
      const delta = y - lastY
      lastY = y
      if (y <= TOP_REVEAL_PX) {
        setHidden(false)
        return
      }
      if (delta > DELTA_PX) {
        setHidden(true)
      } else if (delta < -DELTA_PX) {
        setHidden(false)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [forceVisible, pathname])

  return forceVisible ? false : hidden
}
