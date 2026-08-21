export type ParsedMapCoordinates = {
  latitude: number
  longitude: number
  zoom?: number
}

export type GeocodedAddress = {
  latitude: number
  longitude: number
  displayName: string
}

export function parseCoordinatesFromMapsUrl(
  url: string,
): ParsedMapCoordinates | null {
  const trimmed = url.trim()
  if (!trimmed) {
    return null
  }

  const placeMatch = trimmed.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i)
  if (placeMatch) {
    const atMatch = trimmed.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(\d+(?:\.\d+)?)z/i)
    return {
      latitude: Number(placeMatch[1]),
      longitude: Number(placeMatch[2]),
      zoom: atMatch ? Math.round(Number(atMatch[3])) : undefined,
    }
  }

  const atMatch = trimmed.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(\d+(?:\.\d+)?)z/i)
  if (atMatch) {
    return {
      latitude: Number(atMatch[1]),
      longitude: Number(atMatch[2]),
      zoom: Math.round(Number(atMatch[3])),
    }
  }

  const qMatch = trimmed.match(/[?&](?:q|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i)
  if (qMatch) {
    return {
      latitude: Number(qMatch[1]),
      longitude: Number(qMatch[2]),
    }
  }

  const llMatch = trimmed.match(/[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i)
  if (llMatch) {
    return {
      latitude: Number(llMatch[1]),
      longitude: Number(llMatch[2]),
    }
  }

  const centerMatch = trimmed.match(/center=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i)
  if (centerMatch) {
    return {
      latitude: Number(centerMatch[1]),
      longitude: Number(centerMatch[2]),
    }
  }

  return null
}

export function formatCoordinate(value: number): string {
  return value.toFixed(7).replace(/\.?0+$/, '')
}

export async function geocodeAddressQuery(
  query: string,
): Promise<GeocodedAddress | null> {
  const normalized = query.trim()
  if (!normalized) {
    return null
  }

  const params = new URLSearchParams({
    q: normalized,
    format: 'json',
    limit: '1',
    countrycodes: 'cr',
  })

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        'Accept-Language': 'es',
      },
    },
  )

  if (!response.ok) {
    throw new Error('No fue posible consultar la ubicación.')
  }

  const results = (await response.json()) as Array<{
    lat: string
    lon: string
    display_name: string
  }>

  if (!Array.isArray(results) || results.length === 0) {
    return null
  }

  const first = results[0]

  return {
    latitude: Number(first.lat),
    longitude: Number(first.lon),
    displayName: first.display_name,
  }
}
