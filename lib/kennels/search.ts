import { createSupabaseServerClient } from "@/lib/supabase/clients"
import { distanceInMiles, type ResolvedLocation } from "@/lib/geo/resolve-location"

export type KennelSearchResult = {
  id: string
  name: string
  slug: string
  locality: string | null
  region: string | null
  postcode: string
  latitude: number | null
  longitude: number | null
  claim_status: string
  distance: number
}

export const KENNELS_SEARCH_PAGE_SIZE = 10

export async function searchKennelsByLocation(
  location: ResolvedLocation,
  offset: number,
  limit: number,
): Promise<{ results: KennelSearchResult[]; total: number }> {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from("organisations")
    .select("id, name, slug, locality, region, postcode, latitude, longitude, claim_status")
    .not("latitude", "is", null)

  const withDistance = ((data ?? []) as Omit<KennelSearchResult, "distance">[]).map((org) => ({
    ...org,
    distance: distanceInMiles(location, { latitude: org.latitude!, longitude: org.longitude! }),
  }))
  withDistance.sort((a, b) => a.distance - b.distance)

  return {
    results: withDistance.slice(offset, offset + limit),
    total: withDistance.length,
  }
}
