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

export function mapasHref(
  ubicacion: string | null | undefined,
  coords?: { latitud?: number | null; longitud?: number | null } | null,
): string | null {
  const lat = coords?.latitud
  const lng = coords?.longitud
  if (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    return `https://www.google.com/maps?q=${lat},${lng}`
  }

  const texto = ubicacion?.trim() ?? ''
  if (UBICACION_VACIA.has(texto.toLowerCase())) {
    return null
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(texto)}`
}
