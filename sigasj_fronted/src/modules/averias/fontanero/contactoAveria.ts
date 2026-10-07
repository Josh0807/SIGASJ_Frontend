const UBICACION_VACIA = new Set([
  '',
  'no disponible',
  'sin ubicación',
  'sin ubicacion',
])

export function telefonoHref(telefono: string | null | undefined): string | null {
  const crudo = telefono?.trim() ?? ''
  const digitos = crudo.replace(/\D/g, '')
  if (digitos.length < 8) {
    return null
  }
  const destino = crudo.startsWith('+') ? `+${digitos}` : digitos
  return `tel:${destino}`
}

export function mapasHref(ubicacion: string | null | undefined): string | null {
  const texto = ubicacion?.trim() ?? ''
  if (UBICACION_VACIA.has(texto.toLowerCase())) {
    return null
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(texto)}`
}
