import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/clients"

export async function POST(
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

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("org_id")
    .eq("id", user.id)
    .eq("type", "operator")
    .single()

  if (profileError || !profile || !profile.org_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { note } = (await request.json()) as { note?: string }
  if (!note) {
    return NextResponse.json({ error: "Note required" }, { status: 400 })
  }

  const { error } = await supabase.from("internal_notes").insert({
    org_id: profile.org_id,
    booking_request_id: requestId,
    created_by: user.id,
    note,
  })

  if (error) {
    return NextResponse.json({ error: "Could not save note" }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
