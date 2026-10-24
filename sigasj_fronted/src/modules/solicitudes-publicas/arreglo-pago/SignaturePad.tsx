import { IconEraser, IconPhotoUp } from '@tabler/icons-react'
import { useEffect, useId, useRef, useState } from 'react'

type SignaturePadProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  /** Las firmas principales son obligatorias; úselo solo para recomendantes opcionales. */
  optional?: boolean
}

const SIGNATURE_MAX_BYTES = 5 * 1024 * 1024

const readFile = (file: File, method: 'arrayBuffer' | 'dataUrl') =>
  new Promise<ArrayBuffer | string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No fue posible leer la imagen.'))
    reader.onload = () => resolve(reader.result as ArrayBuffer | string)
    if (method === 'arrayBuffer') reader.readAsArrayBuffer(file.slice(0, 8))
    else reader.readAsDataURL(file)
  })

const isSignatureImage = (bytes: Uint8Array) => {
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  return png.every((value, index) => bytes[index] === value) ||
    (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
}

const SignaturePad = ({ value, onChange, label = 'Firma digital del solicitante', optional = false }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const fileInputId = useId()
  const [fileError, setFileError] = useState<string | null>(null)
  const hasSignature = Boolean(value)

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
    setFileError(null)
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
    onChange(signature)
  }

  const clear = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height)
    setFileError(null)
    onChange('')
  }

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const extension = file.name.toLowerCase().split('.').at(-1)
    if (!['png', 'jpg', 'jpeg'].includes(extension ?? '') || !['image/png', 'image/jpeg'].includes(file.type)) {
      setFileError('Selecciona una imagen de firma en formato PNG, JPG o JPEG.')
      return
    }
    if (!file.size || file.size > SIGNATURE_MAX_BYTES) {
      setFileError(file.size ? 'La imagen de firma no puede superar 5 MB.' : 'La imagen de firma está vacía.')
      return
    }
    try {
      const header = new Uint8Array(await readFile(file, 'arrayBuffer') as ArrayBuffer)
      if (!isSignatureImage(header)) {
        setFileError('El contenido del archivo no corresponde a una imagen PNG o JPG válida.')
        return
      }
      const dataUrl = await readFile(file, 'dataUrl') as string
      setFileError(null)
      onChange(dataUrl)
    } catch {
      setFileError('No fue posible leer la imagen de firma. Intenta seleccionarla nuevamente.')
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-bold text-[#173f6e]">
          {label}{' '}
          {optional ? <span className="font-medium text-[#607a98]">(opcional)</span> : <span className="text-red-700" aria-hidden="true">*</span>}
        </span>
        <button className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 text-sm font-bold text-[#0b65b5] disabled:cursor-not-allowed disabled:text-slate-400" type="button" disabled={!hasSignature} onClick={clear}>
          <IconEraser size={17} aria-hidden="true" /> Limpiar firma
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="h-44 w-full touch-none rounded-xl border-2 border-dashed border-sky-200 bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        aria-label={`Área para dibujar: ${label}`}
        role="img"
        tabIndex={0}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
      />
      <div className="flex flex-wrap items-center gap-3 max-[480px]:items-stretch">
        <p className="m-0 flex-1 text-sm text-[#607a98]">Dibuja con el dedo, lápiz digital o puntero.</p>
        <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-bold text-[#0b65b5] hover:bg-sky-100" htmlFor={fileInputId}>
          <IconPhotoUp size={18} aria-hidden="true" /> Subir PNG o JPG
          <input className="sr-only" id={fileInputId} type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" onChange={(event) => void uploadImage(event)} />
        </label>
      </div>
      {hasSignature && value ? <img className="max-h-28 max-w-full rounded-lg border border-emerald-200 bg-white object-contain p-2" src={value} alt={`Vista previa: ${label}`} /> : null}
      {fileError ? <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">{fileError}</p> : null}
      {!optional && !hasSignature ? <p className="m-0 text-sm font-semibold text-red-700">La firma es requerida para enviar la solicitud.</p> : null}
    </div>
  )
}

export default SignaturePad
