/** Días calendario inclusivos entre dos fechas YYYY-MM-DD. */
export const diasInclusiveEntreFechas = (
  fechaInicio: string,
  fechaFin: string,
): number => {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin) ||
    fechaFin < fechaInicio
  ) {
    return 0
  }
  const [y1, m1, d1] = fechaInicio.split('-').map(Number)
  const [y2, m2, d2] = fechaFin.split('-').map(Number)
  const inicio = Date.UTC(y1, m1 - 1, d1)
  const fin = Date.UTC(y2, m2 - 1, d2)
  return Math.floor((fin - inicio) / 86_400_000) + 1
}
