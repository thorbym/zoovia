import Link from "next/link"
import { MapPin } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/clients"
import { resolveLocation, type ResolvedLocation } from "@/lib/geo/resolve-location"
import { KENNELS_SEARCH_PAGE_SIZE, searchKennelsByLocation } from "@/lib/kennels/search"
import { KennelsSearchBar } from "@/components/kennels-search-bar"
import { KennelResultsList } from "@/components/kennel-results-list"
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
  searchParams:
    | { q?: string; lat?: string; lng?: string; label?: string; page?: string }
    | Promise<{ q?: string; lat?: string; lng?: string; label?: string; page?: string }>
}) {
  const resolvedParams = await searchParams
  const q = resolvedParams?.q?.trim() ?? ""
  const lat = resolvedParams?.lat ? Number(resolvedParams.lat) : null
  const lng = resolvedParams?.lng ? Number(resolvedParams.lng) : null
  const label = resolvedParams?.label?.trim() ?? ""
  const page = Math.max(1, Number(resolvedParams?.page) || 1)

  const hasCoords = lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng)
  const displayQuery = label || q
  const isLocationSearch = hasCoords || q.length > 0

  let results: (OrgRow & { distance?: number })[]
  let total: number
  let resolvedLocation: ResolvedLocation | null = null

  if (isLocationSearch) {
    resolvedLocation = hasCoords ? { latitude: lat as number, longitude: lng as number } : await resolveLocation(q)

    if (resolvedLocation) {
      const searchResult = await searchKennelsByLocation(resolvedLocation, 0, KENNELS_SEARCH_PAGE_SIZE)
      results = searchResult.results
      total = searchResult.total
    } else {
      total = 0
      results = []
    }
  } else {
    const supabase = await createSupabaseServerClient()
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
  const searchQueryParams: Record<string, string> = hasCoords
    ? { lat: String(lat), lng: String(lng), ...(label ? { label } : {}) }
    : q
      ? { q }
      : {}
  const pageHref = (targetPage: number) =>
    `/kennels?${new URLSearchParams({ ...searchQueryParams, page: String(targetPage) })}`

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-2xl font-semibold text-balance text-foreground">Find a kennel</h1>
          <KennelsSearchBar defaultValue={hasCoords ? { label: displayQuery, lat: lat as number, lng: lng as number } : null} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {isLocationSearch && results.length === 0 && (
          <p className="text-muted-foreground">
            We couldn&apos;t find &ldquo;{displayQuery}&rdquo; or any kennels near it. Try a UK postcode or town
            name.
          </p>
        )}

        {isLocationSearch ? (
          <KennelResultsList
            key={resolvedLocation ? `${resolvedLocation.latitude},${resolvedLocation.longitude}` : "none"}
            initialResults={results}
            total={total}
            location={resolvedLocation ? { lat: resolvedLocation.latitude, lng: resolvedLocation.longitude } : null}
          />
        ) : (
          <>
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
          </>
        )}
      </main>
    </div>
  )
}
