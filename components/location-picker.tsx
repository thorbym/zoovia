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

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
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
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
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
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=gb&q=${encodeURIComponent(query)}`,
      )
      const results: NominatimResult[] = await response.json()
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    } catch (error) {
      console.log("[location-picker] Nominatim search failed:", error)
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

  const handleSuggestionClick = (suggestion: NominatimResult) => {
    setText(suggestion.display_name)
    setSuggestions([])
    setShowSuggestions(false)
    onChange({
      label: suggestion.display_name,
      lat: Number(suggestion.lat),
      lng: Number(suggestion.lon),
    })
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
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          )
          const result = await response.json()
          const label: string = result?.display_name ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`

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
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-accent/10 transition-colors border-b border-border/50 last:border-b-0"
            >
              <div className="text-sm text-foreground">{suggestion.display_name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
