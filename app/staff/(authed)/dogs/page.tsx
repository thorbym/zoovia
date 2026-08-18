"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, Phone, Info } from "lucide-react"

type DogRecord = {
  id: string
  name: string
  breed: string
  size: string
  ownerId: string
  ownerName: string
  lastRequest: string | null
  totalRequests: number
  vaccination: string | null
  notes: string | null
}

type OwnerRecord = {
  id: string
  name: string
  email: string
  phone: string | null
  dogs: string[]
  totalRequests: number
  lastRequest: string | null
}

const SIZE_LABELS: Record<string, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
}

export default function DogsOwnersPage() {
  const [searchDogs, setSearchDogs] = useState("")
  const [searchOwners, setSearchOwners] = useState("")
  const [breedFilter, setBreedFilter] = useState("all")
  const [sizeFilter, setSizeFilter] = useState("all")
  const [dogs, setDogs] = useState<DogRecord[]>([])
  const [owners, setOwners] = useState<OwnerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    async function fetchDogsOwners() {
      setLoading(true)
      setError("")
      const response = await fetch("/api/staff/dogs")
      if (!response.ok) {
        if (active) {
          setError("Unable to load dogs and owners.")
          setLoading(false)
        }
        return
      }
      const data = (await response.json()) as { dogs: DogRecord[]; owners: OwnerRecord[] }
      if (active) {
        setDogs(data.dogs)
        setOwners(data.owners)
        setLoading(false)
      }
    }
    fetchDogsOwners()
    return () => {
      active = false
    }
  }, [])

  const breedOptions = useMemo(() => {
    return Array.from(new Set(dogs.map((dog) => dog.breed).filter(Boolean))).sort((a, b) => a.localeCompare(b))
  }, [dogs])

  const sizeOptions = useMemo(() => {
    return Array.from(new Set(dogs.map((dog) => dog.size).filter(Boolean))).sort((a, b) => a.localeCompare(b))
  }, [dogs])

  const filteredDogs = useMemo(() => {
    return dogs.filter((dog) => {
      const matchesSearch =
        searchDogs === "" ||
        dog.name.toLowerCase().includes(searchDogs.toLowerCase()) ||
        dog.breed.toLowerCase().includes(searchDogs.toLowerCase()) ||
        dog.ownerName.toLowerCase().includes(searchDogs.toLowerCase())
      const matchesBreed = breedFilter === "all" || dog.breed === breedFilter
      const matchesSize = sizeFilter === "all" || dog.size === sizeFilter
      return matchesSearch && matchesBreed && matchesSize
    })
  }, [dogs, searchDogs, breedFilter, sizeFilter])

  const filteredOwners = useMemo(() => {
    return owners.filter((owner) => {
      const matchesSearch =
        searchOwners === "" ||
        owner.name.toLowerCase().includes(searchOwners.toLowerCase()) ||
        owner.email.toLowerCase().includes(searchOwners.toLowerCase())
      return matchesSearch
    })
  }, [owners, searchOwners])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-foreground">Dogs & Owners</h1>
          <p className="mt-1 text-sm text-muted-foreground">View dogs and owners from past and current bookings</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="dogs" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="dogs">Dogs</TabsTrigger>
            <TabsTrigger value="owners">Owners</TabsTrigger>
          </TabsList>

          {/* Dogs Tab */}
          <TabsContent value="dogs" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search dogs by name, breed, or owner..."
                  value={searchDogs}
                  onChange={(e) => setSearchDogs(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={breedFilter} onValueChange={setBreedFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All breeds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All breeds</SelectItem>
                  {breedOptions.map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sizes</SelectItem>
                  {sizeOptions.map((size) => (
                    <SelectItem key={size} value={size}>
                      {SIZE_LABELS[size] ?? size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dogs List */}
            {loading ? (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Info className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-base font-medium text-card-foreground">Loading dogs</h3>
                  <p className="text-sm text-muted-foreground">Fetching the latest dogs and owners</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Info className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-base font-medium text-card-foreground">Unable to load</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </CardContent>
              </Card>
            ) : filteredDogs.length === 0 ? (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Info className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-base font-medium text-card-foreground">No dogs found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDogs.map((dog) => (
                  <Card key={dog.id} className="border-border">
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div>
                          <div className="mb-1 flex items-start justify-between">
                            <h3 className="text-lg font-medium text-card-foreground">{dog.name}</h3>
                            <Badge variant="outline" className="bg-transparent">
                              {SIZE_LABELS[dog.size] ?? dog.size}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{dog.breed}</p>
                        </div>
                        <div className="space-y-1 border-t border-border pt-3 text-sm">
                          <p className="text-muted-foreground">
                            Owner:{" "}
                            <Link href={`/staff/owners/${dog.ownerId}`} className="text-primary hover:underline">
                              {dog.ownerName}
                            </Link>
                          </p>
                          <p className="text-muted-foreground">
                            Last request:{" "}
                            {dog.lastRequest
                              ? new Date(dog.lastRequest).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "No requests yet"}
                          </p>
                          <p className="text-muted-foreground">Total requests: {dog.totalRequests}</p>
                          <p className="text-muted-foreground">
                            Vaccination expiry:{" "}
                            {dog.vaccination
                              ? new Date(dog.vaccination).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Not provided"}
                          </p>
                        </div>
                        {dog.notes && (
                          <div className="rounded-md border border-border bg-muted/50 p-2">
                            <p className="text-xs text-muted-foreground leading-relaxed">{dog.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Owners Tab */}
          <TabsContent value="owners" className="space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search owners by name or email..."
                value={searchOwners}
                onChange={(e) => setSearchOwners(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Owners List */}
            {loading ? (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Info className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-base font-medium text-card-foreground">Loading owners</h3>
                  <p className="text-sm text-muted-foreground">Fetching the latest dogs and owners</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Info className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-base font-medium text-card-foreground">Unable to load</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </CardContent>
              </Card>
            ) : filteredOwners.length === 0 ? (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Info className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-base font-medium text-card-foreground">No owners found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your search terms</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredOwners.map((owner) => (
                  <Card key={owner.id} className="border-border">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="mb-1 text-lg font-medium text-card-foreground">{owner.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {owner.dogs.length} {owner.dogs.length === 1 ? "dog" : "dogs"}: {owner.dogs.join(", ")}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 text-sm">
                            {owner.email && (
                              <a
                                href={`mailto:${owner.email}`}
                                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Mail className="h-4 w-4" />
                                {owner.email}
                              </a>
                            )}
                            {owner.phone && (
                              <a
                                href={`tel:${owner.phone}`}
                                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Phone className="h-4 w-4" />
                                {owner.phone}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 text-sm sm:items-end">
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">{owner.totalRequests}</span> requests
                          </p>
                          <p className="text-muted-foreground">
                            Last request:{" "}
                            {owner.lastRequest
                              ? new Date(owner.lastRequest).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "No requests yet"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
