import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/clients"

export async function GET(
  _: Request,
  { params }: { params: { id?: string } | Promise<{ id?: string }> },
) {
  const resolvedParams = await params
  const requestId = resolvedParams?.id
  if (!requestId) {
    return NextResponse.json({ error: "Missing request id" }, { status: 400 })
  }
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("kennel_id")
    .eq("user_id", user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const serviceRole = createServiceRoleSupabaseClient()
  const { data: request, error } = await serviceRole
    .from("booking_requests")
    .select(
      `
      id,
      kennel_id,
      status,
      check_in_date,
      check_out_date,
      created_at,
      availability_signal,
      capacity_snapshot,
      notes,
      dog_id,
      owner_id
    `,
    )
    .eq("id", requestId)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: "Could not load request", detail: error.message ?? "Unknown error" },
      { status: 400 },
    )
  }

  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (request.kennel_id !== profile.kennel_id) {
    return NextResponse.json({ error: "Request belongs to another kennel" }, { status: 403 })
  }

  const { data: dog, error: dogError } = await serviceRole
    .from("dogs")
    .select("name, breed, size_category, vaccination_expiry_date, internal_notes")
    .eq("id", request.dog_id)
    .single()

  if (dogError || !dog) {
    return NextResponse.json(
      { error: "Could not load request", detail: dogError?.message ?? "Missing dog record" },
      { status: 400 },
    )
  }

  const { data: owner, error: ownerError } = await serviceRole
    .from("owners")
    .select("name, email, phone")
    .eq("id", request.owner_id)
    .single()

  if (ownerError || !owner) {
    return NextResponse.json(
      { error: "Could not load request", detail: ownerError?.message ?? "Missing owner record" },
      { status: 400 },
    )
  }

  const { data: notes, error: notesError } = await serviceRole
    .from("internal_notes")
    .select("id, note, created_at, created_by")
    .eq("booking_request_id", requestId)
    .order("created_at", { ascending: false })

  const internalNotes = notesError ? [] : notes ?? []

  return NextResponse.json({
    request: {
      id: request.id,
      status: request.status,
      check_in_date: request.check_in_date,
      check_out_date: request.check_out_date,
      created_at: request.created_at,
      availability_signal: request.availability_signal,
      capacity_snapshot: request.capacity_snapshot,
      notes: request.notes,
      dogs: dog,
      owners: owner,
      internal_notes: internalNotes,
    },
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id?: string } | Promise<{ id?: string }> },
) {
  const resolvedParams = await params
  const requestId = resolvedParams?.id
  if (!requestId) {
    return NextResponse.json({ error: "Missing request id" }, { status: 400 })
  }
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("kennel_id")
    .eq("user_id", user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { status } = (await request.json()) as { status?: string }
  if (!status || !["new", "needs-info", "accepted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const { error } = await supabase
    .from("booking_requests")
    .update({ status })
    .eq("kennel_id", profile.kennel_id)
    .eq("id", requestId)

  if (error) {
    return NextResponse.json({ error: "Could not update" }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
