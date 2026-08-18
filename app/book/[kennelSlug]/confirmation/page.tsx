import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, Mail, Calendar } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/clients"

export default async function ConfirmationPage({
  params,
}: {
  params: { kennelSlug?: string } | Promise<{ kennelSlug?: string }>
}) {
  const resolvedParams = await params
  const slug = resolvedParams?.kennelSlug?.trim()
  if (!slug) {
    notFound()
  }

  let kennel: { name: string; slug: string; phone: string | null; contact_email: string | null } | null = null

  if (process.env.PLAYWRIGHT_MOCKS === "1") {
    // Use stub data in Playwright smoke tests so the page renders without live Supabase.
    kennel = {
      name: "Green Meadows Kennels",
      slug,
      phone: "0117 123 4567",
      contact_email: "hello@greenmeadows.example",
    }
  } else {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from("kennels")
      .select("name, slug, phone, contact_email")
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
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href={`/book/${kennel.slug}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to booking form
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="border-border">
          <CardContent className="p-8 sm:p-12">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mb-3 text-2xl font-semibold text-card-foreground text-balance">
                Request submitted successfully
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-8">
                Thank you for your booking request to {kennel.name}. We&apos;ve received your details and will review
                your
                dates shortly.
              </p>
            </div>

            <div className="space-y-6">
              {/* What happens next */}
              <div className="rounded-lg border border-border bg-muted/50 p-6">
                <h2 className="mb-4 text-base font-medium text-foreground">What happens next</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border border-border">
                      <span className="text-sm font-medium text-foreground">1</span>
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-medium text-foreground">We&apos;ll review your request</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Our team will check availability for your requested dates
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border border-border">
                      <span className="text-sm font-medium text-foreground">2</span>
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-medium text-foreground">You&apos;ll receive an email</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        We typically respond within 24 hours with confirmation or to request more information
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border border-border">
                      <span className="text-sm font-medium text-foreground">3</span>
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-medium text-foreground">Booking confirmed</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Once approved, we&apos;ll send full details and next steps
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-foreground">Questions about your request?</h2>
                <div className="flex flex-col gap-2 text-sm">
                  <a
                    href={`mailto:${kennel.contact_email}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    {kennel.contact_email}
                  </a>
                  <a
                    href={`tel:${kennel.phone}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    {kennel.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <Button asChild variant="outline" className="w-full sm:w-auto bg-transparent">
                <Link href={`/book/${kennel.slug}`}>Submit another request</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
