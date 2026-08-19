"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, MapPin, Mail, Phone, ArrowRight } from "lucide-react"

interface KennelOwnerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultKennelName?: string
  defaultLocation?: string
  slug?: string
}

export function KennelOwnerModal({
  open,
  onOpenChange,
  defaultKennelName = "",
  defaultLocation = "",
  slug,
}: KennelOwnerModalProps) {
  const [kennelName, setKennelName] = useState(defaultKennelName)
  const [location, setLocation] = useState(defaultLocation)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const isClaim = Boolean(slug)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Send kennel owner data to API
      const response = await fetch("/api/send-kennel-owner-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kennelName,
          location,
          email,
          phone,
          slug,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      // Close modal and redirect to thanks page
      onOpenChange(false)

      // Reset form
      setKennelName("")
      setLocation("")
      setEmail("")
      setPhone("")

      router.push("/thanks-kennel")
    } catch (error) {
      console.error("Error submitting kennel owner form:", error)
      // Still redirect to thanks page even if email fails
      onOpenChange(false)
      setKennelName(defaultKennelName)
      setLocation(defaultLocation)
      setEmail("")
      setPhone("")
      router.push("/thanks-kennel")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold text-center text-foreground">
            {isClaim ? `Claim ${defaultKennelName}` : "Join Zoovia as a Kennel Owner"}
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            {isClaim
              ? "We'll verify you're the owner and be in touch to hand over the listing."
              : "Help dog owners find your amazing kennel. We'll be in touch soon!"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="kennel-name" className="flex items-center gap-2 font-medium text-foreground">
              <Building2 className="w-4 h-4 text-accent" />
              Kennel Name
            </Label>
            <Input
              id="kennel-name"
              type="text"
              placeholder="Enter your kennel name"
              value={kennelName}
              onChange={(e) => setKennelName(e.target.value)}
              required
              className="border-2 border-border focus:border-accent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kennel-location" className="flex items-center gap-2 font-medium text-foreground">
              <MapPin className="w-4 h-4 text-accent" />
              Location
            </Label>
            <Input
              id="kennel-location"
              type="text"
              placeholder="Enter your kennel location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="border-2 border-border focus:border-accent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kennel-email" className="flex items-center gap-2 font-medium text-foreground">
              <Mail className="w-4 h-4 text-accent" />
              Email Address
            </Label>
            <Input
              id="kennel-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-2 border-border focus:border-accent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kennel-phone" className="flex items-center gap-2 font-medium text-foreground">
              <Phone className="w-4 h-4 text-accent" />
              Phone Number
            </Label>
            <Input
              id="kennel-phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="border-2 border-border focus:border-accent transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : isClaim ? "Claim this listing" : "Join the waitlist"}
            {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
