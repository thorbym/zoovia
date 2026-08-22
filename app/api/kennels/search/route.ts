import { NextRequest, NextResponse } from "next/server"
import { KENNELS_SEARCH_PAGE_SIZE, searchKennelsByLocation } from "@/lib/kennels/search"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = Number(searchParams.get("lat"))
  const lng = Number(searchParams.get("lng"))
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0)

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 })
  }

  const { results, total } = await searchKennelsByLocation(
    { latitude: lat, longitude: lng },
    offset,
    KENNELS_SEARCH_PAGE_SIZE,
  )

  return NextResponse.json({ results, total })
}
