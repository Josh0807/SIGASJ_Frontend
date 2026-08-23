const MOBILE_NAV_QUERY = '(max-width: 760px)'

export const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })

  window.matchMedia = ((query: string) => ({
    matches:
      query === MOBILE_NAV_QUERY
        ? width <= 760
        : query.includes('760px')
          ? width <= 760
          : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  })) as typeof window.matchMedia
}
