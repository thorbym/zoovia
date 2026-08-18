import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/clients"

type OwnerRow = {
  id: string
  kennel_id: string
  name: string
  email: string
  phone: string | null
  created_at: string
}

type DogRow = {
  id: string
  name: string
  breed: string
  size_category: string
  vaccination_expiry_date: string | null
  internal_notes: string | null
}

type BookingRequestRow = {
  id: string
  check_in_date: string
  check_out_date: string
  status: "new" | "needs-info" | "accepted" | "rejected"
  created_at: string
  dogs: { id: string; name: string } | { id: string; name: string }[] | null
}

export async function GET(
  _: Request,
  { params }: { params: { id?: string } | Promise<{ id?: string }> },
) {
  const resolvedParams = await params
  const ownerId = resolvedParams?.id
  if (!ownerId) {
    return NextResponse.json({ error: "Missing owner id" }, { status: 400 })
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
  const { data: owner, error: ownerError } = await serviceRole
    .from("owners")
    .select("id, kennel_id, name, email, phone, created_at")
    .eq("id", ownerId)
    .maybeSingle()

  if (ownerError) {
    return NextResponse.json(
      { error: "Could not load owner", detail: ownerError.message ?? "Unknown error" },
      { status: 400 },
    )
  }

  if (!owner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (owner.kennel_id !== profile.kennel_id) {
    return NextResponse.json({ error: "Owner belongs to another kennel" }, { status: 403 })
  }

  const { data: dogs, error: dogsError } = await serviceRole
    .from("dogs")
    .select("id, name, breed, size_category, vaccination_expiry_date, internal_notes")
    .eq("kennel_id", profile.kennel_id)
    .eq("owner_id", ownerId)
    .order("name", { ascending: true })

  if (dogsError) {
    return NextResponse.json({ error: "Could not load dogs" }, { status: 400 })
  }

  const { data: requests, error: requestsError } = await serviceRole
    .from("booking_requests")
    .select("id, check_in_date, check_out_date, status, created_at, dogs ( id, name )")
    .eq("kennel_id", profile.kennel_id)
    .eq("owner_id", ownerId)
    .order("check_in_date", { ascending: false })

  if (requestsError) {
    return NextResponse.json({ error: "Could not load booking history" }, { status: 400 })
  }

  const mappedRequests = (requests ?? []).map((request: BookingRequestRow) => {
    const dog = Array.isArray(request.dogs) ? request.dogs[0] : request.dogs
    return {
      id: request.id,
      check_in_date: request.check_in_date,
      check_out_date: request.check_out_date,
      status: request.status,
      created_at: request.created_at,
      dog: dog ? { id: dog.id, name: dog.name } : null,
    }
  })

  return NextResponse.json({
    owner: owner as OwnerRow,
    dogs: (dogs ?? []) as DogRow[],
    requests: mappedRequests,
  })
}
