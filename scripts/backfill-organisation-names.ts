import { createClient } from "@supabase/supabase-js"
import { normaliseName } from "./lib/normalise-name"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function fetchAllOrganisations(): Promise<{ id: string; name: string }[]> {
  const PAGE = 1000
  const all: { id: string; name: string }[] = []
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase
      .from("organisations")
      .select("id, name")
      .range(offset, offset + PAGE - 1)
    if (error) {
      console.error("Fetch error:", error.message)
      process.exit(1)
    }
    all.push(...(data ?? []))
    if (!data || data.length < PAGE) break
  }
  return all
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")

  const organisations = await fetchAllOrganisations()

  const changes = organisations
    .map((org) => ({ id: org.id, oldName: org.name, newName: normaliseName(org.name) }))
    .filter((org) => org.oldName !== org.newName)

  console.log(`${organisations.length} organisations checked, ${changes.length} need updating.`)
  changes.forEach((c) => console.log(`  "${c.oldName}" -> "${c.newName}"`))

  if (dryRun) {
    console.log("\nDry run, no changes written. Re-run without --dry-run to apply.")
    return
  }

  let updated = 0
  for (const change of changes) {
    const { error: updateError } = await supabase
      .from("organisations")
      .update({ name: change.newName })
      .eq("id", change.id)
    if (updateError) {
      console.error(`Failed to update ${change.id}:`, updateError.message)
    } else {
      updated++
    }
  }

  console.log(`\nDone. ${updated}/${changes.length} updated.`)
}

main()
