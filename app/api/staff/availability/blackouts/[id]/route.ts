import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/clients"

export async function DELETE(
  _: Request,
  { params }: { params: { id?: string } | Promise<{ id?: string }> },
) {
  const resolvedParams = await params
  const blackoutId = resolvedParams?.id
  if (!blackoutId) {
    return NextResponse.json({ error: "Missing blackout id" }, { status: 400 })
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

  const { data: blackout, error } = await supabase
    .from("blackout_dates")
    .delete()
    .eq("org_id", profile.org_id)
    .eq("id", blackoutId)
    .select("id")
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: "Could not remove blackout date" }, { status: 400 })
  }

  if (!blackout) {
    return NextResponse.json({ error: "Blackout not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
