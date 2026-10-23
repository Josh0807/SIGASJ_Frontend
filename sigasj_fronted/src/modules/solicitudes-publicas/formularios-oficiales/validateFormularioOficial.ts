import { FORMULARIO_OFICIAL_MAX_BYTES } from './types'

const readHeader = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onerror = () => reject(new Error('No fue posible leer el archivo.'))
  reader.onload = () => {
    const bytes = new Uint8Array(reader.result as ArrayBuffer)
    resolve(String.fromCharCode(...bytes))
  }
  reader.readAsArrayBuffer(file.slice(0, 5))
})

export async function validateFormularioOficial(file: File): Promise<string | null> {
  if (!file.name.toLowerCase().endsWith('.pdf')) return 'Selecciona un archivo con extensión .pdf.'
  if (file.type !== 'application/pdf') return 'El archivo debe tener el tipo application/pdf.'
  if (file.size === 0) return 'El archivo PDF está vacío.'
  if (file.size > FORMULARIO_OFICIAL_MAX_BYTES) return 'El archivo PDF no puede superar 10 MB.'

  try {
    if (await readHeader(file) !== '%PDF-') return 'El archivo seleccionado no contiene un PDF válido.'
  } catch {
    return 'No fue posible comprobar el contenido del archivo.'
  }
  return null
}
