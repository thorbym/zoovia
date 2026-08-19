import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/clients"

type SettingsPayload = {
  name?: string
  contactEmail?: string
  phone?: string | null
  postcode?: string
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("org_id")
    .eq("id", user.id)
    .eq("type", "operator")
    .single()

  if (profileError || !profile || !profile.org_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: organisation, error: orgError } = await supabase
    .from("organisations")
    .select("id, name, contact_email, telephone, postcode, slug")
    .eq("id", profile.org_id)
    .single()

  if (orgError || !organisation) {
    return NextResponse.json({ error: "Could not load settings" }, { status: 400 })
  }

  return NextResponse.json({
    kennel: {
      id: organisation.id,
      name: organisation.name,
      contactEmail: organisation.contact_email,
      phone: organisation.telephone,
      postcode: organisation.postcode,
      slug: organisation.slug,
    },
    userEmail: user.email ?? null,
  })
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("org_id")
    .eq("id", user.id)
    .eq("type", "operator")
    .single()

  if (profileError || !profile || !profile.org_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as SettingsPayload
  const updates: Record<string, string | null> = {}

  if (typeof body.name === "string") {
    const trimmed = body.name.trim()
    if (!trimmed) {
      return NextResponse.json({ error: "Kennel name required" }, { status: 400 })
    }
    updates.name = trimmed
  }

  if (typeof body.contactEmail === "string") {
    const trimmed = body.contactEmail.trim()
    if (!trimmed) {
      return NextResponse.json({ error: "Contact email required" }, { status: 400 })
    }
    updates.contact_email = trimmed
  }

  if (typeof body.phone === "string") {
    const trimmed = body.phone.trim()
    updates.telephone = trimmed.length === 0 ? null : trimmed
  } else if (body.phone === null) {
    updates.telephone = null
  }

  if (typeof body.postcode === "string") {
    const trimmed = body.postcode.trim()
    if (!trimmed) {
      return NextResponse.json({ error: "Postcode required" }, { status: 400 })
    }
    updates.postcode = trimmed
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 })
  }

  updates.updated_at = new Date().toISOString()

  const { data: organisation, error: updateError } = await supabase
    .from("organisations")
    .update(updates)
    .eq("id", profile.org_id)
    .select("id, name, contact_email, telephone, postcode, slug")
    .single()

  if (updateError || !organisation) {
    return NextResponse.json({ error: "Could not save settings" }, { status: 400 })
  }

  return NextResponse.json({
    kennel: {
      id: organisation.id,
      name: organisation.name,
      contactEmail: organisation.contact_email,
      phone: organisation.telephone,
      postcode: organisation.postcode,
      slug: organisation.slug,
    },
  })
}
