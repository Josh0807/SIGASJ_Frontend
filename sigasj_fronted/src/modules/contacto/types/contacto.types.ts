export type ContactoPublico = {
  telefono: string
  telefonosAdicionales: string[]
  email: string
  horarioAtencion: string
  horarioVentanilla: string | null
  direccion: string
  referenciaUbicacion: string | null
  regionResumen: string
  mapaUrl: string | null
  mapaLatitud: number | null
  mapaLongitud: number | null
  mapaZoom: number
  textoUbicacionMapa: string | null
  urlFacebook: string | null
  descripcionContacto: string | null
  actualizadoEn: string
}

export type ContactoFormValues = {
  telefono: string
  telefonosAdicionalesText: string
  email: string
  horarioAtencion: string
  horarioVentanilla: string
  direccion: string
  referenciaUbicacion: string
  regionResumen: string
  mapaUrl: string
  mapaLatitud: string
  mapaLongitud: string
  mapaZoom: string
  textoUbicacionMapa: string
  urlFacebook: string
  descripcionContacto: string
}

export const DEFAULT_CONTACTO: ContactoPublico = {
  telefono: '8560-7584',
  telefonosAdicionales: [],
  email: 'asadasanjuan24@gmail.com',
  horarioAtencion: 'Lunes a sábado de 7:30 a.m. – 11:30 a.m.',
  horarioVentanilla: 'Lunes a sábado de 7:30 a.m. – 11:30 a.m.',
  direccion: 'Costado norte de la Plaza de Deportes, San Juan, Santa Cruz.',
  referenciaUbicacion: null,
  regionResumen: 'San Juan de Santa Cruz, Guanacaste',
  mapaUrl: 'https://maps.app.goo.gl/2HtJjfvjTuLqVaFEA',
  mapaLatitud: 10.2188017,
  mapaLongitud: -85.5565018,
  mapaZoom: 19,
  textoUbicacionMapa: 'Encuentra nuestra oficina en San Juan de Santa Cruz.',
  urlFacebook: 'https://www.facebook.com/share/14kJoKE9tLm/',
  descripcionContacto:
    'Estamos para atenderte con información, orientación y atención a tus solicitudes.',
  actualizadoEn: '',
}

export function contactoToFormValues(contacto: ContactoPublico): ContactoFormValues {
  return {
    telefono: contacto.telefono,
    telefonosAdicionalesText: contacto.telefonosAdicionales.join('\n'),
    email: contacto.email,
    horarioAtencion: contacto.horarioAtencion,
    horarioVentanilla: contacto.horarioVentanilla ?? '',
    direccion: contacto.direccion,
    referenciaUbicacion: contacto.referenciaUbicacion ?? '',
    regionResumen: contacto.regionResumen,
    mapaUrl: contacto.mapaUrl ?? '',
    mapaLatitud:
      contacto.mapaLatitud === null ? '' : String(contacto.mapaLatitud),
    mapaLongitud:
      contacto.mapaLongitud === null ? '' : String(contacto.mapaLongitud),
    mapaZoom: String(contacto.mapaZoom),
    textoUbicacionMapa: contacto.textoUbicacionMapa ?? '',
    urlFacebook: contacto.urlFacebook ?? '',
    descripcionContacto: contacto.descripcionContacto ?? '',
  }
}

export function formValuesToUpdatePayload(values: ContactoFormValues) {
  const telefonosAdicionales = values.telefonosAdicionalesText
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean)

  const mapaLatitud = values.mapaLatitud.trim()
  const mapaLongitud = values.mapaLongitud.trim()
  const mapaZoom = Number.parseInt(values.mapaZoom, 10)

  return {
    telefono: values.telefono.trim(),
    telefonosAdicionales,
    email: values.email.trim(),
    horarioAtencion: values.horarioAtencion.trim(),
    horarioVentanilla: values.horarioVentanilla.trim() || undefined,
    direccion: values.direccion.trim(),
    referenciaUbicacion: values.referenciaUbicacion.trim() || undefined,
    regionResumen: values.regionResumen.trim(),
    mapaUrl: values.mapaUrl.trim() || undefined,
    mapaLatitud: mapaLatitud ? Number(mapaLatitud) : undefined,
    mapaLongitud: mapaLongitud ? Number(mapaLongitud) : undefined,
    mapaZoom: Number.isFinite(mapaZoom) ? mapaZoom : undefined,
    textoUbicacionMapa: values.textoUbicacionMapa.trim() || undefined,
    urlFacebook: values.urlFacebook.trim() || undefined,
    descripcionContacto: values.descripcionContacto.trim() || undefined,
  }
}

export function telHrefFromPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const internationalNumber = digits.length === 8 ? `506${digits}` : digits

  return `tel:+${internationalNumber}`
}

export function whatsappHrefFromPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const internationalNumber = digits.length === 8 ? `506${digits}` : digits

  return `https://wa.me/${internationalNumber}`
}

export function gmailComposeHref(email: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`
}

export type MapEmbedOptions = {
  latitude?: number
  longitude?: number
  address?: string
  locationReference?: string
  zoom?: number
}

export function buildGoogleMapsEmbedUrl(
  options: MapEmbedOptions,
): string | undefined {
  const { latitude, longitude, address, locationReference, zoom = 17 } = options
  const hasCoords = latitude !== undefined && longitude !== undefined
  const query = hasCoords
    ? `${latitude},${longitude}`
    : [address, locationReference].filter(Boolean).join(' ')

  if (!query) {
    return undefined
  }

  const params = new URLSearchParams({
    q: query,
    hl: 'es',
    z: String(zoom),
    ie: 'UTF8',
    output: 'embed',
  })

  return `https://maps.google.com/maps?${params.toString()}`
}

export function buildGoogleMapsSearchUrl(
  options: MapEmbedOptions,
): string | undefined {
  const { latitude, longitude, address, locationReference } = options
  const hasCoords = latitude !== undefined && longitude !== undefined
  const query = hasCoords
    ? `${latitude},${longitude}`
    : [address, locationReference].filter(Boolean).join(' ')

  if (!query) {
    return undefined
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
