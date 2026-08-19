import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/clients"

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
    .from("user_profiles")
    .select("org_id")
    .eq("id", user.id)
    .eq("type", "operator")
    .single()

  if (!profile || !profile.org_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const serviceRole = createServiceRoleSupabaseClient()
  const { data: ownerProfile, error: ownerError } = await serviceRole
    .from("user_profiles")
    .select("id, full_name, phone, created_at")
    .eq("id", ownerId)
    .eq("type", "owner")
    .maybeSingle()

  if (ownerError) {
    return NextResponse.json(
      { error: "Could not load owner", detail: ownerError.message ?? "Unknown error" },
      { status: 400 },
    )
  }

  if (!ownerProfile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { data: dogs, error: dogsError } = await serviceRole
    .from("dogs")
    .select("id, name, breed, size_category, vaccination_expiry_date, internal_notes")
    .eq("org_id", profile.org_id)
    .eq("user_id", ownerId)
    .order("name", { ascending: true })

  if (dogsError) {
    return NextResponse.json({ error: "Could not load dogs" }, { status: 400 })
  }

  const { data: requests, error: requestsError } = await serviceRole
    .from("booking_requests")
    .select("id, check_in_date, check_out_date, status, created_at, dogs ( id, name )")
    .eq("org_id", profile.org_id)
    .eq("user_id", ownerId)
    .order("check_in_date", { ascending: false })

  if (requestsError) {
    return NextResponse.json({ error: "Could not load booking history" }, { status: 400 })
  }

  // An owner has no org_id of their own — they only "belong" to a kennel
  // through the dogs/requests they've submitted there.
  if ((dogs?.length ?? 0) === 0 && (requests?.length ?? 0) === 0) {
    return NextResponse.json({ error: "Owner has no history with this kennel" }, { status: 403 })
  }

  const { data: ownerAuth } = await serviceRole.auth.admin.getUserById(ownerId)

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
    owner: {
      id: ownerProfile.id,
      name: ownerProfile.full_name ?? "Unknown owner",
      email: ownerAuth?.user?.email ?? "",
      phone: ownerProfile.phone,
      created_at: ownerProfile.created_at,
    },
    dogs: (dogs ?? []) as DogRow[],
    requests: mappedRequests,
  })
}
