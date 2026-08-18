"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export function BookingForm({ kennelSlug }: { kennelSlug: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [size, setSize] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)

    if (!size) {
      setError("Please select a size.")
      setIsSubmitting(false)
      return
    }

    const payload = {
      kennelSlug,
      checkInDate: formData.get("check-in") as string,
      checkOutDate: formData.get("check-out") as string,
      dogName: formData.get("dog-name") as string,
      breed: formData.get("breed") as string,
      sizeCategory: size,
      vaccinationExpiryDate: (formData.get("vaccination-expiry") as string) || null,
      ownerName: formData.get("owner-name") as string,
      ownerEmail: formData.get("email") as string,
      ownerPhone: formData.get("phone") as string,
      notes: (formData.get("notes") as string) || null,
    }

    const response = await fetch("/api/public/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = await response.json()
      setError(data?.error || "Could not submit request")
      setIsSubmitting(false)
      return
    }

    router.push(`/book/${kennelSlug}/confirmation`)
  }

  return (
    <Card className="border-border">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-card-foreground text-balance">Request a booking</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Complete the form below and we&apos;ll review your request. All fields marked with * are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-card-foreground">Your dates</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="check-in">
                  Check-in date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input id="check-in" name="check-in" type="date" required className="pr-10" />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="check-out">
                  Check-out date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input id="check-out" name="check-out" type="date" required className="pr-10" />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Dog Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-card-foreground">About your dog</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="dog-name">
                  Dog&apos;s name <span className="text-destructive">*</span>
                </Label>
                <Input id="dog-name" name="dog-name" placeholder="e.g. Max" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="breed">
                    Breed <span className="text-destructive">*</span>
                  </Label>
                  <Input id="breed" name="breed" placeholder="e.g. Labrador" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">
                    Size <span className="text-destructive">*</span>
                  </Label>
                  <Select required value={size} onValueChange={setSize}>
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (0-10kg)</SelectItem>
                      <SelectItem value="medium">Medium (10-25kg)</SelectItem>
                      <SelectItem value="large">Large (25kg+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vaccination-expiry">Vaccination expiry date</Label>
                <Input id="vaccination-expiry" name="vaccination-expiry" type="date" />
                <p className="text-xs text-muted-foreground">Optional, but helps us process your request faster</p>
              </div>
            </div>
          </div>

          {/* Owner Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-card-foreground">Your contact details</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner-name">
                  Full name <span className="text-destructive">*</span>
                </Label>
                <Input id="owner-name" name="owner-name" placeholder="e.g. Sarah Smith" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input id="email" name="email" type="email" placeholder="sarah@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input id="phone" name="phone" type="tel" placeholder="07123 456789" required />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional information</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special requirements, dietary needs, medication, or other information we should know..."
              rows={4}
              className="resize-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit booking request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
