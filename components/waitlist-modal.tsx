"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface WaitlistModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchData?: {
    location: string
    checkIn: string
    checkOut: string
  }
}

export function WaitlistModal({ open, onOpenChange, searchData }: WaitlistModalProps) {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsLoading(true)

      try {
        const response = await fetch("/api/send-waitlist-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            location: searchData?.location || "",
            checkIn: searchData?.checkIn || "",
            checkOut: searchData?.checkOut || "",
          }),
        })

        if (response.ok) {
          console.log("Waitlist signup:", email, searchData)
          onOpenChange(false)
          setEmail("")
          setIsSubmitted(false)
          router.push("/thanks")
        } else {
          console.error("Failed to send email")
          // Still proceed to thanks page even if email fails
          onOpenChange(false)
          setEmail("")
          setIsSubmitted(false)
          router.push("/thanks")
        }
      } catch (error) {
        console.error("Error sending email:", error)
        // Still proceed to thanks page even if email fails
        onOpenChange(false)
        setEmail("")
        setIsSubmitted(false)
        router.push("/thanks")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleClose = () => {
    setIsSubmitted(false)
    setEmail("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-2xl text-primary">Zoovia is coming soon!</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-center text-muted-foreground">
            Join our waitlist and we'll let you know when Zoovia is live.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? "Joining..." : "Join the waitlist"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
