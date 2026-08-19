export interface ResolvedLocation {
  latitude: number
  longitude: number
}

const POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i
const OUTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?$/i

async function getJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url)
  if (!response.ok) return null
  return response.json()
}

/**
 * Resolves free-text search input (full postcode, outcode, or a place name
 * like "Bedford") to coordinates via postcodes.io. Returns null if nothing matches.
 */
export async function resolveLocation(query: string): Promise<ResolvedLocation | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  if (POSTCODE_RE.test(trimmed)) {
    const body = await getJson<{ result: { latitude: number; longitude: number } | null }>(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(trimmed)}`,
    )
    if (body?.result) return { latitude: body.result.latitude, longitude: body.result.longitude }
  }

  if (OUTCODE_RE.test(trimmed)) {
    const body = await getJson<{ result: { latitude: number; longitude: number } | null }>(
      `https://api.postcodes.io/outcodes/${encodeURIComponent(trimmed)}`,
    )
    if (body?.result) return { latitude: body.result.latitude, longitude: body.result.longitude }
  }

  const places = await getJson<{ result: { latitude: number; longitude: number }[] | null }>(
    `https://api.postcodes.io/places?q=${encodeURIComponent(trimmed)}`,
  )
  const first = places?.result?.[0]
  return first ? { latitude: first.latitude, longitude: first.longitude } : null
}

/** Haversine distance in miles between two coordinates. */
export function distanceInMiles(a: ResolvedLocation, b: ResolvedLocation): number {
  const R = 3958.8
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180
  const lat1 = (a.latitude * Math.PI) / 180
  const lat2 = (b.latitude * Math.PI) / 180

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(h))
}
