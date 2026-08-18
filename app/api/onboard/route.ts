import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/clients"

type OnboardPayload = {
  email: string
  password: string
  kennelName: string
  kennelSlug: string
  postcode: string
  phone?: string
  maxDogsTotal: number
  minNoticeDays: number
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<OnboardPayload>

  if (
    !body.email ||
    !body.password ||
    !body.kennelName ||
    !body.kennelSlug ||
    !body.email ||
    !body.postcode ||
    typeof body.maxDogsTotal !== "number" ||
    body.maxDogsTotal <= 0
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const supabase = createServiceRoleSupabaseClient()

  const slug = body.kennelSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  const { data: kennel, error: kennelError } = await supabase
    .from("kennels")
    .insert({
      name: body.kennelName,
      slug,
      contact_email: body.email,
      postcode: body.postcode,
      phone: body.phone ?? null,
    })
    .select("id, name, slug")
    .single()

  if (kennelError) {
    return NextResponse.json({ error: "Could not create kennel" }, { status: 400 })
  }

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
  })

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Could not create user" }, { status: 400 })
  }

  const { error: profileError } = await supabase.from("staff_profiles").insert({
    user_id: userData.user.id,
    kennel_id: kennel.id,
    role: "owner",
  })

  if (profileError) {
    return NextResponse.json({ error: "Could not link staff profile" }, { status: 400 })
  }

  const { error: capacityError } = await supabase.from("capacity_settings").insert({
    kennel_id: kennel.id,
    max_dogs_total: body.maxDogsTotal,
    min_notice_days: body.minNoticeDays ?? 0,
  })

  if (capacityError) {
    return NextResponse.json({ error: "Could not save capacity settings" }, { status: 400 })
  }

  return NextResponse.json({ slug: kennel.slug })
}
