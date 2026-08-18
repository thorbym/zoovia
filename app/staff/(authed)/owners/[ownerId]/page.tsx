"use client"

import { use } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, ArrowLeft, Info } from "lucide-react"

type OwnerDetail = {
  id: string
  name: string
  email: string
  phone: string | null
  created_at: string
}

type DogDetail = {
  id: string
  name: string
  breed: string
  size_category: string
  vaccination_expiry_date: string | null
  internal_notes: string | null
}

type OwnerRequest = {
  id: string
  check_in_date: string
  check_out_date: string
  status: "new" | "needs-info" | "accepted" | "rejected"
  created_at: string
  dog: { id: string; name: string } | null
}

const SIZE_LABELS: Record<string, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
}

const STATUS_CONFIG = {
  new: { label: "New", color: "bg-primary text-primary-foreground" },
  "needs-info": { label: "Needs info", color: "bg-accent text-accent-foreground" },
  accepted: { label: "Accepted", color: "bg-primary/20 text-primary border border-primary/20" },
  rejected: { label: "Rejected", color: "bg-muted text-muted-foreground" },
}

export default function OwnerDetailPage({
  params,
}: {
  params: Promise<{ ownerId: string }>
}) {
  const { ownerId } = use(params)
  const [owner, setOwner] = useState<OwnerDetail | null>(null)
  const [dogs, setDogs] = useState<DogDetail[]>([])
  const [requests, setRequests] = useState<OwnerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    async function fetchOwner() {
      setLoading(true)
      setError("")
      const response = await fetch(`/api/staff/owners/${ownerId}`)
      if (!response.ok) {
        if (active) {
          setError("Unable to load owner details.")
          setLoading(false)
        }
        return
      }
      const data = (await response.json()) as {
        owner: OwnerDetail
        dogs: DogDetail[]
        requests: OwnerRequest[]
      }
      if (active) {
        setOwner(data.owner)
        setDogs(data.dogs)
        setRequests(data.requests)
        setLoading(false)
      }
    }
    fetchOwner()
    return () => {
      active = false
    }
  }, [ownerId])

  const totalNights = useMemo(() => {
    return requests.reduce((sum, request) => {
      const nights = Math.ceil(
        (new Date(request.check_out_date).getTime() - new Date(request.check_in_date).getTime()) /
          (1000 * 60 * 60 * 24),
      )
      return sum + (Number.isFinite(nights) ? nights : 0)
    }, 0)
  }, [requests])

  if (loading) {
    return (
      <div className="min-h-screen">
        <header className="border-b border-border bg-card">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Info className="h-4 w-4" />
              Loading owner...
            </div>
          </div>
        </header>
      </div>
    )
  }

  if (error || !owner) {
    return (
      <div className="min-h-screen">
        <header className="border-b border-border bg-card">
          <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-2">
            <Link
              href="/staff/dogs"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dogs & owners
            </Link>
            <div className="text-sm text-muted-foreground">{error || "Owner not found."}</div>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-3">
          <Link
            href="/staff/dogs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dogs & owners
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{owner.name}</h1>
              <p className="text-sm text-muted-foreground">
                Owner since{" "}
                {new Date(owner.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/staff/dogs">View all dogs</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Contact details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-col gap-2">
                <a
                  href={`mailto:${owner.email}`}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {owner.email}
                </a>
                {owner.phone ? (
                  <a
                    href={`tel:${owner.phone}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    {owner.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Phone not provided</span>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader>
              <CardTitle>History snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Total requests</span>
                <span className="font-medium text-foreground">{requests.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total nights</span>
                <span className="font-medium text-foreground">{totalNights}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Dogs on file</span>
                <span className="font-medium text-foreground">{dogs.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Dogs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No dogs linked to this owner yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dogs.map((dog) => (
                  <div key={dog.id} className="rounded-lg border border-border p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-medium text-foreground">{dog.name}</p>
                        <p className="text-sm text-muted-foreground">{dog.breed}</p>
                      </div>
                      <Badge variant="outline" className="bg-transparent">
                        {SIZE_LABELS[dog.size_category] ?? dog.size_category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vaccination expiry:{" "}
                      {dog.vaccination_expiry_date
                        ? new Date(dog.vaccination_expiry_date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Not provided"}
                    </p>
                    {dog.internal_notes && (
                      <div className="rounded-md border border-border bg-muted/50 p-2">
                        <p className="text-xs text-muted-foreground leading-relaxed">{dog.internal_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Booking history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No booking requests on file yet.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => {
                  const statusConfig = STATUS_CONFIG[request.status]
                  return (
                    <div key={request.id} className="rounded-lg border border-border p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-foreground">
                              {request.dog?.name ?? "Unknown dog"}
                            </p>
                            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.check_in_date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            –{" "}
                            {new Date(request.check_out_date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Requested{" "}
                          {new Date(request.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
