import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/clients"

type SettingsPayload = {
  name?: string
  contactEmail?: string
  phone?: string | null
  postcode?: string
  notifyNewRequest?: boolean
  notifyAccepted?: boolean
  notifyRejected?: boolean
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
    .from("staff_profiles")
    .select("kennel_id")
    .eq("user_id", user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: kennel, error: kennelError } = await supabase
    .from("kennels")
    .select(
      "id, name, contact_email, phone, postcode, slug, notify_new_request, notify_accepted, notify_rejected",
    )
    .eq("id", profile.kennel_id)
    .single()

  if (kennelError || !kennel) {
    return NextResponse.json({ error: "Could not load settings" }, { status: 400 })
  }

  return NextResponse.json({
    kennel: {
      id: kennel.id,
      name: kennel.name,
      contactEmail: kennel.contact_email,
      phone: kennel.phone,
      postcode: kennel.postcode,
      slug: kennel.slug,
      notifyNewRequest: kennel.notify_new_request,
      notifyAccepted: kennel.notify_accepted,
      notifyRejected: kennel.notify_rejected,
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
    .from("staff_profiles")
    .select("kennel_id")
    .eq("user_id", user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as SettingsPayload
  const updates: Record<string, string | boolean | null> = {}

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
    updates.phone = trimmed.length === 0 ? null : trimmed
  } else if (body.phone === null) {
    updates.phone = null
  }

  if (typeof body.postcode === "string") {
    const trimmed = body.postcode.trim()
    if (!trimmed) {
      return NextResponse.json({ error: "Postcode required" }, { status: 400 })
    }
    updates.postcode = trimmed
  }

  if (typeof body.notifyNewRequest === "boolean") {
    updates.notify_new_request = body.notifyNewRequest
  }
  if (typeof body.notifyAccepted === "boolean") {
    updates.notify_accepted = body.notifyAccepted
  }
  if (typeof body.notifyRejected === "boolean") {
    updates.notify_rejected = body.notifyRejected
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 })
  }

  updates.updated_at = new Date().toISOString()

  const { data: kennel, error: updateError } = await supabase
    .from("kennels")
    .update(updates)
    .eq("id", profile.kennel_id)
    .select(
      "id, name, contact_email, phone, postcode, slug, notify_new_request, notify_accepted, notify_rejected",
    )
    .single()

  if (updateError || !kennel) {
    return NextResponse.json({ error: "Could not save settings" }, { status: 400 })
  }

  return NextResponse.json({
    kennel: {
      id: kennel.id,
      name: kennel.name,
      contactEmail: kennel.contact_email,
      phone: kennel.phone,
      postcode: kennel.postcode,
      slug: kennel.slug,
      notifyNewRequest: kennel.notify_new_request,
      notifyAccepted: kennel.notify_accepted,
      notifyRejected: kennel.notify_rejected,
    },
  })
}
