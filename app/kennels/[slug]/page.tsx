import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Phone, MapPin, ShieldCheck } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/clients"
import { KennelProfileActions } from "@/components/kennel-profile-actions"
import { Badge } from "@/components/ui/badge"

export const revalidate = 3600

type Kennel = {
  name: string
  slug: string
  licence_region: string | null
  street_address: string | null
  locality: string | null
  region: string | null
  postcode: string
  telephone: string | null
  website: string | null
  claim_status: string
}

async function getKennel(slug: string): Promise<Kennel | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("organisations")
    .select("name, slug, licence_region, street_address, locality, region, postcode, telephone, website, claim_status")
    .ilike("slug", slug)
    .single()
  return data ?? null
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const kennel = await getKennel(slug)
  if (!kennel) return {}

  const place = [kennel.locality, kennel.postcode].filter(Boolean).join(", ")
  return {
    title: `${kennel.name} — Kennel Boarding in ${place} | Zoovia`,
    description: `${kennel.name} is a licensed dog boarding kennel in ${place}${
      kennel.licence_region ? `, licensed by ${kennel.licence_region}` : ""
    }.`,
  }
}

export default async function KennelProfilePage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>
}) {
  const { slug } = await params
  const kennel = await getKennel(slug)
  if (!kennel) notFound()

  const address = [kennel.street_address, kennel.locality, kennel.region, kennel.postcode].filter(Boolean).join(", ")
  const shortLocation = [kennel.locality, kennel.postcode].filter(Boolean).join(", ")
  const isClaimed = kennel.claim_status === "claimed"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-balance text-foreground">{kennel.name}</h1>
            <Badge variant={isClaimed ? "default" : "outline"}>{isClaimed ? "Claimed" : "Unclaimed"}</Badge>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            {address}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {!isClaimed && (
              <div className="rounded-lg border border-accent/40 bg-accent/20 p-4 text-sm text-accent-foreground">
                This listing hasn&apos;t been claimed by its operator yet. Details shown are from the public AAL
                licence register.
              </div>
            )}

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-medium text-card-foreground">Details</h2>
              <dl className="space-y-3 text-sm">
                {kennel.licence_region && (
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <dt className="text-muted-foreground">Licensed by</dt>
                      <dd className="text-card-foreground">{kennel.licence_region}</dd>
                    </div>
                  </div>
                )}
                {kennel.telephone && (
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <dt className="text-muted-foreground">Phone</dt>
                      <dd className="text-card-foreground">{kennel.telephone}</dd>
                    </div>
                  </div>
                )}
                {kennel.website && (
                  <div>
                    <dt className="text-muted-foreground">Website</dt>
                    <dd>
                      <a
                        href={kennel.website}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-card-foreground underline"
                      >
                        {kennel.website}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div>
            <KennelProfileActions name={kennel.name} slug={kennel.slug} location={shortLocation} isClaimed={isClaimed} />
          </div>
        </div>
      </main>
    </div>
  )
}
