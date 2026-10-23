;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true

/** jsdom no implementa canvas 2D; evita ruido y teardown errors con SignaturePad. */
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function getContext() {
    return {
      scale() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      stroke() {},
      clearRect() {},
      drawImage() {},
      lineWidth: 1,
      lineCap: 'round',
      lineJoin: 'round',
      strokeStyle: '#000',
    } as unknown as CanvasRenderingContext2D
  }
}

const storage = new Map<string, string>()

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
    clear: () => {
      storage.clear()
    },
  },
  configurable: true,
})
