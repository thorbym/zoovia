"use client"

import { use } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Mail, Phone, Calendar, AlertCircle, CheckCircle, XCircle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type RequestDetail = {
  id: string
  dogName: string
  breed: string
  size: string
  vaccination?: string | null
  ownerName: string
  email: string
  phone?: string | null
  checkIn: string
  checkOut: string
  status: "new" | "needs-info" | "accepted" | "rejected"
  notes?: string | null
  createdAt: string
  availabilitySignal?: string | null
  capacitySnapshot?: Record<string, unknown> | null
  internalNotes: { id: string; note: string; created_at: string; created_by: string | null }[]
}

const STATUS_CONFIG = {
  new: { label: "New", color: "bg-primary text-primary-foreground" },
  "needs-info": { label: "Needs info", color: "bg-accent text-accent-foreground" },
  accepted: { label: "Accepted", color: "bg-primary/20 text-primary border border-primary/20" },
  rejected: { label: "Rejected", color: "bg-muted text-muted-foreground" },
}

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>
}) {
  const { requestId } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [internalNotes, setInternalNotes] = useState("")
  const [dialogOpen, setDialogOpen] = useState<"accept" | "needs-info" | "reject" | null>(null)
  const [dialogMessage, setDialogMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRequest() {
      setLoading(true)
      const response = await fetch(`/api/staff/requests/${requestId}`)
      if (!response.ok) {
        setError("Unable to load request.")
        setLoading(false)
        return
      }
      const data = await response.json()
      const req = data.request
      const mapped: RequestDetail = {
        id: req.id,
        dogName: req.dogs?.name ?? "Unknown dog",
        breed: req.dogs?.breed ?? "",
        size: req.dogs?.size_category ?? "",
        vaccination: req.dogs?.vaccination_expiry_date ?? null,
        ownerName: req.owners?.name ?? "Unknown owner",
        email: req.owners?.email ?? "",
        phone: req.owners?.phone ?? "",
        checkIn: req.check_in_date,
        checkOut: req.check_out_date,
        status: req.status,
        notes: req.notes,
        createdAt: req.created_at,
        availabilitySignal: req.availability_signal,
        capacitySnapshot: req.capacity_snapshot ?? null,
        internalNotes: req.internal_notes ?? [],
      }
      setRequest(mapped)
      setLoading(false)
    }
    fetchRequest()
  }, [requestId])

  async function handleAction(action: "accept" | "needs-info" | "reject") {
    if (!request) return
    setIsSubmitting(true)

    const response = await fetch(`/api/staff/requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action === "accept" ? "accepted" : action === "reject" ? "rejected" : "needs-info" }),
    })

    if (!response.ok) {
      toast({
        title: "Update failed",
        description: "Could not update booking request.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    toast({
      title: "Request updated",
      description:
        action === "accept"
          ? "Booking request accepted"
          : action === "needs-info"
            ? "Email sent requesting more information"
            : "Booking request rejected",
    })

    setRequest({ ...request, status: action === "accept" ? "accepted" : action === "reject" ? "rejected" : "needs-info" })
    setDialogOpen(null)
    setDialogMessage("")
    setIsSubmitting(false)
    router.push("/staff/inbox")
  }

  async function handleSaveNote() {
    if (!request || !internalNotes.trim()) return
    setIsSubmitting(true)
    const response = await fetch(`/api/staff/requests/${request.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: internalNotes }),
    })
    if (!response.ok) {
      toast({
        title: "Could not save note",
        description: "Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }
    setRequest({
      ...request,
      internalNotes: [
        ...request.internalNotes,
        { id: crypto.randomUUID(), note: internalNotes, created_at: new Date().toISOString(), created_by: null },
      ],
    })
    setInternalNotes("")
    setIsSubmitting(false)
  }

  const nightCount = useMemo(() => {
    if (!request) return 0
    return Math.ceil(
      (new Date(request.checkOut).getTime() - new Date(request.checkIn).getTime()) / (1000 * 60 * 60 * 24),
    )
  }, [request])

  if (loading) {
    return (
      <div className="min-h-screen">
        <header className="border-b border-border bg-card">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-4">
              <Link
                href="/staff/inbox"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to inbox
              </Link>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Info className="h-4 w-4" />
              Loading request...
            </div>
          </div>
        </header>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="min-h-screen">
        <header className="border-b border-border bg-card">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-4">
              <Link
                href="/staff/inbox"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to inbox
              </Link>
            </div>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              Unable to load request.
            </div>
          </div>
        </header>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[request.status]
  const capacitySnapshot = request.capacitySnapshot as
    | { current_bookings?: number; max_capacity?: number | null; blackout_dates?: string[] }
    | undefined

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link
              href="/staff/inbox"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to inbox
            </Link>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-foreground">
                  {request.dogName} · {request.breed}
                </h1>
                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Requested{" "}
                {new Date(request.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Availability signal */}
            {capacitySnapshot && (
              <Card className="border-accent/40 bg-accent/20">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-accent-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-accent-foreground">
                        {request.availabilitySignal === "full"
                          ? "Full for these dates"
                          : request.availabilitySignal === "nearly_full"
                            ? "Nearly full for these dates"
                            : "Space available"}
                      </p>
                      <p className="text-sm text-accent-foreground">
                        {(capacitySnapshot.current_bookings ?? 0) as number} of{" "}
                        {capacitySnapshot.max_capacity ?? "?"} spaces booked for{" "}
                        {new Date(request.checkIn).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        –{" "}
                        {new Date(request.checkOut).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dog details */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Dog details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Name</p>
                    <p className="text-sm text-muted-foreground">{request.dogName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Breed</p>
                    <p className="text-sm text-muted-foreground">{request.breed}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Size</p>
                    <p className="text-sm text-muted-foreground">{request.size}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Vaccination expiry</p>
                    <p className="text-sm text-muted-foreground">
                      {request.vaccination
                        ? new Date(request.vaccination).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Not provided"}
                    </p>
                  </div>
                </div>
                {request.notes && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Owner notes</p>
                    <p className="text-sm text-muted-foreground leading-relaxed rounded-lg border border-border bg-muted/50 p-3">
                      {request.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Internal notes */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Internal notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add private notes about this request (only visible to staff)..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <Button size="sm" variant="outline" className="bg-transparent" onClick={handleSaveNote} disabled={isSubmitting}>
                    Save notes
                  </Button>
                  {request.internalNotes.length > 0 && (
                    <div className="space-y-2">
                      {request.internalNotes.map((note) => (
                        <div key={note.id} className="rounded-md border border-border bg-muted/40 p-3">
                          <p className="text-sm text-foreground">{note.note}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(note.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking summary */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Booking summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Check-in</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.checkIn).toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Check-out</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.checkOut).toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{nightCount}</span>{" "}
                    {nightCount === 1 ? "night" : "nights"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Owner contact */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Owner contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Name</p>
                  <p className="text-sm text-muted-foreground">{request.ownerName}</p>
                </div>
                <div>
                  <a
                    href={`mailto:${request.email}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {request.email}
                  </a>
                </div>
                {request.phone && (
                  <div>
                    <a
                      href={`tel:${request.phone}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {request.phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            {request.status === "new" && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" onClick={() => setDialogOpen("accept")}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept request
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => setDialogOpen("needs-info")}
                  >
                    <Info className="mr-2 h-4 w-4" />
                    Request more info
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/40"
                    onClick={() => setDialogOpen("reject")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject request
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Accept Dialog */}
      <Dialog open={dialogOpen === "accept"} onOpenChange={() => setDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept booking request</DialogTitle>
            <DialogDescription className="leading-relaxed">
              This will send a confirmation email to {request.ownerName} confirming their booking for {nightCount}{" "}
              {nightCount === 1 ? "night" : "nights"}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(null)}
              disabled={isSubmitting}
              className="bg-transparent"
            >
              Cancel
            </Button>
            <Button onClick={() => handleAction("accept")} disabled={isSubmitting}>
              {isSubmitting ? "Accepting..." : "Accept request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Dialog */}
      <Dialog open={dialogOpen === "needs-info"} onOpenChange={() => setDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request more information</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Send an email to {request.ownerName} requesting additional details before you can confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="info-message">Message to owner</Label>
            <Textarea
              id="info-message"
              placeholder="e.g. Could you confirm Max's vaccination status and provide a copy of his vaccination record?"
              value={dialogMessage}
              onChange={(e) => setDialogMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(null)}
              disabled={isSubmitting}
              className="bg-transparent"
            >
              Cancel
            </Button>
            <Button onClick={() => handleAction("needs-info")} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={dialogOpen === "reject"} onOpenChange={() => setDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject booking request</DialogTitle>
            <DialogDescription className="leading-relaxed">
              This will send an email to {request.ownerName} letting them know you can&apos;t accommodate this booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-message">Reason (optional)</Label>
            <Textarea
              id="reject-message"
              placeholder="e.g. Unfortunately we're fully booked for these dates. Please consider alternative dates or contact us directly."
              value={dialogMessage}
              onChange={(e) => setDialogMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(null)}
              disabled={isSubmitting}
              className="bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("reject")}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Rejecting..." : "Reject request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
