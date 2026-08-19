import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/clients"

type AvailabilityPayload = {
  maxDogsTotal?: number
  minNoticeDays?: number
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

  const { data: capacity, error: capacityError } = await supabase
    .from("capacity_settings")
    .select("max_dogs_total, min_notice_days")
    .eq("org_id", profile.org_id)
    .maybeSingle()

  if (capacityError) {
    return NextResponse.json({ error: "Could not load capacity settings" }, { status: 400 })
  }

  const { data: blackouts, error: blackoutError } = await supabase
    .from("blackout_dates")
    .select("id, date, reason")
    .eq("org_id", profile.org_id)
    .order("date", { ascending: true })

  if (blackoutError) {
    return NextResponse.json({ error: "Could not load blackout dates" }, { status: 400 })
  }

  return NextResponse.json({
    capacity: {
      maxDogsTotal: capacity?.max_dogs_total ?? 20,
      minNoticeDays: capacity?.min_notice_days ?? 2,
    },
    blackouts: blackouts ?? [],
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

  const body = (await request.json()) as AvailabilityPayload

  if (typeof body.maxDogsTotal !== "number" || body.maxDogsTotal <= 0) {
    return NextResponse.json({ error: "Invalid max dogs total" }, { status: 400 })
  }

  if (typeof body.minNoticeDays !== "number" || body.minNoticeDays < 0) {
    return NextResponse.json({ error: "Invalid minimum notice days" }, { status: 400 })
  }

  const { data: capacity, error } = await supabase
    .from("capacity_settings")
    .upsert(
      {
        org_id: profile.org_id,
        max_dogs_total: body.maxDogsTotal,
        min_notice_days: body.minNoticeDays,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "org_id" },
    )
    .select("max_dogs_total, min_notice_days")
    .single()

  if (error || !capacity) {
    return NextResponse.json({ error: "Could not save capacity settings" }, { status: 400 })
  }

  return NextResponse.json({
    capacity: {
      maxDogsTotal: capacity.max_dogs_total,
      minNoticeDays: capacity.min_notice_days,
    },
  })
}
