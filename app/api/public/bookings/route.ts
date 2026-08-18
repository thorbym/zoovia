import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient } from "@/lib/supabase/clients"
import { computeAvailabilitySignal } from "@/lib/capacity"

type BookingPayload = {
  kennelSlug: string
  checkInDate: string
  checkOutDate: string
  dogName: string
  breed: string
  sizeCategory: "small" | "medium" | "large"
  vaccinationExpiryDate?: string | null
  ownerName: string
  ownerEmail: string
  ownerPhone?: string | null
  notes?: string | null
  contactOptIn?: boolean
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
    "ownerEmail",
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

  const { data: kennel } = await supabase.from("kennels").select("id, slug").eq("slug", body.kennelSlug).single()

  if (!kennel) {
    return NextResponse.json({ error: "Kennel not found" }, { status: 404 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: capacity } = await supabase
    .from("capacity_settings")
    .select("min_notice_days")
    .eq("kennel_id", kennel.id)
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
    kennel.id,
    body.checkInDate!,
    body.checkOutDate!,
  )

  if (availability === "full") {
    return NextResponse.json({ error: "Dates unavailable", availability }, { status: 409 })
  }

  const { data: owner, error: ownerError } = await supabase
    .from("owners")
    .upsert(
      {
        kennel_id: kennel.id,
        name: body.ownerName!,
        email: body.ownerEmail!,
        phone: body.ownerPhone ?? null,
      },
      { onConflict: "kennel_id,email" },
    )
    .select("id")
    .single()

  if (ownerError || !owner) {
    return NextResponse.json({ error: "Could not save owner" }, { status: 400 })
  }

  const { data: dog, error: dogError } = await supabase
    .from("dogs")
    .upsert(
      {
        kennel_id: kennel.id,
        owner_id: owner.id,
        name: body.dogName!,
        breed: body.breed!,
        size_category: body.sizeCategory!,
        vaccination_expiry_date: body.vaccinationExpiryDate ?? null,
      },
      { onConflict: "kennel_id,owner_id,name" },
    )
    .select("id")
    .single()

  if (dogError || !dog) {
    return NextResponse.json({ error: "Could not save dog" }, { status: 400 })
  }

  const { data: booking, error: bookingError } = await supabase
    .from("booking_requests")
    .insert({
      kennel_id: kennel.id,
      dog_id: dog.id,
      owner_id: owner.id,
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
      contact_opt_in: Boolean(body.contactOptIn),
    })
    .select("id")
    .single()

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Could not save booking" }, { status: 400 })
  }

  return NextResponse.json({ id: booking.id, availability })
}
