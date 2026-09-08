const fechaFormatter = new Intl.DateTimeFormat('es-CR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export const formatActividadFecha = (fecha: string | null | undefined): string => {
  if (!fecha?.trim()) {
    return 'Sin fecha'
  }

  const parsed = new Date(`${fecha.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return fecha
  }

  return fechaFormatter.format(parsed)
}
