"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type KennelResultCard = {
  id: string
  name: string
  slug: string
  locality: string | null
  region: string | null
  postcode: string
  claim_status: string
  distance?: number
}

export function KennelResultsList({
  initialResults,
  total,
  location,
}: {
  initialResults: KennelResultCard[]
  total: number
  location: { lat: number; lng: number } | null
}) {
  const [results, setResults] = useState(initialResults)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const hasMore = results.length < total

  const loadMore = async () => {
    if (!location || loading) return
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams({
        lat: String(location.lat),
        lng: String(location.lng),
        offset: String(results.length),
      })
      const response = await fetch(`/api/kennels/search?${params}`)
      if (!response.ok) throw new Error("Request failed")
      const data: { results: KennelResultCard[] } = await response.json()
      setResults((prev) => [...prev, ...data.results])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
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
                {typeof org.distance === "number" && (
                  <p className="mt-1 text-sm text-muted-foreground">{org.distance.toFixed(1)} miles away</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Loading…" : "Load more"}
          </Button>
          {error && <p className="text-sm text-destructive">Couldn&apos;t load more kennels. Try again.</p>}
        </div>
      )}
    </>
  )
}
