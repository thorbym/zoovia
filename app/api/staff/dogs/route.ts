import { NextResponse } from "next/server"
import { createServiceRoleSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/clients"

type BookingRequestRow = {
  dog_id: string
  user_id: string
  check_in_date: string
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

  // RLS has no policy letting an operator read another user's profile
  // directly, so cross-owner lookups go through the service role once the
  // caller is confirmed to be an operator for this org.
  const serviceRole = createServiceRoleSupabaseClient()

  const { data: dogs, error: dogsError } = await serviceRole
    .from("dogs")
    .select("id, name, breed, size_category, vaccination_expiry_date, internal_notes, user_id")
    .eq("org_id", profile.org_id)
    .order("name", { ascending: true })

  if (dogsError) {
    return NextResponse.json({ error: "Could not fetch dogs" }, { status: 400 })
  }

  const { data: bookingRequests, error: requestsError } = await serviceRole
    .from("booking_requests")
    .select("dog_id, user_id, check_in_date")
    .eq("org_id", profile.org_id)

  if (requestsError) {
    return NextResponse.json({ error: "Could not fetch booking requests" }, { status: 400 })
  }

  const ownerIds = Array.from(new Set((dogs ?? []).map((dog) => dog.user_id)))
  const { data: ownerProfiles, error: ownersError } = await serviceRole
    .from("user_profiles")
    .select("id, full_name, phone")
    .in("id", ownerIds)

  if (ownersError) {
    return NextResponse.json({ error: "Could not fetch owners" }, { status: 400 })
  }

  const emailById = new Map<string, string>()
  await Promise.all(
    ownerIds.map(async (id) => {
      const { data } = await serviceRole.auth.admin.getUserById(id)
      if (data?.user?.email) {
        emailById.set(id, data.user.email)
      }
    }),
  )

  const profileById = new Map((ownerProfiles ?? []).map((p) => [p.id, p]))

  const requestsByDog = new Map<string, { count: number; lastCheckIn?: string }>()
  const requestsByOwner = new Map<string, { count: number; lastCheckIn?: string }>()

  for (const request of (bookingRequests ?? []) as BookingRequestRow[]) {
    const dogStats = requestsByDog.get(request.dog_id) ?? { count: 0 }
    dogStats.count += 1
    if (!dogStats.lastCheckIn || request.check_in_date > dogStats.lastCheckIn) {
      dogStats.lastCheckIn = request.check_in_date
    }
    requestsByDog.set(request.dog_id, dogStats)

    const ownerStats = requestsByOwner.get(request.user_id) ?? { count: 0 }
    ownerStats.count += 1
    if (!ownerStats.lastCheckIn || request.check_in_date > ownerStats.lastCheckIn) {
      ownerStats.lastCheckIn = request.check_in_date
    }
    requestsByOwner.set(request.user_id, ownerStats)
  }

  const ownersMap = new Map<
    string,
    { id: string; name: string; email: string; phone: string | null; dogs: string[] }
  >()

  const enrichedDogs = (dogs ?? []).map((dog) => {
    const ownerProfile = profileById.get(dog.user_id)
    const ownerName = ownerProfile?.full_name ?? "Unknown owner"
    if (ownerProfile) {
      const existingOwner =
        ownersMap.get(dog.user_id) ??
        {
          id: dog.user_id,
          name: ownerName,
          email: emailById.get(dog.user_id) ?? "",
          phone: ownerProfile.phone,
          dogs: [],
        }
      existingOwner.dogs = Array.from(new Set([...existingOwner.dogs, dog.name]))
      ownersMap.set(dog.user_id, existingOwner)
    }

    const stats = requestsByDog.get(dog.id)
    return {
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      size: dog.size_category,
      ownerId: dog.user_id,
      ownerName,
      lastRequest: stats?.lastCheckIn ?? null,
      totalRequests: stats?.count ?? 0,
      vaccination: dog.vaccination_expiry_date ?? null,
      notes: dog.internal_notes ?? null,
    }
  })

  const owners = Array.from(ownersMap.values())
    .map((owner) => {
      const stats = requestsByOwner.get(owner.id)
      return {
        ...owner,
        totalRequests: stats?.count ?? 0,
        lastRequest: stats?.lastCheckIn ?? null,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({ dogs: enrichedDogs, owners })
}
