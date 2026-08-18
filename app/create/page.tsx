"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Calendar, Check } from "lucide-react"

const STEPS = ["Account", "Kennel details", "Capacity", "Complete"]

export default function CreatePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [kennelSlug, setKennelSlug] = useState("")
  const [error, setError] = useState("")
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    kennelName: "",
    postcode: "",
    phone: "",
    maxDogsTotal: 20,
    minNoticeDays: 2,
  })

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    if (currentStep === STEPS.length - 1) {
      const payload = {
        email: formValues.email.trim(),
        password: formValues.password,
        kennelName: formValues.kennelName.trim(),
        kennelSlug: kennelSlug || formValues.kennelName.trim(),
        postcode: formValues.postcode.trim(),
        phone: formValues.phone.trim() || undefined,
        maxDogsTotal: Number(formValues.maxDogsTotal),
        minNoticeDays: Number(formValues.minNoticeDays || 0),
      }

      const response = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data?.error || "Could not create your account")
        setIsSubmitting(false)
        return
      }

      const data = await response.json()
      router.push(`/create/success?slug=${data.slug}`)
    } else {
      setCurrentStep((prev) => prev + 1)
      setIsSubmitting(false)
    }
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-2xl font-semibold text-foreground text-balance">Create your booking page</h1>
          <p className="text-sm text-muted-foreground">Takes about 2 minutes to set up</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                      index < currentStep
                        ? "border-primary bg-primary text-primary-foreground"
                        : index === currentStep
                          ? "border-primary bg-background text-primary"
                          : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`hidden text-xs sm:block ${
                      index <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 transition-colors ${
                      index < currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleNext} className="space-y-6">
              {/* Step 0: Account */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="mb-4 text-lg font-medium text-card-foreground">Create your account</h2>
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email address <span className="text-destructive">*</span>
                  </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@yourkennels.co.uk"
                      value={formValues.email}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      We&apos;ll send your login details and booking notifications here
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formValues.password}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">At least 8 characters</p>
                  </div>
                </div>
              )}

              {/* Step 1: Kennel Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="mb-4 text-lg font-medium text-card-foreground">Tell us about your kennel</h2>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kennel-name">
                      Kennel name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="kennel-name"
                      name="kennel-name"
                      placeholder="e.g. Green Meadows Kennels"
                      required
                      value={formValues.kennelName}
                      onChange={(e) => {
                        const name = e.target.value
                        const slug = name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                        setFormValues((prev) => ({ ...prev, kennelName: name }))
                        setKennelSlug(slug)
                      }}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                    <Label htmlFor="postcode">
                      Postcode <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="postcode"
                      name="postcode"
                      placeholder="e.g. BS1 4DJ"
                      value={formValues.postcode}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, postcode: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="e.g. 01234 567890"
                      value={formValues.phone}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                {kennelSlug && (
                    <div className="rounded-lg border border-accent/40 bg-accent/20 p-3">
                      <p className="text-xs text-accent-foreground">
                        <strong className="font-medium">Your booking page will be:</strong>{" "}
                        <span className="break-all">kennelbook.app/book/{kennelSlug}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Capacity */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="mb-2 text-lg font-medium text-card-foreground">Capacity settings</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      These help us show availability signals. You can always adjust bookings manually.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-dogs">
                      Maximum dogs at once <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="max-dogs"
                      name="max-dogs"
                      type="number"
                      min="1"
                      value={formValues.maxDogsTotal}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, maxDogsTotal: Number(e.target.value || 0) }))
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">Total capacity across all kennel spaces</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notice-days">Minimum notice (days)</Label>
                    <Input
                      id="notice-days"
                      name="notice-days"
                      type="number"
                      min="0"
                      value={formValues.minNoticeDays}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, minNoticeDays: Number(e.target.value || 0) }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      How many days ahead customers should request (0 for same-day)
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Complete */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="mb-2 text-lg font-medium text-card-foreground">Almost there!</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Review your details and we&apos;ll create your booking page.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
                {error && (
                  <div className="w-full rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {currentStep > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="bg-transparent"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}
                <Button type="submit" disabled={isSubmitting} className="sm:ml-auto">
                  {isSubmitting
                    ? "Processing..."
                    : currentStep === STEPS.length - 1
                      ? "Create my booking page"
                      : "Continue"}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
