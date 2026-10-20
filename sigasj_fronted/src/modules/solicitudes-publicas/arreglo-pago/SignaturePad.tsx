import { IconEraser } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'

type SignaturePadProps = {
  value: string
  onChange: (value: string) => void
}

const SignaturePad = ({ value, onChange }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const [hasSignature, setHasSignature] = useState(Boolean(value))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const rect = canvas.getBoundingClientRect()
    const scale = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.round(rect.width * scale))
    canvas.height = Math.max(1, Math.round(rect.height * scale))
    context.scale(scale, scale)
    context.lineWidth = 2
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#123f70'

    if (value) {
      const image = new Image()
      image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height)
      image.src = value
    }
  }, [value])

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const context = event.currentTarget.getContext('2d')
    if (!context) return
    drawingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = pointFromEvent(event)
    context.beginPath()
    context.moveTo(point.x, point.y)
  }

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const context = event.currentTarget.getContext('2d')
    if (!context) return
    const point = pointFromEvent(event)
    context.lineTo(point.x, point.y)
    context.stroke()
  }

  const stopDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    drawingRef.current = false
    const signature = event.currentTarget.toDataURL('image/png')
    setHasSignature(true)
    onChange(signature)
  }

  const clear = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onChange('')
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-bold text-[#173f6e]">Firma digital <span className="font-medium text-[#607a98]">(opcional)</span></span>
        <button className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 text-sm font-bold text-[#0b65b5] disabled:cursor-not-allowed disabled:text-slate-400" type="button" disabled={!hasSignature} onClick={clear}>
          <IconEraser size={17} aria-hidden="true" /> Limpiar firma
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="h-44 w-full touch-none rounded-xl border-2 border-dashed border-sky-200 bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        aria-label="Área para dibujar la firma digital"
        role="img"
        tabIndex={0}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
      />
      <p className="m-0 text-sm text-[#607a98]">Dibuja tu firma con el dedo, lápiz digital o puntero.</p>
    </div>
  )
}

export default SignaturePad
