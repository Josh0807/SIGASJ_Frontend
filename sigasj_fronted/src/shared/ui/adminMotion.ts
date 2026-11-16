import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { RefObject } from 'react'

gsap.registerPlugin(useGSAP)

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Entrada corta de página admin (no AOS). */
export function runAdminPageEnter(
  scope: HTMLElement | null,
  options?: { staggerSelector?: string },
) {
  if (!scope || prefersReducedMotion()) return

  const staggerSelector = options?.staggerSelector ?? '[data-admin-stagger]'
  const items = scope.querySelectorAll(staggerSelector)

  gsap.fromTo(
    scope,
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out', clearProps: 'transform' },
  )

  if (items.length > 0) {
    gsap.fromTo(
      items,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.36,
        stagger: 0.045,
        delay: 0.08,
        ease: 'power2.out',
        clearProps: 'transform',
      },
    )
  }
}

export function useAdminPageEnter(
  ref: RefObject<HTMLElement | null>,
  options?: { enabled?: boolean; deps?: unknown[] },
) {
  const enabled = options?.enabled ?? true
  const deps = options?.deps ?? []

  useGSAP(
    () => {
      if (!enabled) return
      runAdminPageEnter(ref.current)
    },
    { scope: ref, dependencies: [enabled, ...deps] },
  )
}
