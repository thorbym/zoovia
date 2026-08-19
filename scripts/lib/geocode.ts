import type { SupabaseClient } from "@supabase/supabase-js"

export interface GeocodedPostcode {
  postcode: string
  latitude: number
  longitude: number
}

const BATCH = 100

/**
 * Bulk-geocodes UK postcodes via postcodes.io (free, no key, ONS data).
 * Postcodes it can't resolve (malformed/withdrawn) are omitted, not thrown.
 */
export async function geocodePostcodes(postcodes: string[]): Promise<GeocodedPostcode[]> {
  const results: GeocodedPostcode[] = []
  const unresolved: string[] = []

  for (let i = 0; i < postcodes.length; i += BATCH) {
    const batch = postcodes.slice(i, i + BATCH)
    const response = await fetch("https://api.postcodes.io/postcodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcodes: batch }),
    })

    if (!response.ok) {
      console.error(`postcodes.io batch ${i / BATCH + 1} failed: ${response.status}`)
      unresolved.push(...batch)
      continue
    }

    const body: {
      result: { query: string; result: { latitude: number; longitude: number } | null }[]
    } = await response.json()

    for (const { query, result } of body.result) {
      if (result) {
        results.push({ postcode: query, latitude: result.latitude, longitude: result.longitude })
      } else {
        unresolved.push(query)
      }
    }
  }

  if (unresolved.length) {
    console.log(`postcodes.io could not resolve ${unresolved.length} postcode(s):`)
    unresolved.forEach((p) => console.log(`  - ${p}`))
  }

  return results
}

/**
 * Geocodes every organisation missing coordinates (via `geocodePostcodes`)
 * and writes latitude/longitude back. Safe to call repeatedly — only rows
 * with `latitude is null` are touched, so it's used both for the one-off
 * backfill and after every re-seed.
 */
export async function backfillOrganisationCoordinates(supabase: SupabaseClient): Promise<void> {
  const rows: { id: string; postcode: string }[] = []
  const PAGE = 1000

  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("organisations")
      .select("id, postcode")
      .is("latitude", null)
      .range(from, from + PAGE - 1)

    if (error) {
      console.error("Failed to fetch organisations for geocoding:", error.message)
      return
    }

    rows.push(...data)
    if (data.length < PAGE) break
  }

  if (!rows.length) {
    console.log("Geocoding: nothing to do, every organisation already has coordinates.")
    return
  }

  console.log(`Geocoding ${rows.length} organisation(s)...`)

  const geocoded = await geocodePostcodes(rows.map((r) => r.postcode))
  const byPostcode = new Map(geocoded.map((g) => [g.postcode.toUpperCase(), g]))

  let updated = 0
  let errors = 0

  for (const row of rows) {
    const match = byPostcode.get(row.postcode.toUpperCase())
    if (!match) continue

    const { error: updateError } = await supabase
      .from("organisations")
      .update({ latitude: match.latitude, longitude: match.longitude })
      .eq("id", row.id)

    if (updateError) {
      console.error(`Failed to update ${row.id}:`, updateError.message)
      errors++
    } else {
      updated++
      process.stdout.write(`\r${updated} / ${rows.length}`)
    }
  }

  console.log(`\nGeocoding done. ${updated} updated, ${rows.length - updated - errors} unresolved, ${errors} errors.`)
}
