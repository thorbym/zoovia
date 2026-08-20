"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LocationPicker, type PickedLocation } from "@/components/location-picker"

export function KennelsSearchBar({ defaultValue }: { defaultValue?: PickedLocation | null }) {
  const router = useRouter()
  const [place, setPlace] = useState<PickedLocation | null>(defaultValue ?? null)
  const [locationError, setLocationError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!place) {
      setLocationError(true)
      return
    }
    router.push(`/kennels?lat=${place.lat}&lng=${place.lng}&label=${encodeURIComponent(place.label)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <LocationPicker
          placeholder="Postcode, town, or area"
          defaultValue={place}
          onChange={(value) => {
            setPlace(value)
            if (value) setLocationError(false)
          }}
          className="flex-1"
        />
        <Button type="submit">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
      {locationError && <p className="text-sm text-destructive">Select a location from the suggestions list.</p>}
    </form>
  )
}
