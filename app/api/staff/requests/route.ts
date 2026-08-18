import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/clients"

export async function GET(request: Request) {
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

  const url = new URL(request.url)
  const statusFilter = url.searchParams.get("status")

  const query = supabase
    .from("booking_requests")
    .select(
      `
      id,
      status,
      check_in_date,
      check_out_date,
      created_at,
      availability_signal,
      dogs ( name, breed ),
      owners ( name )
    `,
    )
    .eq("kennel_id", profile.kennel_id)
    .order("created_at", { ascending: false })

  if (statusFilter && ["new", "needs-info", "accepted", "rejected"].includes(statusFilter)) {
    query.eq("status", statusFilter)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: "Could not fetch requests" }, { status: 400 })
  }

  return NextResponse.json({ requests: data })
}
