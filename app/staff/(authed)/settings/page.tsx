"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type SettingsResponse = {
  kennel: {
    id: string
    name: string
    contactEmail: string
    phone: string | null
    postcode: string
    slug: string
  }
  userEmail: string | null
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [kennelName, setKennelName] = useState("")
  const [kennelEmail, setKennelEmail] = useState("")
  const [kennelPhone, setKennelPhone] = useState("")
  const [kennelPostcode, setKennelPostcode] = useState("")
  const [kennelSlug, setKennelSlug] = useState("")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [origin] = useState(() => (typeof window !== "undefined" ? window.location.origin : ""))
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    async function fetchSettings() {
      setLoading(true)
      setError("")
      const response = await fetch("/api/staff/settings")
      if (!response.ok) {
        if (active) {
          setError("Unable to load settings.")
          setLoading(false)
        }
        return
      }
      const data = (await response.json()) as SettingsResponse
      if (!active) return
      setKennelName(data.kennel.name)
      setKennelEmail(data.kennel.contactEmail)
      setKennelPhone(data.kennel.phone ?? "")
      setKennelPostcode(data.kennel.postcode)
      setKennelSlug(data.kennel.slug)
      setUserEmail(data.userEmail)
      setLoading(false)
    }
    fetchSettings()
    return () => {
      active = false
    }
  }, [])

  const bookingUrl = useMemo(() => {
    if (!kennelSlug || !origin) return ""
    return `${origin}/book/${kennelSlug}`
  }, [kennelSlug, origin])

  function copyToClipboard() {
    if (!bookingUrl) {
      toast({
        title: "Booking URL unavailable",
        description: "We couldn&apos;t find your booking URL yet.",
        variant: "destructive",
      })
      return
    }
    navigator.clipboard.writeText(bookingUrl)
    toast({
      title: "Copied!",
      description: "Booking page URL copied to clipboard",
    })
  }

  async function saveKennelProfile() {
    setSavingProfile(true)
    const response = await fetch("/api/staff/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: kennelName,
        contactEmail: kennelEmail,
        phone: kennelPhone.trim().length === 0 ? null : kennelPhone,
        postcode: kennelPostcode,
      }),
    })

    if (!response.ok) {
      toast({
        title: "Could not save profile",
        description: "Please check the details and try again.",
        variant: "destructive",
      })
      setSavingProfile(false)
      return
    }

    const data = (await response.json()) as { kennel: SettingsResponse["kennel"] }
    setKennelName(data.kennel.name)
    setKennelEmail(data.kennel.contactEmail)
    setKennelPhone(data.kennel.phone ?? "")
    setKennelPostcode(data.kennel.postcode)
    setKennelSlug(data.kennel.slug)
    toast({
      title: "Profile updated",
      description: "Your kennel profile has been saved.",
    })
    setSavingProfile(false)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your kennel profile and preferences</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {error && (
            <Card className="border-border">
              <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
            </Card>
          )}
          {/* Booking Page */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Your booking page</CardTitle>
              <CardDescription>Share this link with customers to accept booking requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={bookingUrl} readOnly className="font-mono text-sm bg-muted" />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="icon"
                  className="shrink-0 bg-transparent"
                  disabled={!bookingUrl}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy URL</span>
                </Button>
              </div>
              {bookingUrl ? (
                <Button asChild variant="link" className="h-auto p-0 text-sm">
                  <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                    Preview your booking page
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Booking URL will appear once settings load.</p>
              )}
            </CardContent>
          </Card>

          {/* Kennel Profile */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Kennel profile</CardTitle>
              <CardDescription>This information appears on your booking page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kennel-name">Kennel name</Label>
                <Input
                  id="kennel-name"
                  value={kennelName}
                  onChange={(e) => setKennelName(e.target.value)}
                  disabled={loading || savingProfile}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="kennel-email">Email</Label>
                  <Input
                    id="kennel-email"
                    type="email"
                    value={kennelEmail}
                    onChange={(e) => setKennelEmail(e.target.value)}
                    disabled={loading || savingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kennel-phone">Phone</Label>
                  <Input
                    id="kennel-phone"
                    type="tel"
                    value={kennelPhone}
                    onChange={(e) => setKennelPhone(e.target.value)}
                    disabled={loading || savingProfile}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kennel-postcode">Postcode</Label>
                <Input
                  id="kennel-postcode"
                  value={kennelPostcode}
                  onChange={(e) => setKennelPostcode(e.target.value)}
                  disabled={loading || savingProfile}
                />
              </div>
              <Button onClick={saveKennelProfile} disabled={loading || savingProfile}>
                {savingProfile ? "Saving..." : "Save profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Account */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Account</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Password</p>
                  <p className="text-sm text-muted-foreground">Reset your password via email.</p>
                </div>
                <Button variant="outline" className="bg-transparent" asChild>
                  <Link href="/staff/forgot-password">Change password</Link>
                </Button>
              </div>
              <Separator />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Email address</p>
                  <p className="text-sm text-muted-foreground">{userEmail ?? "Not available"}</p>
                </div>
                <Button variant="outline" className="bg-transparent">
                  Change email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Danger zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Delete account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
                >
                  Delete account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
