"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X, Plus, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type BlackoutDate = {
  id: string
  date: string
  reason: string | null
}

type AvailabilityResponse = {
  capacity: {
    maxDogsTotal: number
    minNoticeDays: number
  }
  blackouts: BlackoutDate[]
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function AvailabilityPage() {
  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [blackoutReason, setBlackoutReason] = useState("")
  const [maxCapacity, setMaxCapacity] = useState("20")
  const [minNotice, setMinNotice] = useState("2")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingBlackoutId, setSavingBlackoutId] = useState<string | null>(null)
  const [savingNewBlackout, setSavingNewBlackout] = useState(false)

  useEffect(() => {
    let active = true
    async function fetchAvailability() {
      setLoading(true)
      setError("")
      const response = await fetch("/api/staff/availability")
      if (!response.ok) {
        if (active) {
          setError("Unable to load availability settings.")
          setLoading(false)
        }
        return
      }
      const data = (await response.json()) as AvailabilityResponse
      if (!active) return
      setBlackoutDates(data.blackouts)
      setMaxCapacity(String(data.capacity.maxDogsTotal))
      setMinNotice(String(data.capacity.minNoticeDays))
      setLoading(false)
    }
    fetchAvailability()
    return () => {
      active = false
    }
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
  }

  function getFirstDayOfMonth(year: number, month: number) {
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1 // Convert Sunday (0) to 6, and shift other days
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  function formatDate(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  function isBlackout(day: number) {
    const date = formatDate(day)
    return blackoutDates.some((b) => b.date === date)
  }

  function getBlackout(day: number) {
    const date = formatDate(day)
    return blackoutDates.find((b) => b.date === date)
  }

  async function handleDayClick(day: number) {
    const date = formatDate(day)
    const existingBlackout = blackoutDates.find((b) => b.date === date)

    if (existingBlackout) {
      await handleRemoveBlackout(existingBlackout)
    } else {
      // Open dialog to add blackout
      setSelectedDate(date)
      setDialogOpen(true)
    }
  }

  async function handleAddBlackout() {
    if (!selectedDate) return
    setSavingNewBlackout(true)
    const response = await fetch("/api/staff/availability/blackouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, reason: blackoutReason }),
    })

    if (!response.ok) {
      toast({
        title: "Could not save blackout",
        description: "Please try again.",
        variant: "destructive",
      })
      setSavingNewBlackout(false)
      return
    }

    const data = (await response.json()) as { blackout: BlackoutDate }
    setBlackoutDates((current) => [...current, data.blackout])
    toast({
      title: "Blackout added",
      description: `${new Date(selectedDate).toLocaleDateString("en-GB", { day: "numeric", month: "long" })} marked as unavailable`,
    })
    setDialogOpen(false)
    setBlackoutReason("")
    setSavingNewBlackout(false)
  }

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  async function handleRemoveBlackout(blackout: BlackoutDate) {
    setSavingBlackoutId(blackout.id)
    const response = await fetch(`/api/staff/availability/blackouts/${blackout.id}`, { method: "DELETE" })
    if (!response.ok) {
      toast({
        title: "Could not remove blackout",
        description: "Please try again.",
        variant: "destructive",
      })
      setSavingBlackoutId(null)
      return
    }
    setBlackoutDates((current) => current.filter((b) => b.id !== blackout.id))
    toast({
      title: "Blackout removed",
      description: `${new Date(blackout.date).toLocaleDateString("en-GB", { day: "numeric", month: "long" })} is now available`,
    })
    setSavingBlackoutId(null)
  }

  async function saveSettings() {
    const maxDogsTotal = Number(maxCapacity)
    const minNoticeDays = Number(minNotice)
    if (!Number.isFinite(maxDogsTotal) || maxDogsTotal <= 0) {
      toast({
        title: "Invalid capacity",
        description: "Maximum dogs must be a positive number.",
        variant: "destructive",
      })
      return
    }
    if (!Number.isFinite(minNoticeDays) || minNoticeDays < 0) {
      toast({
        title: "Invalid notice period",
        description: "Minimum notice must be zero or more.",
        variant: "destructive",
      })
      return
    }
    setSavingSettings(true)
    const response = await fetch("/api/staff/availability", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxDogsTotal, minNoticeDays }),
    })

    if (!response.ok) {
      toast({
        title: "Could not save settings",
        description: "Please try again.",
        variant: "destructive",
      })
      setSavingSettings(false)
      return
    }

    const data = (await response.json()) as { capacity: AvailabilityResponse["capacity"] }
    setMaxCapacity(String(data.capacity.maxDogsTotal))
    setMinNotice(String(data.capacity.minNoticeDays))
    toast({
      title: "Settings saved",
      description: "Capacity and notice settings have been updated",
    })
    setSavingSettings(false)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-foreground">Availability</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage blackout dates and capacity settings</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2">
            {error && (
              <Card className="border-border mb-6">
                <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
              </Card>
            )}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {MONTHS[month]} {year}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={previousMonth} className="h-8 w-8 bg-transparent">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 bg-transparent">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>Click dates to add or remove blackouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {/* Day headers */}
                  {DAYS.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                  {/* Empty days */}
                  {emptyDays.map((i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {/* Calendar days */}
                  {days.map((day) => {
                    const blackout = getBlackout(day)
                    const isPast = new Date(formatDate(day)) < new Date(new Date().setHours(0, 0, 0, 0))
                    return (
                      <button
                        key={day}
                        onClick={() => !isPast && !loading && handleDayClick(day)}
                        disabled={isPast || loading || savingNewBlackout || savingBlackoutId !== null}
                        className={cn(
                          "relative aspect-square rounded-md text-sm font-medium transition-colors",
                          isPast && "text-muted-foreground/40 cursor-not-allowed",
                          !isPast && !blackout && "hover:bg-accent text-foreground",
                          !isPast && blackout && "bg-destructive/20 text-destructive hover:bg-destructive/30",
                        )}
                      >
                        {day}
                        {blackout && !isPast && <X className="absolute top-1 right-1 h-3 w-3 text-destructive" />}
                      </button>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md border border-border bg-background" />
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-destructive/20" />
                    <span className="text-muted-foreground">Blackout</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blackout list */}
            {blackoutDates.length > 0 && (
              <Card className="border-border mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming blackout dates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[...blackoutDates]
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((blackout) => (
                        <div
                          key={blackout.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {new Date(blackout.date).toLocaleDateString("en-GB", {
                                weekday: "short",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">{blackout.reason}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveBlackout(blackout)}
                            className="h-8 w-8 bg-transparent text-muted-foreground hover:text-destructive"
                            disabled={savingBlackoutId === blackout.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings sidebar */}
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Capacity settings</CardTitle>
                <CardDescription>These help show availability signals in booking requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-capacity">Maximum dogs at once</Label>
                  <Input
                    id="max-capacity"
                    type="number"
                    min="1"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    disabled={loading || savingSettings}
                  />
                  <p className="text-xs text-muted-foreground">Total capacity across all spaces</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-notice">Minimum notice (days)</Label>
                  <Input
                    id="min-notice"
                    type="number"
                    min="0"
                    value={minNotice}
                    onChange={(e) => setMinNotice(e.target.value)}
                    disabled={loading || savingSettings}
                  />
                  <p className="text-xs text-muted-foreground">Days ahead customers should request</p>
                </div>
                <Button onClick={saveSettings} className="w-full" disabled={loading || savingSettings}>
                  {savingSettings ? "Saving..." : "Save settings"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-accent/40 bg-accent/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 shrink-0 text-accent-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-accent-foreground">About availability</p>
                    <p className="text-xs text-accent-foreground leading-relaxed">
                      Blackout dates block all bookings. Capacity settings help show &quot;nearly full&quot; warnings but
                      don&apos;t prevent bookings—you always have final approval.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add Blackout Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setBlackoutReason("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add blackout date</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Mark{" "}
              {selectedDate &&
                new Date(selectedDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
              as unavailable for bookings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              placeholder="e.g. Staff holiday, Maintenance"
              value={blackoutReason}
              onChange={(e) => setBlackoutReason(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleAddBlackout} disabled={savingNewBlackout}>
              <Plus className="mr-2 h-4 w-4" />
              {savingNewBlackout ? "Saving..." : "Add blackout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
