import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/clients"
import { computeAvailabilitySignal } from "@/lib/capacity"
import { getUserFromRequest } from "@/lib/auth"

type BookingPayload = {
  kennelSlug: string
  checkInDate: string
  checkOutDate: string
  dogName: string
  breed: string
  sizeCategory: "small" | "medium" | "large"
  vaccinationExpiryDate?: string | null
  ownerName: string
  ownerPhone?: string | null
  notes?: string | null
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<BookingPayload>

  const required = [
    "kennelSlug",
    "checkInDate",
    "checkOutDate",
    "dogName",
    "breed",
    "sizeCategory",
    "ownerName",
  ] as const

  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: "Missing required field" }, { status: 400 })
    }
  }

  const checkInDate = new Date(body.checkInDate!)
  const checkOutDate = new Date(body.checkOutDate!)
  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 })
  }

  const supabase = createServiceRoleSupabaseClient()

  const { data: organisation } = await supabase
    .from("organisations")
    .select("id, slug")
    .eq("slug", body.kennelSlug)
    .single()

  if (!organisation) {
    return NextResponse.json({ error: "Kennel not found" }, { status: 404 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: capacity } = await supabase
    .from("capacity_settings")
    .select("min_notice_days")
    .eq("org_id", organisation.id)
    .maybeSingle()

  if (capacity?.min_notice_days) {
    const earliestAllowed = new Date(today)
    earliestAllowed.setDate(today.getDate() + capacity.min_notice_days)
    if (checkInDate < earliestAllowed) {
      return NextResponse.json({ error: "Requested dates do not meet notice period" }, { status: 400 })
    }
  }

  const { availability, currentBookings, maxCapacity, blackoutDates } = await computeAvailabilitySignal(
    supabase,
    organisation.id,
    body.checkInDate!,
    body.checkOutDate!,
  )

  if (availability === "full") {
    return NextResponse.json({ error: "Dates unavailable", availability }, { status: 409 })
  }

  // Dogs and booking requests carry a real user_id — there is no anonymous
  // submission path. The form gates on sign up/sign in before this point.
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 })
  }

  const { data: existingProfile } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (!existingProfile) {
    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: user.id,
      type: "owner",
      full_name: body.ownerName!,
      phone: body.ownerPhone ?? null,
    })

    if (profileError) {
      return NextResponse.json({ error: "Could not save owner profile" }, { status: 400 })
    }
  }

  const { data: dog, error: dogError } = await supabase
    .from("dogs")
    .upsert(
      {
        org_id: organisation.id,
        user_id: user.id,
        name: body.dogName!,
        breed: body.breed!,
        size_category: body.sizeCategory!,
        vaccination_expiry_date: body.vaccinationExpiryDate ?? null,
      },
      { onConflict: "user_id,name" },
    )
    .select("id")
    .single()

  if (dogError || !dog) {
    return NextResponse.json({ error: "Could not save dog" }, { status: 400 })
  }

  const { data: booking, error: bookingError } = await supabase
    .from("booking_requests")
    .insert({
      org_id: organisation.id,
      dog_id: dog.id,
      user_id: user.id,
      check_in_date: body.checkInDate!,
      check_out_date: body.checkOutDate!,
      status: "new",
      availability_signal: availability,
      capacity_snapshot: {
        current_bookings: currentBookings,
        max_capacity: maxCapacity,
        blackout_dates: blackoutDates,
      },
      notes: body.notes ?? null,
    })
    .select("id")
    .single()

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Could not save booking" }, { status: 400 })
  }

  return NextResponse.json({ id: booking.id, availability })
}
