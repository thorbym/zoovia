import { notFound } from "next/navigation"
import { BookingForm } from "@/components/booking-form"
import { Shield, Clock, CheckCircle } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/clients"

export default async function BookingPage({
  params,
}: {
  params: { kennelSlug?: string } | Promise<{ kennelSlug?: string }>
}) {
  const resolvedParams = await params
  const slug = resolvedParams?.kennelSlug?.trim()
  if (!slug) {
    notFound()
  }

  let kennel: { name: string; slug: string; postcode: string } | null = null

  if (process.env.PLAYWRIGHT_MOCKS === "1") {
    // Use stub data in Playwright smoke tests so the page renders without live Supabase.
    kennel = { name: "Green Meadows Kennels", slug, postcode: "BS1 4DJ" }
  } else {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from("organisations")
      .select("name, slug, postcode")
      .ilike("slug", slug)
      .single()
    kennel = data ?? null
  }

  if (!kennel) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-foreground text-balance">{kennel.name}</h1>
            <p className="text-sm text-muted-foreground">{kennel.postcode}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <BookingForm kennelSlug={kennel.slug} />
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-medium text-card-foreground">How it works</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Clock className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-card-foreground">Submit your request</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Tell us about your dog and preferred dates
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Shield className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-card-foreground">We&apos;ll review availability</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Staff will check if we can accommodate your dates
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                    <CheckCircle className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-card-foreground">Get confirmation</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We&apos;ll confirm via email, usually within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-accent/40 bg-accent/20 p-4">
              <p className="text-sm text-accent-foreground leading-relaxed">
                <strong className="font-medium">Please note:</strong> This is a booking request, not an instant
                confirmation. We&apos;ll review your dates and get back to you shortly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
