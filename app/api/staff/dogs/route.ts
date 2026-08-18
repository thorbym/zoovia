import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/clients"

type BookingRequestRow = {
  dog_id: string
  owner_id: string
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
    .from("staff_profiles")
    .select("kennel_id")
    .eq("user_id", user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: dogs, error: dogsError } = await supabase
    .from("dogs")
    .select(
      `
      id,
      name,
      breed,
      size_category,
      vaccination_expiry_date,
      internal_notes,
      owner_id,
      owners ( id, name, email, phone )
    `,
    )
    .eq("kennel_id", profile.kennel_id)
    .order("name", { ascending: true })

  if (dogsError) {
    return NextResponse.json({ error: "Could not fetch dogs" }, { status: 400 })
  }

  const { data: bookingRequests, error: requestsError } = await supabase
    .from("booking_requests")
    .select("dog_id, owner_id, check_in_date")
    .eq("kennel_id", profile.kennel_id)

  if (requestsError) {
    return NextResponse.json({ error: "Could not fetch booking requests" }, { status: 400 })
  }

  const requestsByDog = new Map<string, { count: number; lastCheckIn?: string }>()
  const requestsByOwner = new Map<string, { count: number; lastCheckIn?: string }>()

  for (const request of (bookingRequests ?? []) as BookingRequestRow[]) {
    const dogStats = requestsByDog.get(request.dog_id) ?? { count: 0 }
    dogStats.count += 1
    if (!dogStats.lastCheckIn || request.check_in_date > dogStats.lastCheckIn) {
      dogStats.lastCheckIn = request.check_in_date
    }
    requestsByDog.set(request.dog_id, dogStats)

    const ownerStats = requestsByOwner.get(request.owner_id) ?? { count: 0 }
    ownerStats.count += 1
    if (!ownerStats.lastCheckIn || request.check_in_date > ownerStats.lastCheckIn) {
      ownerStats.lastCheckIn = request.check_in_date
    }
    requestsByOwner.set(request.owner_id, ownerStats)
  }

  const ownersMap = new Map<
    string,
    { id: string; name: string; email: string; phone: string | null; dogs: string[] }
  >()

  const enrichedDogs = (dogs ?? []).map((dog) => {
    const owner = Array.isArray(dog.owners) ? dog.owners[0] : dog.owners
    if (owner) {
      const existingOwner =
        ownersMap.get(owner.id) ?? { id: owner.id, name: owner.name, email: owner.email, phone: owner.phone, dogs: [] }
      existingOwner.dogs = Array.from(new Set([...existingOwner.dogs, dog.name]))
      ownersMap.set(owner.id, existingOwner)
    }

    const stats = requestsByDog.get(dog.id)
    return {
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      size: dog.size_category,
      ownerId: dog.owner_id,
      ownerName: owner?.name ?? "Unknown owner",
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
