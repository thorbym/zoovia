"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin, Star, Phone, Clock, Heart, ArrowLeft, Filter } from "lucide-react"

interface Kennel {
  id: string
  name: string
  location: string
  distance: string
  rating: number
  reviewCount: number
  pricePerNight: number
  image: string
  features: string[]
  description: string
  phone: string
  availability: "available" | "limited" | "unavailable"
  listingType: "premium" | "basic"
}

const fakeKennels: Kennel[] = [
  {
    id: "1",
    name: "Happy Tails Kennel",
    location: "Manchester, Greater Manchester",
    distance: "2.3 miles",
    rating: 4.9,
    reviewCount: 127,
    pricePerNight: 35,
    image: "/modern-dog-kennel-facility-with-outdoor-runs.jpg",
    features: ["Outdoor Runs", "24/7 Care", "Grooming", "Webcam Access"],
    description: "A family-run kennel with spacious outdoor runs and loving care for your furry friends.",
    phone: "0161 234 5678",
    availability: "available",
    listingType: "premium",
  },
  {
    id: "2",
    name: "Countryside Canine Care",
    location: "Cheshire East, Cheshire",
    distance: "8.7 miles",
    rating: 4.8,
    reviewCount: 89,
    pricePerNight: 42,
    image: "/countryside-dog-kennel-with-green-fields.jpg",
    features: ["Rural Setting", "Dog Walking", "Vet On-Call", "Pick-up Service"],
    description: "Set in beautiful countryside with acres of space for dogs to roam and play safely.",
    phone: "01625 987 654",
    availability: "limited",
    listingType: "premium",
  },
  {
    id: "3",
    name: "City Paws Boarding",
    location: "Salford, Greater Manchester",
    distance: "4.1 miles",
    rating: 4.7,
    reviewCount: 203,
    pricePerNight: 38,
    image: "/modern-urban-dog-boarding-facility.jpg",
    features: ["Climate Control", "Play Areas", "Training", "Medical Care"],
    description: "Modern urban facility with climate-controlled rooms and professional training services.",
    phone: "0161 876 5432",
    availability: "available",
    listingType: "premium",
  },
  {
    id: "4",
    name: "Pawsome Paradise",
    location: "Stockport, Greater Manchester",
    distance: "6.2 miles",
    rating: 4.6,
    reviewCount: 156,
    pricePerNight: 45,
    image: "/luxury-dog-kennel-with-swimming-pool.jpg",
    features: ["Swimming Pool", "Luxury Suites", "Spa Services", "Gourmet Meals"],
    description: "Luxury boarding with swimming facilities and spa treatments for the ultimate pampered experience.",
    phone: "0161 445 7890",
    availability: "available",
    listingType: "premium",
  },
  {
    id: "5",
    name: "Woodland Retreat Kennels",
    location: "Derbyshire Dales, Derbyshire",
    distance: "12.5 miles",
    rating: 4.9,
    reviewCount: 94,
    pricePerNight: 40,
    image: "/woodland-dog-kennel-surrounded-by-trees.jpg",
    features: ["Forest Walks", "Natural Setting", "Homemade Food", "Small Groups"],
    description: "Peaceful woodland setting with natural forest walks and homemade nutritious meals.",
    phone: "01629 123 456",
    availability: "unavailable",
    listingType: "premium",
  },
  {
    id: "6",
    name: "Furry Friends Lodge",
    location: "Warrington, Cheshire",
    distance: "15.3 miles",
    rating: 4.5,
    reviewCount: 78,
    pricePerNight: 32,
    image: "/cozy-family-run-dog-kennel.jpg",
    features: ["Family Run", "Socialization", "Daily Updates", "Flexible Hours"],
    description: "",
    phone: "01925 567 890",
    availability: "limited",
    listingType: "premium",
  },
  {
    id: "7",
    name: "Barking Mad Kennels",
    location: "Bolton, Greater Manchester",
    distance: "7.8 miles",
    rating: 0,
    reviewCount: 0,
    pricePerNight: 25,
    image: "",
    features: [],
    description: "",
    phone: "01204 123 456",
    availability: "available",
    listingType: "basic",
  },
  {
    id: "8",
    name: "Paws & Claws Boarding",
    location: "Oldham, Greater Manchester",
    distance: "9.2 miles",
    rating: 0,
    reviewCount: 0,
    pricePerNight: 28,
    image: "",
    features: [],
    description: "",
    phone: "0161 789 0123",
    availability: "available",
    listingType: "basic",
  },
  {
    id: "9",
    name: "Canine Corner",
    location: "Rochdale, Greater Manchester",
    distance: "11.4 miles",
    rating: 0,
    reviewCount: 0,
    pricePerNight: 22,
    image: "",
    features: [],
    description: "",
    phone: "01706 456 789",
    availability: "limited",
    listingType: "basic",
  },
  {
    id: "10",
    name: "Wag & Stay Kennels",
    location: "Bury, Greater Manchester",
    distance: "13.1 miles",
    rating: 0,
    reviewCount: 0,
    pricePerNight: 30,
    image: "",
    features: [],
    description: "",
    phone: "0161 234 9876",
    availability: "available",
    listingType: "basic",
  },
]

