import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

type DbClient = SupabaseClient<Database>

export type AvailabilitySignal = Database["public"]["Enums"]["availability_signal"]

type CapacityResult = {
  availability: AvailabilitySignal
  currentBookings: number
  maxCapacity: number | null
  blackoutDates: string[]
}

export async function computeAvailabilitySignal(
  supabase: DbClient,
  orgId: string,
  checkInDate: string,
  checkOutDate: string,
): Promise<CapacityResult> {
  const [{ data: capacity }, { data: blackoutDates }] = await Promise.all([
    supabase
      .from("capacity_settings")
      .select("max_dogs_total")
      .eq("org_id", orgId)
      .maybeSingle(),
    supabase
      .from("blackout_dates")
      .select("date")
      .eq("org_id", orgId)
      .gte("date", checkInDate)
      .lt("date", checkOutDate),
  ])

  const { count: overlappingCount } = await supabase
    .from("booking_requests")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .in("status", ["new", "needs-info", "accepted"])
    .lt("check_in_date", checkOutDate)
    .gt("check_out_date", checkInDate)

  const blackoutList = blackoutDates?.map((d) => d.date) ?? []
  const hasBlackout = blackoutList.length > 0
  const maxCapacity = capacity?.max_dogs_total ?? null
  const currentBookings = overlappingCount ?? 0

  let availability: AvailabilitySignal = "space"
  if (hasBlackout) {
    availability = "full"
  } else if (maxCapacity !== null) {
    if (currentBookings >= maxCapacity) {
      availability = "full"
    } else if (currentBookings / maxCapacity >= 0.8) {
      availability = "nearly_full"
    }
  }

  return {
    availability,
    currentBookings,
    maxCapacity,
    blackoutDates: blackoutList,
  }
}
