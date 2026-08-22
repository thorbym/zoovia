import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import { backfillOrganisationCoordinates } from "./lib/geocode"
import { normaliseName } from "./lib/normalise-name"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function slugify(name: string, locality: string): string {
  const base = `${name} ${locality}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return base
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split("\n").filter((l) => l.trim())
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
  return lines.slice(1).map((line) => {
    // Handle quoted fields containing commas
    const values: string[] = []
    let current = ""
    let inQuotes = false
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        values.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    values.push(current.trim())
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]))
  })
}

async function main() {
  const csvPath = path.join(process.cwd(), "scripts/data/kennels.csv")
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found at ${csvPath}`)
    console.error("Export your Google Sheet as CSV and place it at scripts/data/kennels.csv")
    process.exit(1)
  }

  const rows = parseCSV(fs.readFileSync(csvPath, "utf-8"))
  console.log(`Found ${rows.length} rows`)

  // Track slugs used in this run to handle duplicates within the CSV itself
  const slugCounts: Record<string, number> = {}

  const skipped: string[] = []

  const organisations = rows
    .filter((row) => row.name?.trim())
    .filter((row) => {
      if (!row.postalCode?.trim()) {
        skipped.push(row.name.trim())
        return false
      }
      return true
    })
    .map((row) => {
      const name = normaliseName(row.name.trim())
      const locality = (row.addressLocality ?? "").trim()
      let slug = slugify(name, locality)

      // Deduplicate slugs within this batch
      if (slugCounts[slug]) {
        slugCounts[slug]++
        slug = `${slug}-${slugCounts[slug]}`
      } else {
        slugCounts[slug] = 1
      }

      return {
        name,
        slug,
        licence_region:  row.licenceRegion?.trim()  || null,
        street_address:  row.streetAddress?.trim()  || null,
        locality:        row.addressLocality?.trim() || null,
        region:          row.addressRegion?.trim()   || null,
        postcode:        row.postalCode?.trim()       || null,
        telephone:       row.telephone?.trim()        || null,
        contact_email:   row.email?.trim()            || null,
        claim_status:    "unclaimed" as const,
      }
    })

  if (skipped.length) {
    console.log(`Skipping ${skipped.length} rows with no postcode (organisations.postcode is not null):`)
    skipped.forEach((name) => console.log(`  - ${name}`))
  }

  console.log(`Seeding ${organisations.length} organisations...`)

  // Upsert in batches of 100
  const BATCH = 100
  let inserted = 0
  let errors = 0

  for (let i = 0; i < organisations.length; i += BATCH) {
    const batch = organisations.slice(i, i + BATCH)

    // If the CSV's postcode for an existing row differs from what's stored,
    // the coordinates we geocoded from the old postcode are stale — null
    // them out so backfillOrganisationCoordinates re-geocodes on this run.
    const { data: existing, error: fetchError } = await supabase
      .from("organisations")
      .select("slug, postcode")
      .in("slug", batch.map((o) => o.slug))

    if (fetchError) {
      console.error(`Batch ${i / BATCH + 1} fetch error:`, fetchError.message)
    }
    const existingPostcodeBySlug = new Map((existing ?? []).map((o) => [o.slug, o.postcode]))

    const batchWithResets = batch.map((org) => {
      const existingPostcode = existingPostcodeBySlug.get(org.slug)
      if (existingPostcode !== undefined && existingPostcode !== org.postcode) {
        return { ...org, latitude: null, longitude: null }
      }
      return org
    })

    const { error } = await supabase
      .from("organisations")
      .upsert(batchWithResets, { onConflict: "slug", ignoreDuplicates: false })

    if (error) {
      console.error(`Batch ${i / BATCH + 1} error:`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
      process.stdout.write(`\r${inserted} / ${organisations.length}`)
    }
  }

  console.log(`\nDone. ${inserted} upserted, ${errors} errors.`)

  await backfillOrganisationCoordinates(supabase)
}

main()
