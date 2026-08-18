"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle, Copy, ExternalLink, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function SuccessContent() {
  const searchParams = useSearchParams()
  const kennelSlug = searchParams.get("slug") || "your-kennel"
  const bookingUrl = `https://kennelbook.app/book/${kennelSlug}`
  const { toast } = useToast()

  function copyToClipboard() {
    navigator.clipboard.writeText(bookingUrl)
    toast({
      title: "Copied!",
      description: "Booking page URL copied to clipboard",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <CheckCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Setup complete</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="border-border">
          <CardContent className="p-8 sm:p-12">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mb-3 text-2xl font-semibold text-card-foreground text-balance">
                Your booking page is live!
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                Share this link with customers so they can submit booking requests.
              </p>
            </div>

            {/* Booking URL */}
            <div className="mb-8 space-y-3">
              <label className="text-sm font-medium text-foreground">Your booking page URL</label>
              <div className="flex gap-2">
                <Input value={bookingUrl} readOnly className="font-mono text-sm bg-muted" />
                <Button onClick={copyToClipboard} variant="outline" size="icon" className="shrink-0 bg-transparent">
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy URL</span>
                </Button>
              </div>
              <Button asChild variant="link" className="h-auto p-0 text-sm">
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                  Preview your booking page
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>

            {/* Next steps */}
            <div className="rounded-lg border border-border bg-muted/50 p-6">
              <h2 className="mb-4 text-base font-medium text-foreground">Next steps</h2>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground leading-relaxed">
                    Add this link to your website, social media, or email signature
                  </span>
                </li>
                <li className="flex gap-3 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground leading-relaxed">
                    Check your email for login credentials and important setup info
                  </span>
                </li>
                <li className="flex gap-3 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground leading-relaxed">
                    Sign in to your dashboard to manage requests and set availability
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="flex-1">
                <Link href="/staff/inbox">
                  Go to your dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                  View booking page
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
