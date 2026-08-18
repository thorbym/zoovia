"use client"

import type React from "react"
import type { google } from "googlemaps"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { WaitlistModal } from "@/components/waitlist-modal"
import { KennelOwnerModal } from "@/components/kennel-owner-modal"
import { MapPin, Calendar, Shield, Clock, Heart, Star, ArrowRight, Crosshair as Crosshairs } from "lucide-react"

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export default function HomePage() {
  const [location, setLocation] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [showKennelOwnerModal, setShowKennelOwnerModal] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<NominatimResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const locationInputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  const today = new Date().toISOString().split("T")[0]

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=gb&q=${encodeURIComponent(query)}`,
      )
      const results: NominatimResult[] = await response.json()
      setLocationSuggestions(results)
      setShowSuggestions(results.length > 0)
    } catch (error) {
      console.log("[v0] Nominatim search failed:", error)
      setLocationSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocation(value)

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      searchLocations(value)
    }, 300)
  }

  const handleSuggestionClick = (suggestion: NominatimResult) => {
    setLocation(suggestion.display_name)
    setLocationSuggestions([])
    setShowSuggestions(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowWaitlist(true)
  }

  /*
  const handleDateFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.type = "date"
    e.target.min = today
  }

  const handleDateBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.type = "text"
  }

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCheckIn(value)
    if (e.target.type === "date" && value) {
      const checkOutInput = document.getElementById("checkout") as HTMLInputElement
      if (checkOutInput && checkOutInput.type === "date") {
        checkOutInput.min = value
      }
      setTimeout(() => {
        if (e.target.type === "text") {
          setCheckIn(formatDateDisplay(value))
        }
      }, 100)
    }
  }

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCheckOut(value)
    if (e.target.type === "date" && value) {
      setTimeout(() => {
        if (e.target.type === "text") {
          setCheckOut(formatDateDisplay(value))
        }
      }, 100)
    }
  }

  const handleCheckOutFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.type = "date"
    const minDate = checkIn && checkIn.includes("/") ? checkIn.split("/").reverse().join("-") : today
    e.target.min = minDate
  }
*/
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

          if (result && result.display_name) {
            setLocation(result.display_name)
          } else {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          }
        } catch (error) {
          console.log("[v0] Reverse geocoding failed:", error)
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div>
              <img
                src="/zoovia_icon.png"
                alt="Zoovia icon"
                height={35}
                width={35}
              />
            </div>
            <span className="font-bold text-3xl text-accent font-sans tracking-tight">Zoovia</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setShowKennelOwnerModal(true)}
              className="text-foreground hover:text-accent transition-colors font-medium"
            >
              Kennel owner? Join Zoovia
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="font-bold text-4xl md:text-6xl text-foreground mb-6 leading-tight font-sans tracking-tight">
            Find the perfect kennel. <br />Completely stress free.
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Quickly discover and book <span className="font-bold text-accent">trusted</span> kennels with our UK-wide directory.
          </p>

          {/* Search Form */}
          <Card className="max-w-2xl mx-auto shadow-lg border-2 border-accent/20">
            <CardContent className="p-8 px-8 py-4">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2 font-medium text-foreground">
                      <MapPin className="w-4 h-4 text-accent" />
                      Location
                    </Label>
                    <div className="relative" ref={locationInputRef}>
                      <Input
                        id="location"
                        placeholder="Enter place"
                        value={location}
                        onChange={handleLocationChange}
                        onFocus={() => location.length >= 3 && setShowSuggestions(locationSuggestions.length > 0)}
                        required
                        className="border-2 border-border focus:border-accent transition-colors pr-12"
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

                      {showSuggestions && locationSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-background border-2 border-accent/20 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                          {locationSuggestions.map((suggestion) => (
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkin" className="flex items-center gap-2 font-medium text-foreground">
                      <Calendar className="w-4 h-4 text-accent" />
                      Check-in Date
                    </Label>
                    <Input
                      id="checkin"
                      type="date"
                      placeholder="Select check-in date"
                      value={checkIn}
                      min={today}
                      onChange={(e) => setCheckIn(e.target.value)}
                      //onChange={handleCheckInChange}
                      //onFocus={handleDateFocus}
                      //onBlur={handleDateBlur}
                      required
                      className="border-2 border-border focus:border-accent transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout" className="flex items-center gap-2 font-medium text-foreground">
                      <Calendar className="w-4 h-4 text-accent" />
                      Check-out Date
                    </Label>
                    <Input
                      id="checkout"
                      type="date"
                      placeholder="Select check-out date"
                      value={checkOut}
                      min={!checkIn ? today : checkIn}
                      onChange={(e) => setCheckOut(e.target.value)}
                      //onChange={handleCheckOutChange}
                      //onFocus={handleCheckOutFocus}
                      //onBlur={handleDateBlur}
                      required
                      className="border-2 border-border focus:border-accent transition-colors"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                >
                  Search for kennels
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <img
            src="/happy-dogs-playing-in-a-modern-kennel-facility-wit.png"
            alt="Happy dogs in a modern kennel facility"
            className="w-full h-96 object-cover rounded-2xl shadow-2xl"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-bold text-3xl md:text-4xl text-center text-foreground mb-4 font-sans tracking-tight">
            Why Dog Owners Love Zoovia
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            We make finding the perfect kennel a walk in the park.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-200 border-2 border-accent/10">
              <CardContent className="p-8">
                <Shield className="w-16 h-16 text-accent mx-auto mb-6" />
                <h3 className="font-serif font-bold text-xl mb-4 text-foreground">Trusted & Safe</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We keep all the information, so you can rest assured your dog is happy and safe.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow duration-200 border-2 border-accent/10">
              <CardContent className="p-8">
                <Clock className="w-16 h-16 text-accent mx-auto mb-6" />
                <h3 className="font-serif font-bold text-xl mb-4 text-foreground">Super Easy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Find the perfect kennel in just minutes. No stress, no hassle - just happy tails!
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow duration-200 border-2 border-accent/10">
              <CardContent className="p-8">
                <Heart className="w-16 h-16 text-accent mx-auto mb-6" />
                <h3 className="font-serif font-bold text-xl mb-4 text-foreground">Peace of Mind</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real reviews from loving dog owners like you. Be confident they will love their time away.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-bold text-3xl md:text-4xl text-center text-foreground mb-4 font-sans tracking-tight">
            Happy Dogs, Happy Owners
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12">
            See what fellow dog lovers are saying about their Zoovia experience
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-200 border-2 border-accent/10">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  "Finding a trustworthy kennel used to be so stressful. Zoovia made it incredibly easy to find the
                  perfect place for Max!"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="/smiling-woman-with-golden-retriever.png"
                    alt="Sarah with her dog"
                    className="w-12 h-12 rounded-full object-cover border-2 border-accent/20"
                  />
                  <div>
                    <p className="font-semibold text-foreground">Sarah M.</p>
                    <p className="text-sm text-muted-foreground">Golden Retriever mum </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-200 border-2 border-accent/10">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  "The reviews and photos gave me complete confidence. Luna had an amazing time and I could relax
                  knowing she was happy."
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="/happy-man-with-border-collie.png"
                    alt="Mike with his dog"
                    className="w-12 h-12 rounded-full object-cover border-2 border-accent/20"
                  />
                  <div>
                    <p className="font-semibold text-foreground">Mike R.</p>
                    <p className="text-sm text-muted-foreground">Border Collie parent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-bold text-3xl md:text-4xl text-foreground mb-6 tracking-tight font-sans">
            Ready to Make Your Dog's Day?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Join the many happy dog owners who trust Zoovia to find amazing kennels for their furry family friends.
          </p>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            onClick={() => setShowWaitlist(true)}
          >
            Search for kennels
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">

              </div>
              <p className="text-muted-foreground">Connecting dog parents with trusted kennels nationwide.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Services</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Find Kennels
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Book Online
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Reviews
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Safety
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>2025 Zoovia. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <WaitlistModal
        open={showWaitlist}
        onOpenChange={setShowWaitlist}
        searchData={{
          location,
          checkIn,
          checkOut,
        }}
      />

      <KennelOwnerModal open={showKennelOwnerModal} onOpenChange={setShowKennelOwnerModal} />
    </div>
  )
}

declare global {
  interface Window {
    google: typeof google
  }
}
