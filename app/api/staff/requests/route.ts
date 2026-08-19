import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/clients"

type RequestRow = {
  id: string
  status: string
  check_in_date: string
  check_out_date: string
  created_at: string
  availability_signal: string | null
  user_id: string
  dogs: { name: string; breed: string } | { name: string; breed: string }[] | null
}

export async function GET(request: Request) {
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

  const url = new URL(request.url)
  const statusFilter = url.searchParams.get("status")

  // Owner names live on user_profiles, which RLS restricts to the owning
  // user — read cross-owner data with the service role once the caller is
  // confirmed to be an operator for this org.
  const serviceRole = createServiceRoleSupabaseClient()
  const query = serviceRole
    .from("booking_requests")
    .select(
      `
      id,
      status,
      check_in_date,
      check_out_date,
      created_at,
      availability_signal,
      user_id,
      dogs ( name, breed )
    `,
    )
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false })

  if (statusFilter && ["new", "needs-info", "accepted", "rejected"].includes(statusFilter)) {
    query.eq("status", statusFilter)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: "Could not fetch requests" }, { status: 400 })
  }

  const rows = (data ?? []) as RequestRow[]
  const ownerIds = Array.from(new Set(rows.map((row) => row.user_id)))
  const { data: owners } = await serviceRole
    .from("user_profiles")
    .select("id, full_name")
    .in("id", ownerIds)

  const nameById = new Map((owners ?? []).map((o) => [o.id, o.full_name]))

  const requests = rows.map((row) => ({
    id: row.id,
    status: row.status,
    check_in_date: row.check_in_date,
    check_out_date: row.check_out_date,
    created_at: row.created_at,
    availability_signal: row.availability_signal,
    dogs: Array.isArray(row.dogs) ? row.dogs[0] : row.dogs,
    owners: { name: nameById.get(row.user_id) ?? "Unknown owner" },
  }))

  return NextResponse.json({ requests })
}
