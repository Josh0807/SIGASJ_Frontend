const MAX_EDGE = 360

const drawMiniatura = async (source: ImageBitmap | HTMLImageElement) => {
  const scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height, 1))
  const width = Math.max(1, Math.round(source.width * scale))
  const height = Math.max(1, Math.round(source.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('No se pudo crear la miniatura')
  }
  context.drawImage(source, 0, 0, width, height)
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.68)
  })
  if (!blob) {
    throw new Error('No se pudo crear la miniatura')
  }
  return URL.createObjectURL(blob)
}

export const crearMiniaturaEvidencia = async (src: string): Promise<string> => {
  const response = await fetch(src)
  if (!response.ok) {
    throw new Error('No se pudo leer la evidencia')
  }
  const blob = await response.blob()

  if (typeof createImageBitmap === 'function') {
    const original = await createImageBitmap(blob)
    try {
      return await drawMiniatura(original)
    } finally {
      original.close()
    }
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('No se pudo leer la evidencia'))
    element.src = URL.createObjectURL(blob)
  })
  return drawMiniatura(image)
}