export default function DemoResultsClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [kennels, setKennels] = useState<Kennel[]>(fakeKennels)
  const [sortBy, setSortBy] = useState<"distance" | "price" | "rating">("distance")
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedKennel, setSelectedKennel] = useState<Kennel | null>(null)
  const [requestedBookings, setRequestedBookings] = useState<Set<string>>(new Set())

  const location = searchParams.get("location") || "Manchester"
  const checkIn = searchParams.get("checkIn") || ""
  const checkOut = searchParams.get("checkOut") || ""

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  const sortKennels = (criteria: "distance" | "price" | "rating") => {
    const sorted = [...kennels].sort((a, b) => {
      switch (criteria) {
        case "distance":
          return Number.parseFloat(a.distance) - Number.parseFloat(b.distance)
        case "price":
          return a.pricePerNight - b.pricePerNight
        case "rating":
          return b.rating - a.rating
        default:
          return 0
      }
    })
    setKennels(sorted)
    setSortBy(criteria)
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "limited":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "unavailable":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "available":
        return "Available"
      case "limited":
        return "Limited Availability"
      case "unavailable":
        return "Fully Booked"
      default:
        return "Unknown"
    }
  }

  const handleBookingRequest = (kennel: Kennel) => {
    setSelectedKennel(kennel)
    setShowBookingModal(true)
  }

  const confirmBooking = () => {
    if (selectedKennel) {
      setRequestedBookings((prev) => new Set(prev).add(selectedKennel.id))
      setShowBookingModal(false)
      setSelectedKennel(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <img src="/zoovia_icon.png" alt="Zoovia icon" height={35} width={35} />
              <span className="font-bold text-3xl text-accent font-sans tracking-tight">Zoovia</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <span className="text-foreground/60 font-medium">Demo Mode</span>
          </nav>
        </div>
      </header>

      {/* Search Summary */}
      <section className="py-6 px-4 bg-card border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-bold text-2xl text-foreground mb-2">Kennels near {location}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {checkIn && checkOut && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(checkIn)} - {formatDate(checkOut)}
                  </span>
                )}
                <span>{kennels.length} kennels found</span>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex gap-1">
                {[
                  { key: "distance", label: "Distance" },
                  { key: "price", label: "Price" },
                  { key: "rating", label: "Rating" },
                ].map((option) => (
                  <Button
                    key={option.key}
                    variant={sortBy === option.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => sortKennels(option.key as "distance" | "price" | "rating")}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-6">
            {kennels.map((kennel) => (
              <Card key={kennel.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-0">
                  {kennel.listingType === "premium" ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                      <div className="md:col-span-1">
                        <img
                          src={kennel.image || "/placeholder.svg"}
                          alt={kennel.name}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                      <div className="md:col-span-3 p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-xl text-foreground">{kennel.name}</h3>
                              <Badge className={`ml-2 ${getAvailabilityColor(kennel.availability)}`}>
                                {getAvailabilityText(kennel.availability)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {kennel.location} • {kennel.distance}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-accent text-accent" />
                                {kennel.rating} ({kennel.reviewCount} reviews)
                              </span>
                            </div>
                            <p className="text-muted-foreground mb-4 leading-relaxed">{kennel.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {kennel.features.map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {kennel.phone}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between min-w-[200px]">
                            <div className="text-right mb-4">
                              <div className="font-bold text-2xl text-foreground">£{kennel.pricePerNight}</div>
                              <div className="text-sm text-muted-foreground">per night</div>
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                              <Button
                                className="w-full bg-accent hover:bg-accent/90"
                                disabled={kennel.availability === "unavailable" || requestedBookings.has(kennel.id)}
                                onClick={() => handleBookingRequest(kennel)}
                              >
                                {kennel.availability === "unavailable"
                                  ? "Fully Booked"
                                  : requestedBookings.has(kennel.id)
                                    ? "Booking requested"
                                    : "Request a booking"}
                              </Button>
                              <Button variant="outline" className="w-full bg-transparent">
                                View Details
                              </Button>
                              <Button variant="ghost" size="sm" className="w-full">
                                <Heart className="w-4 h-4 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                      <div className="md:col-span-1">
                        <div className="w-full h-48 md:h-full bg-card"></div>
                      </div>
                      <div className="md:col-span-3 p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-xl text-foreground">{kennel.name}</h3>
                            </div>
                            <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {kennel.location} • {kennel.distance}
                              </span>
                            </div>
                            <p className="text-muted-foreground mb-4 leading-relaxed">{kennel.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {kennel.phone}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between min-w-[200px]">
                            <div className="text-right mb-4">
                              <div className="font-bold text-2xl text-foreground">£{kennel.pricePerNight}</div>
                              <div className="text-sm text-muted-foreground">per night</div>
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                              <Button
                                className="w-full bg-accent hover:bg-accent/90"
                                disabled={kennel.availability === "unavailable" || requestedBookings.has(kennel.id)}
                                onClick={() => handleBookingRequest(kennel)}
                              >
                                {kennel.availability === "unavailable"
                                  ? "Fully Booked"
                                  : requestedBookings.has(kennel.id)
                                    ? "Booking requested"
                                    : "Request a booking"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Results
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm Booking Request</DialogTitle>
            <DialogDescription className="text-base leading-relaxed pt-2">
              Request a booking at <span className="font-semibold text-foreground">{selectedKennel?.name}</span> from{" "}
              <span className="font-semibold text-foreground">{formatDate(checkIn)}</span> to{" "}
              <span className="font-semibold text-foreground">{formatDate(checkOut)}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={confirmBooking} className="flex-1 bg-accent hover:bg-accent/90">
              Request booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
