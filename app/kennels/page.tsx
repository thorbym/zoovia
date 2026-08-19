import Link from "next/link"
import { MapPin } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/clients"
import { resolveLocation, distanceInMiles } from "@/lib/geo/resolve-location"
import { KennelSearchForm } from "@/components/kennel-search-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const PAGE_SIZE = 24

type OrgRow = {
  id: string
  name: string
  slug: string
  locality: string | null
  region: string | null
  postcode: string
  latitude: number | null
  longitude: number | null
  claim_status: string
}

export const metadata = {
  title: "Find a kennel | Zoovia",
  description: "Search licensed UK dog boarding kennels by postcode or area.",
}

export default async function KennelsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string } | Promise<{ q?: string; page?: string }>
}) {
  const resolvedParams = await searchParams
  const q = resolvedParams?.q?.trim() ?? ""
  const page = Math.max(1, Number(resolvedParams?.page) || 1)

  const supabase = await createSupabaseServerClient()

  let results: (OrgRow & { distance?: number })[]
  let total: number

  if (q) {
    const location = await resolveLocation(q)

    if (location) {
      const { data } = await supabase
        .from("organisations")
        .select("id, name, slug, locality, region, postcode, latitude, longitude, claim_status")
        .not("latitude", "is", null)

      const withDistance = ((data ?? []) as OrgRow[]).map((org) => ({
        ...org,
        distance: distanceInMiles(location, { latitude: org.latitude!, longitude: org.longitude! }),
      }))
      withDistance.sort((a, b) => a.distance - b.distance)

      total = withDistance.length
      results = withDistance.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    } else {
      total = 0
      results = []
    }
  } else {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, count } = await supabase
      .from("organisations")
      .select("id, name, slug, locality, region, postcode, latitude, longitude, claim_status", { count: "exact" })
      .order("name", { ascending: true })
      .range(from, to)

    results = (data ?? []) as OrgRow[]
    total = count ?? 0
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageHref = (targetPage: number) =>
    `/kennels?${new URLSearchParams({ ...(q ? { q } : {}), page: String(targetPage) })}`

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-2xl font-semibold text-balance text-foreground">Find a kennel</h1>
          <KennelSearchForm defaultValue={q} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {q && results.length === 0 && (
          <p className="text-muted-foreground">
            We couldn&apos;t find &ldquo;{q}&rdquo; or any kennels near it. Try a UK postcode or town name.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((org) => (
            <Link key={org.id} href={`/kennels/${org.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span>{org.name}</span>
                    {org.claim_status === "unclaimed" && (
                      <Badge variant="outline" className="shrink-0">
                        Unclaimed
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {[org.locality, org.postcode].filter(Boolean).join(", ")}
                  </p>
                  {typeof org.distance === "number" && (
                    <p className="mt-1 text-sm text-muted-foreground">{org.distance.toFixed(1)} miles away</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            {page > 1 && (
              <Link href={pageHref(page - 1)} className="text-sm text-foreground underline">
                Previous
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link href={pageHref(page + 1)} className="text-sm text-foreground underline">
                Next
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
