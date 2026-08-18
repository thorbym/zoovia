import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/clients"

type BlackoutPayload = {
  date?: string
  reason?: string
}

export async function POST(request: Request) {
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

  const body = (await request.json()) as BlackoutPayload
  if (!body.date) {
    return NextResponse.json({ error: "Date required" }, { status: 400 })
  }

  const { data: blackout, error } = await supabase
    .from("blackout_dates")
    .insert({
      kennel_id: profile.kennel_id,
      date: body.date,
      reason: body.reason?.trim() ? body.reason.trim() : null,
    })
    .select("id, date, reason")
    .single()

  if (error || !blackout) {
    return NextResponse.json({ error: "Could not save blackout date" }, { status: 400 })
  }

  return NextResponse.json({ blackout })
}
