"use client"

import { useEffect, useRef, useState } from "react"
import { Crosshair as Crosshairs } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PickedLocation {
  label: string
  lat: number
  lng: number
}

interface PhotonProperties {
  osm_id: number
  name?: string
  city?: string
  county?: string
  state?: string
  country?: string
  countrycode?: string
}

interface PhotonFeature {
  properties: PhotonProperties
  geometry: { coordinates: [number, number] }
}

interface PhotonResponse {
  features: PhotonFeature[]
}

// Roughly UK + Ireland; countrycode filter below narrows to Great Britain only.
const UK_BBOX = "-8.65,49.82,1.76,60.85"

function formatLabel(p: PhotonProperties): string {
  const parts: string[] = []
  const seen = new Set<string>()
  for (const value of [p.name, p.city, p.county, p.state, p.country]) {
    if (value && !seen.has(value)) {
      seen.add(value)
      parts.push(value)
    }
  }
  return parts.join(", ")
}

interface LocationPickerProps {
  id?: string
  placeholder?: string
  defaultValue?: PickedLocation | null
  onChange: (value: PickedLocation | null) => void
  className?: string
}

export function LocationPicker({
  id,
  placeholder = "Enter a UK postcode, town, or address",
  defaultValue = null,
  onChange,
  className,
}: LocationPickerProps) {
  const [text, setText] = useState(defaultValue?.label ?? "")
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?lang=en&limit=8&bbox=${UK_BBOX}&q=${encodeURIComponent(query)}`,
      )
      const data: PhotonResponse = await response.json()
      const results = data.features.filter((f) => f.properties.countrycode === "GB").slice(0, 5)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    } catch (error) {
      console.log("[location-picker] Photon search failed:", error)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setText(value)
    onChange(null)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      searchLocations(value)
    }, 300)
  }

  const handleSuggestionClick = (suggestion: PhotonFeature) => {
    const label = formatLabel(suggestion.properties)
    const [lng, lat] = suggestion.geometry.coordinates
    setText(label)
    setSuggestions([])
    setShowSuggestions(false)
    onChange({ label, lat, lng })
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const response = await fetch(`https://photon.komoot.io/reverse?lang=en&lat=${latitude}&lon=${longitude}`)
          const data: PhotonResponse = await response.json()
          const label = data.features[0]
            ? formatLabel(data.features[0].properties)
            : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`

          setText(label)
          setSuggestions([])
          setShowSuggestions(false)
          onChange({ label, lat: latitude, lng: longitude })
        } catch (error) {
          console.log("[location-picker] Reverse geocoding failed:", error)
          const label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setText(label)
          onChange({ label, lat: latitude, lng: longitude })
        } finally {
          setLocationLoading(false)
        }
      },
      (error) => {
        setLocationLoading(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("Location access denied by user.")
            break
          case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.")
            break
          case error.TIMEOUT:
            alert("Location request timed out.")
            break
          default:
            alert("An unknown error occurred while retrieving location.")
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <Input
        id={id}
        placeholder={placeholder}
        value={text}
        onChange={handleTextChange}
        onFocus={() => text.length >= 3 && setShowSuggestions(suggestions.length > 0)}
        className="border-2 border-border focus:border-accent transition-colors pr-12"
        autoComplete="off"
      />
      <button
        type="button"
        onClick={handleGetLocation}
        disabled={locationLoading}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent hover:text-accent/80 transition-colors disabled:opacity-50"
        title="Use my current location"
      >
        <Crosshairs className={`w-5 h-5 ${locationLoading ? "animate-spin" : ""}`} />
      </button>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-background border-2 border-accent/20 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.properties.osm_id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-accent/10 transition-colors border-b border-border/50 last:border-b-0"
            >
              <div className="text-sm text-foreground">{formatLabel(suggestion.properties)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
