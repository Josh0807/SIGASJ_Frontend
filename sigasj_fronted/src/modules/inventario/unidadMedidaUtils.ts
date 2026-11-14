/** Pluraliza unidades de inventario en español según la cantidad. */

const IRREGULAR: Record<string, string> = {
  unidad: 'unidades',
  tubo: 'tubos',
  tarro: 'tarros',
  metro: 'metros',
  pieza: 'piezas',
  caja: 'cajas',
  litro: 'litros',
  galon: 'galones',
  'galón': 'galones',
  saco: 'sacos',
  rollo: 'rollos',
  paquete: 'paquetes',
  kit: 'kits',
  bolsa: 'bolsas',
  botella: 'botellas',
  hoja: 'hojas',
  par: 'pares',
}

const ABBREVIATION = /^(kg|g|mg|lb|oz|ml|lt|l|m|cm|mm|und|u\.?|mts?)$/i

function matchCase(source: string, plural: string): string {
  if (!source) return plural
  if (source === source.toUpperCase()) return plural.toUpperCase()
  if (source[0] === source[0].toUpperCase()) {
    return plural.charAt(0).toUpperCase() + plural.slice(1)
  }
  return plural
}

export function pluralizeUnidad(unidad: string, cantidad: number): string {
  const trimmed = unidad.trim()
  if (!trimmed) return ''
  if (Math.abs(cantidad) === 1) return trimmed
  if (ABBREVIATION.test(trimmed) || /^[a-z]{1,2}$/i.test(trimmed)) return trimmed
  // Ya plural (termina en vocal + s, o en es)
  if (/[aeiouáéíóú]s$/i.test(trimmed) || /[^aeiouáéíóú]es$/i.test(trimmed)) {
    return trimmed
  }

  const key = trimmed.toLowerCase()
  if (IRREGULAR[key]) return matchCase(trimmed, IRREGULAR[key])

  if (/[aeiouáéíóú]$/i.test(trimmed)) return `${trimmed}s`
  if (/z$/i.test(trimmed)) return `${trimmed.slice(0, -1)}ces`
  if (/[áéíóú]n$/i.test(trimmed)) {
    const base = trimmed
      .replace(/á/gi, 'a')
      .replace(/é/gi, 'e')
      .replace(/í/gi, 'i')
      .replace(/ó/gi, 'o')
      .replace(/ú/gi, 'u')
    return `${base}es`
  }
  return `${trimmed}es`
}

export function formatCantidadUnidad(
  cantidad: number,
  unidad?: string | null,
): string {
  const u = unidad?.trim()
  if (!u) return String(cantidad)
  return `${cantidad} ${pluralizeUnidad(u, cantidad)}`
}
