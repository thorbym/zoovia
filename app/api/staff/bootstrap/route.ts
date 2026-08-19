import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/clients"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: Request) {
  const user = await getUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const serviceRole = createServiceRoleSupabaseClient()
  const { data: existingProfile, error: existingError } = await serviceRole
    .from("user_profiles")
    .select("id, org_id")
    .eq("id", user.id)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json({ error: "Could not verify staff profile" }, { status: 400 })
  }

  if (existingProfile) {
    return NextResponse.json({ status: "ok" })
  }

  if (!user.email) {
    return NextResponse.json({ error: "Missing account email" }, { status: 400 })
  }

  const email = user.email.trim()
  if (!email) {
    return NextResponse.json({ error: "Missing account email" }, { status: 400 })
  }

  const { data: organisations, error: organisationError } = await serviceRole
    .from("organisations")
    .select("id")
    .ilike("contact_email", email)

  if (organisationError) {
    return NextResponse.json({ error: "Could not link account to kennel" }, { status: 400 })
  }

  if (!organisations || organisations.length !== 1) {
    return NextResponse.json({ error: "Could not link account to kennel" }, { status: 409 })
  }

  const { error: linkError } = await serviceRole.from("user_profiles").insert({
    id: user.id,
    type: "operator",
    org_id: organisations[0].id,
  })

  if (linkError) {
    return NextResponse.json({ error: "Could not link account to kennel" }, { status: 400 })
  }

  const { error: claimError } = await serviceRole
    .from("organisations")
    .update({ is_claimed: true })
    .eq("id", organisations[0].id)

  if (claimError) {
    return NextResponse.json({ error: "Could not link account to kennel" }, { status: 400 })
  }

  return NextResponse.json({ status: "ok" })
}
