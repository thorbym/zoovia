"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, AlertCircle, Info } from "lucide-react"

type RequestListItem = {
  id: string
  dogName: string
  breed: string
  ownerName: string
  checkIn: string
  checkOut: string
  status: "new" | "needs-info" | "accepted" | "rejected"
  availabilitySignal?: string | null
  createdAt: string
}

const STATUS_CONFIG = {
  new: { label: "New", color: "bg-primary text-primary-foreground" },
  "needs-info": { label: "Needs info", color: "bg-accent text-accent-foreground" },
  accepted: { label: "Accepted", color: "bg-primary/20 text-primary border border-primary/20" },
  rejected: { label: "Rejected", color: "bg-muted text-muted-foreground" },
}

export default function InboxPage() {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [requests, setRequests] = useState<RequestListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true)
      const response = await fetch("/api/staff/requests")
      if (!response.ok) {
        setError("Could not load requests.")
        setLoading(false)
        return
      }
      const data = await response.json()
      const mapped: RequestListItem[] =
        data.requests?.map((req: any) => ({
          id: req.id,
          dogName: req.dogs?.name ?? "Unknown dog",
          breed: req.dogs?.breed ?? "",
          ownerName: req.owners?.name ?? "Unknown owner",
          checkIn: req.check_in_date,
          checkOut: req.check_out_date,
          status: req.status,
          availabilitySignal: req.availability_signal,
          createdAt: req.created_at,
        })) ?? []
      setRequests(mapped)
      setLoading(false)
    }

    fetchRequests()
  }, [])

  const filteredRequests = requests.filter((request) => {
    const matchesFilter = filter === "all" || request.status === filter
    const matchesSearch =
      search === "" ||
      request.dogName.toLowerCase().includes(search.toLowerCase()) ||
      request.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      request.breed.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const newCount = requests.filter((r) => r.status === "new").length

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Booking requests</h1>
              <p className="mt-1 text-sm text-muted-foreground">Review and manage incoming booking requests</p>
            </div>
            {newCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <span className="text-xs font-medium text-primary-foreground">{newCount}</span>
                </div>
                <span className="text-muted-foreground">new requests</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by dog name, owner, or breed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All requests" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All requests</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="needs-info">Needs info</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests List */}
        {loading ? (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Info className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-base font-medium text-card-foreground">Loading requests…</h3>
              <p className="text-sm text-muted-foreground">Fetching your latest booking requests</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="mb-2 text-base font-medium text-card-foreground">Unable to load requests</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : filteredRequests.length === 0 ? (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Info className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-base font-medium text-card-foreground">No requests found</h3>
              <p className="text-sm text-muted-foreground">
                {search || filter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "New booking requests will appear here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const statusConfig = STATUS_CONFIG[request.status]
              return (
                <Link key={request.id} href={`/staff/inbox/${request.id}`}>
                  <Card className="border-border transition-colors hover:bg-accent/30">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-medium text-card-foreground">
                              {request.dogName} · {request.breed}
                            </h3>
                            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Owner: {request.ownerName}</p>
                            <p>
                              {new Date(request.checkIn).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}{" "}
                              –{" "}
                              {new Date(request.checkOut).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          {request.availabilitySignal && (
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1 rounded-md bg-accent/60 px-2 py-1 text-xs font-medium text-accent-foreground">
                                <AlertCircle className="h-3 w-3" />
                                {request.availabilitySignal === "full"
                                  ? "Full"
                                  : request.availabilitySignal === "nearly_full"
                                    ? "Nearly full"
                                    : "Space available"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                          <span className="text-xs text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <Button variant="outline" size="sm" className="sm:hidden bg-transparent">
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
