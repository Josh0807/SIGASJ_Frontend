export const FONTANERO_AVERIAS_PATH = '/fontanero/averias'

export const FONTANERO_AVERIAS_TITLE = 'Mis averías'

export const averiasFontaneroDetailPath = (id: number | string) =>
  `${FONTANERO_AVERIAS_PATH}/${id}`

export const isFontaneroAveriasPath = (path: string): boolean => {
  const normalized = path.replace(/\/+$/, '') || '/'
  return (
    normalized === FONTANERO_AVERIAS_PATH ||
    normalized.startsWith(`${FONTANERO_AVERIAS_PATH}/`)
  )
}
